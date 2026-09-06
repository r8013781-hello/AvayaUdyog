/**
 * Unit tests for the Google ingestion library. No network: global.fetch is
 * stubbed per case so every branch of the error mapping is exercised.
 */

const GOOGLE_ENV = {
  GOOGLE_CLIENT_ID: "cid",
  GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_REFRESH_TOKEN: "refresh",
  GOOGLE_BUSINESS_ACCOUNT_ID: "111",
  GOOGLE_BUSINESS_LOCATION_ID: "222",
};

describe("googleReviews", () => {
  let googleReviews;
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    Object.assign(process.env, GOOGLE_ENV);
    googleReviews = require("../lib/googleReviews");
  });

  afterEach(() => {
    global.fetch = realFetch;
    for (const key of Object.keys(GOOGLE_ENV)) delete process.env[key];
  });

  const okJson = (body) => ({ ok: true, json: async () => body });
  const errText = (status, text) => ({
    ok: false,
    status,
    statusText: `HTTP ${status}`,
    text: async () => text,
  });

  describe("toRating", () => {
    it("maps the word enum to 1-5", () => {
      expect(googleReviews.toRating("ONE")).toBe(1);
      expect(googleReviews.toRating("FIVE")).toBe(5);
    });
    it("returns null for anything unrecognised", () => {
      expect(googleReviews.toRating("STAR_RATING_UNSPECIFIED")).toBeNull();
      expect(googleReviews.toRating(undefined)).toBeNull();
    });
  });

  describe("toRow", () => {
    it("shapes a v4 review into a table row and never trusts review.name as a URL", () => {
      const row = googleReviews.toRow({
        reviewId: "abc",
        reviewer: { displayName: "Asha", profilePhotoUrl: "http://p/a.jpg" },
        starRating: "FOUR",
        comment: "Lovely",
        name: "accounts/1/locations/2/reviews/abc",
        createTime: "2024-02-01T00:00:00Z",
        updateTime: "2024-03-01T00:00:00Z",
      });
      expect(row).toEqual({
        externalId: "abc",
        authorName: "Asha",
        authorPhotoUrl: "http://p/a.jpg",
        rating: 4,
        text: "Lovely",
        reviewUrl: null,
        reviewedAt: "2024-02-01T00:00:00Z", // createTime, not updateTime
      });
    });

    it("falls back to a placeholder name and null photo", () => {
      const row = googleReviews.toRow({ reviewId: "x", starRating: "FIVE" });
      expect(row.authorName).toBe("Google user");
      expect(row.authorPhotoUrl).toBeNull();
      expect(row.text).toBeNull();
    });
  });

  describe("fetchReviews error classification", () => {
    const tokenOk = () => okJson({ access_token: "at" });

    it("throws NOT_CONFIGURED (with the missing list) when a var is unset", async () => {
      delete process.env.GOOGLE_REFRESH_TOKEN;
      jest.resetModules();
      const gr = require("../lib/googleReviews");
      await expect(gr.fetchReviews()).rejects.toMatchObject({
        code: "NOT_CONFIGURED",
        missing: ["GOOGLE_REFRESH_TOKEN"],
      });
    });

    it("maps invalid_grant on the token call to TOKEN_REVOKED", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce(
        errText(400, JSON.stringify({ error: "invalid_grant" })),
      );
      await expect(googleReviews.fetchReviews()).rejects.toMatchObject({ code: "TOKEN_REVOKED" });
    });

    it("maps a 403 on the reviews call to ACCESS_DENIED with Google's message", async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(tokenOk())
        .mockResolvedValueOnce(
          errText(403, JSON.stringify({ error: { message: "API not approved", status: "PERMISSION_DENIED" } })),
        );
      await expect(googleReviews.fetchReviews()).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    });

    it("maps a 429 to RATE_LIMITED", async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(tokenOk())
        .mockResolvedValueOnce(errText(429, JSON.stringify({ error: { message: "quota" } })));
      await expect(googleReviews.fetchReviews()).rejects.toMatchObject({ code: "RATE_LIMITED" });
    });

    it("maps a 404 to NOT_FOUND", async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(tokenOk())
        .mockResolvedValueOnce(errText(404, JSON.stringify({ error: { message: "no such location" } })));
      await expect(googleReviews.fetchReviews()).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("follows pagination and drops reviews with no usable star rating", async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(tokenOk())
        .mockResolvedValueOnce(
          okJson({
            reviews: [
              { reviewId: "1", starRating: "FIVE", comment: "great", reviewer: { displayName: "A" } },
              { reviewId: "2", starRating: "STAR_RATING_UNSPECIFIED", comment: "meh" },
            ],
            nextPageToken: "page2",
          }),
        )
        .mockResolvedValueOnce(
          okJson({
            reviews: [
              { reviewId: "3", starRating: "THREE", comment: "ok", reviewer: { displayName: "C" } },
            ],
          }),
        );

      const rows = await googleReviews.fetchReviews();
      expect(rows.map((r) => r.externalId)).toEqual(["1", "3"]);
      // token + page 1 + page 2
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
