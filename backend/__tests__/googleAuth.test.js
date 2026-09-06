/**
 * The interactive parts of scripts/googleAuth.js can't be unit-tested without
 * a browser and a real Google account. The one pure, security-relevant piece
 * — the consent URL — is covered here.
 */

process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";

const { buildAuthUrl, REDIRECT_URI, SCOPE } = require("../scripts/googleAuth");

describe("buildAuthUrl", () => {
  const url = new URL(buildAuthUrl(process.env.GOOGLE_CLIENT_ID, "state-token-123"));
  const p = url.searchParams;

  it("points at Google's OAuth 2.0 authorization endpoint", () => {
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
  });

  it("requests offline access with a forced consent so a refresh token always comes back", () => {
    expect(p.get("access_type")).toBe("offline");
    expect(p.get("prompt")).toBe("consent");
    expect(p.get("response_type")).toBe("code");
  });

  it("asks only for the business.manage scope", () => {
    expect(p.get("scope")).toBe(SCOPE);
    expect(SCOPE).toBe("https://www.googleapis.com/auth/business.manage");
  });

  it("carries the CSRF state and the loopback redirect back to this app", () => {
    expect(p.get("state")).toBe("state-token-123");
    expect(p.get("redirect_uri")).toBe(REDIRECT_URI);
    expect(REDIRECT_URI).toMatch(/^http:\/\/localhost:\d+\/oauth2callback$/);
  });
});
