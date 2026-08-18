process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({
  query: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

describe("POST /api/auth/login", () => {
  beforeEach(() => query.mockReset());

  it("rejects an unknown employee ID with the same generic message as a wrong password", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post("/api/auth/login").send({ employeeId: "GHOST", password: "whatever1" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("The employee ID or password is incorrect.");
  });

  it("rejects a correct employee ID with a wrong password using the identical message", async () => {
    const hash = await bcrypt.hash("realpassword", 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, employee_code: "RAHUL", password_hash: hash, status: "Active", is_super_admin: true, permissions: {} }] });
    const res = await request(app).post("/api/auth/login").send({ employeeId: "RAHUL", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("The employee ID or password is incorrect.");
  });

  it("blocks a disabled account even with the correct password", async () => {
    const hash = await bcrypt.hash("realpassword", 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, employee_code: "RAHUL", password_hash: hash, status: "Disabled", is_super_admin: false, permissions: {} }] });
    const res = await request(app).post("/api/auth/login").send({ employeeId: "RAHUL", password: "realpassword" });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/disabled/i);
  });

  it("issues a token for a correct, active login", async () => {
    const hash = await bcrypt.hash("realpassword", 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, employee_code: "RAHUL", name: "Rahul", role: "Super Admin", password_hash: hash, status: "Active", is_super_admin: true, permissions: {} }] });
    const res = await request(app).post("/api/auth/login").send({ employeeId: "rahul", password: "realpassword" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.employee.employeeCode).toBe("RAHUL");
  });
});

describe("requirePermission blocks resource access without the specific grant", () => {
  beforeEach(() => query.mockReset());

  const jwt = require("jsonwebtoken");
  const authHeader = (id = 2) => `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET)}`;

  it("blocks creating a customer without customers:create permission", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 2, employee_code: "PRIYA", name: "Priya", role: "Sales", is_super_admin: false, permissions: { customers: ["read"] }, status: "Active" }],
    });
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", authHeader())
      .send({ name: "Test Customer", phone: "9000000000" });
    expect(res.status).toBe(403);
    expect(query).toHaveBeenCalledTimes(1); // never reached the INSERT
  });

  it("allows creating a customer with customers:create permission", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 2, employee_code: "PRIYA", name: "Priya", role: "Sales", is_super_admin: false, permissions: { customers: ["create"] }, status: "Active" }] })
      .mockResolvedValueOnce({ rows: [{ id: 9, name: "Test Customer", phone: "9000000000" }] });
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", authHeader())
      .send({ name: "Test Customer", phone: "9000000000" });
    expect(res.status).toBe(201);
  });

  it("a super admin bypasses granular permission checks entirely", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 1, employee_code: "RAHUL", name: "Rahul", role: "Super Admin", is_super_admin: true, permissions: {}, status: "Active" }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/customers").set("Authorization", `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}`);
    expect(res.status).toBe(200);
  });
});

describe("requireAuth rejects a disabled account mid-session, not just at login", () => {
  beforeEach(() => query.mockReset());
  const jwt = require("jsonwebtoken");

  it("rejects a request from an account that was disabled after the token was issued", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 2, employee_code: "PRIYA", name: "Priya", role: "Sales", is_super_admin: false, permissions: {}, status: "Disabled" }] });
    const res = await request(app).get("/api/customers").set("Authorization", `Bearer ${jwt.sign({ id: 2 }, process.env.JWT_SECRET)}`);
    expect(res.status).toBe(403);
  });
});
