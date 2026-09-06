process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({ query: jest.fn() }));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

const token = `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}`;

function mockAuth({ isSuperAdmin = false, permissions = {} } = {}) {
  query.mockResolvedValueOnce({
    rows: [{ id: 1, employee_code: "E1", name: "Admin", role: "CRM", is_super_admin: isSuperAdmin, permissions, status: "Active" }],
  });
}

const validBody = {
  customerName: "Asha Rao",
  amount: 45000,
  paymentMode: "UPI",
  referenceNo: "T2309XYZ",
  receivedOn: "2026-09-07",
  towards: "Advance for modular kitchen",
};

beforeEach(() => query.mockReset());

describe("auth & permissions", () => {
  it("rejects an unauthenticated list", async () => {
    const res = await request(app).get("/api/receipts");
    expect(res.status).toBe(401);
  });

  it("rejects an employee without the receipts:read permission", async () => {
    mockAuth({ permissions: { leads: ["read"] } });
    const res = await request(app).get("/api/receipts").set("Authorization", token);
    expect(res.status).toBe(403);
  });

  it("rejects create without receipts:create", async () => {
    mockAuth({ permissions: { receipts: ["read"] } });
    const res = await request(app).post("/api/receipts").set("Authorization", token).send(validBody);
    expect(res.status).toBe(403);
  });

  it("lets a super admin through", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/receipts").set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/receipts", () => {
  it("validates the payload", async () => {
    mockAuth({ isSuperAdmin: true });
    const res = await request(app).post("/api/receipts").set("Authorization", token).send({ customerName: "X" });
    expect(res.status).toBe(400);
  });

  it("rejects a non-positive amount", async () => {
    mockAuth({ isSuperAdmin: true });
    const res = await request(app)
      .post("/api/receipts")
      .set("Authorization", token)
      .send({ ...validBody, amount: 0 });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown payment mode", async () => {
    mockAuth({ isSuperAdmin: true });
    const res = await request(app)
      .post("/api/receipts")
      .set("Authorization", token)
      .send({ ...validBody, paymentMode: "Barter" });
    expect(res.status).toBe(400);
  });

  it("numbers the receipt and stores the amount in words, computed server-side", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [{ receipt_no: "AU-RCPT-2026-000004" }] }); // nextReceiptNo lookup
    query.mockResolvedValueOnce({ rows: [{ id: 9 }] }); // INSERT
    query.mockResolvedValueOnce({ rows: [{ id: 9, receiptNo: "AU-RCPT-2026-000005", amountInWords: "x" }] }); // re-read

    const res = await request(app).post("/api/receipts").set("Authorization", token).send(validBody);

    expect(res.status).toBe(201);
    const insertParams = query.mock.calls[2][1];
    expect(insertParams[0]).toBe("AU-RCPT-2026-000005"); // continues the series
    expect(insertParams).toContain("Rupees Forty Five Thousand only"); // words are not trusted from the client
  });

  it("starts the series at 000001 when the year has no receipts yet", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [] }); // no prior receipts this year
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    await request(app).post("/api/receipts").set("Authorization", token).send(validBody);
    expect(query.mock.calls[2][1][0]).toMatch(/^AU-RCPT-\d{4}-000001$/);
  });
});

describe("PATCH /api/receipts/:id", () => {
  it("404s for an unknown receipt", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [] }); // SELECT status
    const res = await request(app).patch("/api/receipts/123").set("Authorization", token).send(validBody);
    expect(res.status).toBe(404);
  });

  it("refuses to edit a cancelled receipt", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [{ status: "Cancelled" }] });
    const res = await request(app).patch("/api/receipts/1").set("Authorization", token).send(validBody);
    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/receipts/:id/status", () => {
  it("cancels a receipt without deleting it", async () => {
    mockAuth({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // UPDATE ... RETURNING
    query.mockResolvedValueOnce({ rows: [{ id: 1, status: "Cancelled" }] }); // re-read

    const res = await request(app).patch("/api/receipts/1/status").set("Authorization", token).send({ status: "Cancelled" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Cancelled");
  });

  it("rejects a bogus status", async () => {
    mockAuth({ isSuperAdmin: true });
    const res = await request(app).patch("/api/receipts/1/status").set("Authorization", token).send({ status: "Paid" });
    expect(res.status).toBe(400);
  });
});
