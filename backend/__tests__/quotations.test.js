/**
 * Quotation route coverage, with a focus on the transaction/connection
 * handling in POST and PATCH.
 *
 * Regression: PATCH used to call client.release() on its 404 and 409 early
 * returns AND again in `finally`. The second release throws
 * "Release called on client which has already been released to the pool",
 * which — happening after the response was sent — took the whole process
 * down. Verified live during the pre-deploy audit.
 */

process.env.JWT_SECRET = "test-secret";

const mockReleased = { count: 0 };
const mockClient = {
  query: jest.fn(),
  release: jest.fn(() => {
    mockReleased.count += 1;
    if (mockReleased.count > 1) {
      // Mirror node-postgres: releasing twice is an error.
      throw new Error("Release called on client which has already been released to the pool.");
    }
  }),
};

jest.mock("../lib/db", () => {
  const query = jest.fn();
  return {
    query, // used by auth middleware and the post-commit re-read
    getPool: jest.fn(() => ({ query, connect: jest.fn(async () => mockClient) })),
  };
});

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

const token = `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}`;

function mockSuperAdmin() {
  query.mockResolvedValueOnce({
    rows: [{ id: 1, employee_code: "E1", name: "Admin", role: "Super Admin", is_super_admin: true, permissions: {}, status: "Active" }],
  });
}

const validBody = {
  customerName: "Asha Rao",
  projectName: "Flat 4B",
  items: [{ itemName: "Modular kitchen", groupName: "Kitchen", quantity: 1, unit: "job", unitPrice: 250000 }],
};

beforeEach(() => {
  query.mockReset();
  mockClient.query.mockReset();
  mockClient.release.mockClear();
  mockReleased.count = 0;
});

describe("PATCH /api/quotations/:id — connection handling", () => {
  it("returns 404 for an unknown quotation and releases the client exactly once", async () => {
    mockSuperAdmin();
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // SELECT status -> none

    const res = await request(app).patch("/api/quotations/99999999").set("Authorization", token).send(validBody);

    expect(res.status).toBe(404);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("returns 409 for a non-draft quotation and releases the client exactly once", async () => {
    mockSuperAdmin();
    mockClient.query.mockResolvedValueOnce({ rows: [{ status: "Sent" }] });

    const res = await request(app).patch("/api/quotations/5").set("Authorization", token).send(validBody);

    expect(res.status).toBe(409);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("never opens a transaction on the early-return paths", async () => {
    mockSuperAdmin();
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    await request(app).patch("/api/quotations/1").set("Authorization", token).send(validBody);

    const statements = mockClient.query.mock.calls.map((c) => c[0]);
    expect(statements.some((s) => /BEGIN/.test(s))).toBe(false);
    expect(statements.some((s) => /ROLLBACK/.test(s))).toBe(false);
  });

  it("commits and re-reads on a successful draft edit", async () => {
    mockSuperAdmin();
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ status: "Draft" }] }) // SELECT status
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // UPDATE
      .mockResolvedValueOnce({}) // DELETE items
      .mockResolvedValueOnce({}) // INSERT item
      .mockResolvedValueOnce({}); // COMMIT
    query.mockResolvedValueOnce({ rows: [{ id: 1, quotationNo: "AU-2026-000001", grandTotal: 295000 }] }); // re-read

    const res = await request(app).patch("/api/quotations/1").set("Authorization", token).send(validBody);

    expect(res.status).toBe(200);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
    const statements = mockClient.query.mock.calls.map((c) => c[0]);
    expect(statements).toEqual(expect.arrayContaining([expect.stringMatching(/BEGIN/), expect.stringMatching(/COMMIT/)]));
  });

  it("rolls back once when a statement inside the transaction fails", async () => {
    mockSuperAdmin();
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ status: "Draft" }] }) // SELECT status
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("update failed")) // UPDATE throws
      .mockResolvedValueOnce({}); // ROLLBACK

    const res = await request(app).patch("/api/quotations/1").set("Authorization", token).send(validBody);

    expect(res.status).toBe(500);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
    expect(mockClient.query.mock.calls.map((c) => c[0])).toEqual(expect.arrayContaining([expect.stringMatching(/ROLLBACK/)]));
  });
});

describe("POST /api/quotations — validation", () => {
  it("rejects a quotation with no line items", async () => {
    mockSuperAdmin();
    const res = await request(app)
      .post("/api/quotations")
      .set("Authorization", token)
      .send({ ...validBody, items: [] });
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/quotations").send(validBody);
    expect(res.status).toBe(401);
  });
});
