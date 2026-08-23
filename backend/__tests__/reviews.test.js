process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({
  query: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const app = require("../server");

function tokenFor(id) {
  return `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET)}`;
}

/** requireAuth re-reads the employee from the DB on every request. */
function mockEmployee({ isSuperAdmin }) {
  query.mockResolvedValueOnce({
    rows: [
      {
        id: 1,
        employee_code: "E1",
        name: "Test User",
        role: "CRM Administrator",
        is_super_admin: isSuperAdmin,
        permissions: { leads: ["read", "create", "update", "delete"] },
        status: "Active",
      },
    ],
  });
}

describe("GET /api/reviews/public", () => {
  beforeEach(() => query.mockReset());

  it("is reachable without authentication", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/reviews/public");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("only ever selects approved reviews", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await request(app).get("/api/reviews/public");

    const sql = query.mock.calls[0][0];
    expect(sql).toMatch(/display_status\s*=\s*'approved'/);
  });

  it("does not expose moderation internals to the public", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 7, authorName: "A. Client", rating: 5, text: "Lovely work" }],
    });
    const res = await request(app).get("/api/reviews/public");

    expect(res.status).toBe(200);
    const sql = query.mock.calls[0][0];
    // Only the SELECT list matters here — display_order legitimately appears
    // in ORDER BY (it is how the admin's chosen order is applied), it just
    // must not be returned to the public.
    const selectClause = sql.slice(0, sql.indexOf("FROM"));
    expect(selectClause).not.toMatch(/moderated_by|moderated_at|display_status|display_order/);
  });
});

describe("review moderation is super-admin only", () => {
  beforeEach(() => query.mockReset());

  it("rejects an unauthenticated listing", async () => {
    const res = await request(app).get("/api/reviews");
    expect(res.status).toBe(401);
  });

  it("rejects a signed-in employee who is not a super admin", async () => {
    mockEmployee({ isSuperAdmin: false });
    const res = await request(app).get("/api/reviews").set("Authorization", tokenFor(1));
    expect(res.status).toBe(403);
  });

  it("rejects a non-super-admin trying to approve a review", async () => {
    mockEmployee({ isSuperAdmin: false });
    const res = await request(app)
      .patch("/api/reviews/3")
      .set("Authorization", tokenFor(1))
      .send({ displayStatus: "approved" });

    expect(res.status).toBe(403);
  });

  it("rejects a non-super-admin triggering a Google sync", async () => {
    mockEmployee({ isSuperAdmin: false });
    const res = await request(app).post("/api/reviews/sync").set("Authorization", tokenFor(1));
    expect(res.status).toBe(403);
  });

  it("allows a super admin to list reviews", async () => {
    mockEmployee({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/reviews").set("Authorization", tokenFor(1));
    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.google).toHaveProperty("configured");
  });

  it("validates the moderation payload", async () => {
    mockEmployee({ isSuperAdmin: true });
    const res = await request(app)
      .patch("/api/reviews/3")
      .set("Authorization", tokenFor(1))
      .send({ displayStatus: "definitely-not-a-status" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/reviews/sync without Google configured", () => {
  beforeEach(() => query.mockReset());

  it("reports which configuration is missing instead of failing obscurely", async () => {
    mockEmployee({ isSuperAdmin: true });
    const res = await request(app).post("/api/reviews/sync").set("Authorization", tokenFor(1));

    expect(res.status).toBe(503);
    expect(res.body.missing).toEqual(
      expect.arrayContaining(["GOOGLE_CLIENT_ID", "GOOGLE_BUSINESS_LOCATION_ID"]),
    );
  });
});

describe("testimonials without a star rating", () => {
  beforeEach(() => query.mockReset());

  it("accepts a manual review with no rating instead of forcing one", async () => {
    // The three seeded testimonials (012_seed_initial_reviews.sql) were written
    // quotes, not star ratings. Requiring a rating here would make whoever
    // enters one invent a number the client never gave.
    mockEmployee({ isSuperAdmin: true });
    query.mockResolvedValueOnce({ rows: [{ id: 9 }] });
    query.mockResolvedValueOnce({ rows: [{ id: 9, authorName: "Anita Patel" }] });

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", tokenFor(1))
      .send({ authorName: "Anita Patel", authorRole: "Interior Designer", text: "Delight." });

    expect(res.status).toBe(201);
    const params = query.mock.calls[1][1];
    expect(params).toContain("Interior Designer");
    expect(params).toContain(null);
  });

  it("still rejects a rating outside 1-5", async () => {
    mockEmployee({ isSuperAdmin: true });
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", tokenFor(1))
      .send({ authorName: "X", rating: 9 });

    expect(res.status).toBe(400);
  });

  it("exposes source and role publicly so the site can label provenance", async () => {
    // The website must be able to tell a transcribed testimonial from a
    // verified Google review, and must never present one as the other.
    query.mockResolvedValueOnce({ rows: [] });
    await request(app).get("/api/reviews/public");

    const sql = query.mock.calls[0][0];
    const selectClause = sql.slice(0, sql.indexOf("FROM"));
    expect(selectClause).toMatch(/source/);
    expect(selectClause).toMatch(/author_role/);
    // Moderation internals still must not leak.
    expect(selectClause).not.toMatch(/display_status/);
    expect(selectClause).not.toMatch(/moderated_by/);
  });
});
