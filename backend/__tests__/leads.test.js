process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({
  query: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

function authHeader() {
  const token = jwt.sign({ id: 1, employeeCode: "RAHUL", name: "Rahul", role: "CRM Administrator" }, process.env.JWT_SECRET);
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
    query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Priya", createdAt: "2026-08-08T00:00:00.000Z" }],
    });

    const res = await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      email: "priya@example.com",
      city: "Kolkata",
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

describe("POST /api/enquiries — project type", () => {
  beforeEach(() => query.mockReset());

  it("stores a valid project type against the lead", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya", createdAt: "2026-09-02T00:00:00.000Z" }] });

    await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      project_type: "Modular Kitchen",
    });

    expect(query.mock.calls[0][1]).toContain("Modular Kitchen");
  });

  it("accepts the enquiry when project type is left blank", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya", createdAt: "2026-09-02T00:00:00.000Z" }] });

    const res = await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      project_type: "",
    });

    expect(res.status).toBe(201);
    // Blank is stored as null, not the literal empty string.
    expect(query.mock.calls[0][1]).not.toContain("");
  });

  it("rejects a project type outside the published list", async () => {
    // A closed list is the whole point — free text here would need moderation
    // the CRM does not have.
    const res = await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      project_type: "Something I typed myself",
    });

    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("writes the website's category selection to its own column, never to the free-text project field", async () => {
    // leads.project is an employee-typed project name/description (see
    // migration 013's comment); leads.project_type is the closed-list column
    // this endpoint owns. A public submission must never touch the former.
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya" }] });
    await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      project_type: "Renovation",
    });

    const sql = query.mock.calls[0][0];
    expect(sql).toMatch(/\bproject_type\b/);
    expect(sql).not.toMatch(/INSERT INTO leads \([^)]*\bproject\b,/);
  });
});

describe("GET /api/leads", () => {
  beforeEach(() => query.mockReset());

  it("requires authentication", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(401);
  });

  it("returns leads for an authenticated request", async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: 1, employee_code: "RAHUL", name: "Rahul", role: "CRM Administrator", is_super_admin: true, permissions: {}, status: "Active" }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya", stage: "New" }] });

    const res = await request(app).get("/api/leads").set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "Priya", stage: "New" }]);
  });
});

describe("POST /api/enquiries — tracking payload robustness", () => {
  beforeEach(() => query.mockReset());

  it("still accepts the enquiry when the tracking blob carries an unknown key", async () => {
    // The website spreads sessionStorage straight into this body. A returning
    // visitor with stale storage, or a newly added click id like Google's
    // gbraid, must never cost a real lead.
    query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Priya", createdAt: "2026-08-23T00:00:00.000Z" }],
    });

    const res = await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      utm_source: "google",
      gbraid: "abc123",
      some_future_param: "whatever",
    });

    expect(res.status).toBe(201);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("drops the unknown keys rather than storing them", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya" }] });
    await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      gbraid: "abc123",
    });

    const params = query.mock.calls[0][1];
    expect(params).not.toContain("abc123");
  });

  it("still rejects an enquiry missing a required field", async () => {
    // stripUnknown must not weaken real validation.
    const res = await request(app)
      .post("/api/enquiries")
      .send({ phone: "9999999999", utm_source: "google" });

    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("keeps every attribution field the schema does know about", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Priya" }] });
    await request(app).post("/api/enquiries").send({
      name: "Priya",
      phone: "9999999999",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "kolkata-interiors",
      utm_content: "ad-a",
      utm_term: "interior designer kolkata",
      gclid: "CjwKCA",
      landing_page: "/interior-designer-kolkata",
      referrer: "https://www.google.com/",
    });

    const params = query.mock.calls[0][1];
    ["google", "cpc", "kolkata-interiors", "ad-a", "interior designer kolkata",
     "CjwKCA", "/interior-designer-kolkata", "https://www.google.com/"]
      .forEach((v) => expect(params).toContain(v));
  });
});
