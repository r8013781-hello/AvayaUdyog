/**
 * POST /api/reviews/sync — verifies that each tagged failure from the Google
 * library becomes a specific HTTP status and an actionable message, never a
 * bare 500. googleReviews is fully mocked here; its own branches are covered
 * in googleReviews.test.js.
 */

process.env.JWT_SECRET = "test-secret";

jest.mock("../lib/db", () => ({ query: jest.fn() }));
jest.mock("../lib/googleReviews", () => ({
  fetchReviews: jest.fn(),
  isConfigured: jest.fn(() => true),
  missingConfig: jest.fn(() => []),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");
const { query } = require("../lib/db");
const { fetchReviews } = require("../lib/googleReviews");
const app = require("../server");

const token = `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}`;

function mockSuperAdmin() {
  query.mockResolvedValueOnce({
    rows: [{ id: 1, employee_code: "E1", name: "Admin", role: "Super Admin", is_super_admin: true, permissions: {}, status: "Active" }],
  });
}

function taggedError(code, message = "boom") {
  const err = new Error(message);
  err.code = code;
  if (code === "NOT_CONFIGURED") err.missing = ["GOOGLE_CLIENT_ID"];
  return err;
}

beforeEach(() => {
  query.mockReset();
  fetchReviews.mockReset();
});

describe("sync failure → HTTP status mapping", () => {
  const cases = [
    ["NOT_CONFIGURED", 503],
    ["TOKEN_REVOKED", 502],
    ["AUTH_FAILED", 502],
    ["ACCESS_DENIED", 502],
    ["NOT_FOUND", 502],
    ["RATE_LIMITED", 429],
    ["NETWORK", 502],
  ];

  it.each(cases)("%s → %i with a non-empty message", async (code, status) => {
    mockSuperAdmin();
    fetchReviews.mockRejectedValueOnce(taggedError(code));

    const res = await request(app).post("/api/reviews/sync").set("Authorization", token);

    expect(res.status).toBe(status);
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("NOT_CONFIGURED still returns the missing-vars list", async () => {
    mockSuperAdmin();
    fetchReviews.mockRejectedValueOnce(taggedError("NOT_CONFIGURED"));

    const res = await request(app).post("/api/reviews/sync").set("Authorization", token);
    expect(res.body.missing).toEqual(["GOOGLE_CLIENT_ID"]);
  });

  it("ACCESS_DENIED includes Google's raw message as detail", async () => {
    mockSuperAdmin();
    fetchReviews.mockRejectedValueOnce(taggedError("ACCESS_DENIED", "PERMISSION_DENIED: not approved"));

    const res = await request(app).post("/api/reviews/sync").set("Authorization", token);
    expect(res.body.detail).toMatch(/not approved/);
  });

  it("an untagged error still falls through to the generic 500 handler", async () => {
    mockSuperAdmin();
    fetchReviews.mockRejectedValueOnce(new Error("something unexpected"));

    const res = await request(app).post("/api/reviews/sync").set("Authorization", token);
    expect(res.status).toBe(500);
  });
});

describe("sync success", () => {
  it("upserts each incoming review and reports inserted / updated counts", async () => {
    mockSuperAdmin();
    fetchReviews.mockResolvedValueOnce([
      { externalId: "a", authorName: "A", authorPhotoUrl: null, rating: 5, text: "x", reviewUrl: null, reviewedAt: null },
      { externalId: "b", authorName: "B", authorPhotoUrl: null, rating: 4, text: "y", reviewUrl: null, reviewedAt: null },
    ]);
    query.mockResolvedValueOnce({ rows: [{ isInsert: true }] });
    query.mockResolvedValueOnce({ rows: [{ isInsert: false }] });

    const res = await request(app).post("/api/reviews/sync").set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ synced: 2, inserted: 1, updated: 1 });
  });
});
