process.env.JWT_SECRET = "test-secret";

// Mock the pg-based db module.
jest.mock("../lib/db", () => ({
  query: jest.fn(),
  getPool: jest.fn(),
}));

const jwt     = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app     = require("../server");

function authHeader() {
  const token = jwt.sign(
    { id: 1, employeeCode: "RAHUL", name: "Rahul", role: "CRM Administrator" },
    process.env.JWT_SECRET,
  );
  return `Bearer ${token}`;
}

describe("POST /api/enquiries", () => {
  beforeEach(() => query.mockReset());

  it("rejects a submission missing required fields", async () => {
    const res = await request(app).post("/api/enquiries").send({ name: "Priya" });
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("creates a lead with source Website for a valid submission", async () => {
    // pg returns { rows: [...] }
    query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Priya", createdAt: "2026-08-08T00:00:00.000Z" }],
    });

    const res = await request(app).post("/api/enquiries").send({
      name:    "Priya",
      phone:   "9999999999",
      email:   "priya@example.com",
      city:    "Kolkata",
      address: "Ballygunge",
      message: "3BHK interiors",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, name: "Priya", createdAt: "2026-08-08T00:00:00.000Z" });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toMatch(/INSERT INTO leads/);
    expect(query.mock.calls[0][0]).toMatch(/'Website'/);
  });
});

describe("GET /api/leads", () => {
  beforeEach(() => query.mockReset());

  it("requires authentication", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(401);
  });

  it("returns leads for an authenticated request", async () => {
    // pg returns { rows: [...] }
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya", stage: "New" }] });

    const res = await request(app)
      .get("/api/leads")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "Priya", stage: "New" }]);
  });
});
