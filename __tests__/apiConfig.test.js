import { describe, it, expect } from "vitest";
import {
  resolveApiBaseUrl,
  isLoopbackUrl,
  DEV_FALLBACK_API_BASE_URL,
} from "../lib/apiConfig";

/**
 * Regression guard for the silent-localhost deploy.
 *
 * The original line was `process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"`.
 * Because Next inlines NEXT_PUBLIC_* at build time, an unset variable on the
 * host produced a static site that posted every enquiry to the visitor's own
 * machine — a successful deploy that lost every lead with no error anywhere.
 *
 * These tests pass nodeEnv/raw explicitly rather than mutating process.env, so
 * the production branches are actually reachable from a test run.
 */

const PROD = { nodeEnv: "production" };
const REAL = "https://avayaudyog.onrender.com/api";

describe("api base url resolution", () => {
  describe("development", () => {
    it("falls back to localhost when nothing is configured", () => {
      expect(resolveApiBaseUrl({ raw: undefined, nodeEnv: "development" })).toBe(
        DEV_FALLBACK_API_BASE_URL,
      );
    });

    it("still allows an explicit localhost url", () => {
      expect(
        resolveApiBaseUrl({ raw: "http://localhost:4000/api", nodeEnv: "development" }),
      ).toBe("http://localhost:4000/api");
    });

    it("allows pointing local dev at the real backend", () => {
      expect(resolveApiBaseUrl({ raw: REAL, nodeEnv: "development" })).toBe(REAL);
    });

    it("treats the test environment as development", () => {
      expect(resolveApiBaseUrl({ raw: undefined, nodeEnv: "test" })).toBe(
        DEV_FALLBACK_API_BASE_URL,
      );
    });
  });

  describe("production", () => {
    it("fails the build when NEXT_PUBLIC_API_BASE_URL is missing", () => {
      expect(() => resolveApiBaseUrl({ raw: undefined, ...PROD })).toThrow(
        /NEXT_PUBLIC_API_BASE_URL is not set/,
      );
    });

    it("fails the build on an empty or whitespace-only value", () => {
      expect(() => resolveApiBaseUrl({ raw: "", ...PROD })).toThrow(/is not set/);
      expect(() => resolveApiBaseUrl({ raw: "   ", ...PROD })).toThrow(/is not set/);
    });

    it("never silently ships a localhost api url", () => {
      [
        "http://localhost:3001/api",
        "https://localhost/api",
        "http://127.0.0.1:3001/api",
        "http://0.0.0.0:3001/api",
        "http://[::1]:3001/api",
        "localhost:3001/api",
      ].forEach((url) => {
        expect(() => resolveApiBaseUrl({ raw: url, ...PROD }), url).toThrow(
          /loopback address/,
        );
      });
    });

    it("accepts a real backend url", () => {
      expect(resolveApiBaseUrl({ raw: REAL, ...PROD })).toBe(REAL);
    });

    it("trims surrounding whitespace from a host-provided value", () => {
      expect(resolveApiBaseUrl({ raw: `  ${REAL}  `, ...PROD })).toBe(REAL);
    });

    it("allows a deliberate local production build via ALLOW_LOCALHOST_API", () => {
      expect(
        resolveApiBaseUrl({
          raw: "http://localhost:3001/api",
          ...PROD,
          allowLoopback: true,
        }),
      ).toBe("http://localhost:3001/api");
    });

    it("does not let the escape hatch excuse a missing variable", () => {
      // An unset variable is an unconfigured host, never an intention.
      expect(() =>
        resolveApiBaseUrl({ raw: undefined, ...PROD, allowLoopback: true }),
      ).toThrow(/is not set/);
    });
  });
});

describe("loopback detection", () => {
  it("recognises loopback hosts", () => {
    ["http://localhost", "http://localhost:3001/api", "https://127.0.0.1/x", "http://[::1]/api", "0.0.0.0:80"].forEach(
      (url) => expect(isLoopbackUrl(url), url).toBe(true),
    );
  });

  it("does not mistake a real host for loopback", () => {
    // The failure worth avoiding is a substring match blocking a legitimate
    // deploy, e.g. a host that merely contains the word "localhost".
    [
      "https://avayaudyog.onrender.com/api",
      "https://api.avayaudyog.com",
      "https://localhost.avayaudyog.com/api",
      "https://not-localhost.example.com",
      "",
      undefined,
    ].forEach((url) => expect(isLoopbackUrl(url), String(url)).toBe(false));
  });
});
