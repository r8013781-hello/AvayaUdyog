process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({
  query: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

function authHeader(id = 1) {
  const token = jwt.sign({ id, employeeCode: "RAHUL" }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

const superAdminRow = { id: 1, employee_code: "RAHUL", name: "Rahul", role: "Super Admin", is_super_admin: true, permissions: {}, status: "Active" };
const regularAdminRow = { id: 2, employee_code: "PRIYA", name: "Priya", role: "Sales", is_super_admin: false, permissions: { leads: ["read"] }, status: "Active" };

describe("Employee management is super-admin-only", () => {
  beforeEach(() => query.mockReset());

  it("blocks a non-super-admin from listing employees", async () => {
    query.mockResolvedValueOnce({ rows: [regularAdminRow] }); // requireAuth's own lookup
    const res = await request(app).get("/api/employees").set("Authorization", authHeader(2));
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/super admin/i);
  });

  it("allows a super admin to list employees", async () => {
    query
      .mockResolvedValueOnce({ rows: [superAdminRow] }) // requireAuth lookup
      .mockResolvedValueOnce({ rows: [superAdminRow, regularAdminRow] }); // the actual SELECT
    const res = await request(app).get("/api/employees").set("Authorization", authHeader(1));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("rejects creating an employee with a password shorter than 8 characters", async () => {
    query.mockResolvedValueOnce({ rows: [superAdminRow] }); // requireAuth lookup
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", authHeader(1))
      .send({ employeeCode: "NEWBIE", name: "New Person", password: "short1" });
    expect(res.status).toBe(400);
    expect(query).toHaveBeenCalledTimes(1); // never reached the DB — rejected by validation first
  });
});

describe("Last-super-admin safety guards", () => {
  beforeEach(() => query.mockReset());

  it("refuses to delete your own account, even as super admin", async () => {
    query.mockResolvedValueOnce({ rows: [superAdminRow] }); // requireAuth lookup
    const res = await request(app).delete("/api/employees/1").set("Authorization", authHeader(1));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/own account/i);
  });

  it("refuses to delete the last active super admin", async () => {
    query
      .mockResolvedValueOnce({ rows: [superAdminRow] }) // requireAuth lookup (acting as RAHUL, id 1)
      .mockResolvedValueOnce({ rows: [{ id: 3, is_super_admin: true }] }) // target lookup: employee 3 is also a super admin
      .mockResolvedValueOnce({ rows: [{ count: 0 }] }); // no OTHER active super admins besides the target
    const res = await request(app).delete("/api/employees/3").set("Authorization", authHeader(1));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one active super admin/i);
  });

  it("refuses to demote the last active super admin to a regular admin", async () => {
    query
      .mockResolvedValueOnce({ rows: [superAdminRow] }) // requireAuth lookup
      .mockResolvedValueOnce({ rows: [{ id: 3, is_super_admin: true }] }) // target lookup
      .mockResolvedValueOnce({ rows: [{ count: 0 }] }); // no other active super admins
    const res = await request(app)
      .patch("/api/employees/3")
      .set("Authorization", authHeader(1))
      .send({ isSuperAdmin: false });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one active super admin/i);
  });

  it("allows deleting a super admin when another active one remains", async () => {
    query
      .mockResolvedValueOnce({ rows: [superAdminRow] }) // requireAuth lookup
      .mockResolvedValueOnce({ rows: [{ id: 3, is_super_admin: true }] }) // target lookup
      .mockResolvedValueOnce({ rows: [{ count: 1 }] }) // another active super admin exists
      .mockResolvedValueOnce({ rows: [] }); // the DELETE itself
    const res = await request(app).delete("/api/employees/3").set("Authorization", authHeader(1));
    expect(res.status).toBe(204);
  });
});
