/**
 * The one place the API base URL is resolved — and the one place a build can
 * be stopped from shipping a localhost URL to production.
 *
 * ── The bug this closes ────────────────────────────────────────────────────
 * Both API clients used to open with the same line:
 *
 *   const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
 *
 * Next inlines NEXT_PUBLIC_* at build time, so if that variable is not set on
 * the host when `next build` runs, the fallback string is literally baked into
 * the static bundle. The deploy succeeds, every page renders, and the enquiry
 * form posts to the visitor's own machine. Nothing errors on the server, no
 * monitor fires, and every lead is lost silently until someone happens to test
 * the form. A silent fallback is the worst possible failure mode for the one
 * request that carries revenue.
 *
 * ── The guard ──────────────────────────────────────────────────────────────
 * `resolveApiBaseUrl` below is the rule. It is enforced by
 * scripts/check-env.mjs, which npm runs as `prebuild` — so a production build
 * stops before Next starts, with one readable message rather than eighteen
 * prerender stack traces. In a production build the fallback is not a
 * fallback, it is a fault:
 *
 *   * missing NEXT_PUBLIC_API_BASE_URL  -> the build throws
 *   * a loopback NEXT_PUBLIC_API_BASE_URL -> the build throws
 *
 * Development is untouched. `next dev`, Vitest and Jest all run with
 * NODE_ENV set to something other than "production", so the localhost default
 * still applies exactly as before and nobody has to configure anything to work
 * locally.
 *
 * ── The escape hatch, and why it is safe ───────────────────────────────────
 * ALLOW_LOCALHOST_API=true permits a production-mode build against a loopback
 * URL. That is a real need — verifying `next build` output locally without a
 * staging backend — and it does not weaken the guard, because the whole point
 * of the guard is that the failure must never be *silent*. Setting a variable
 * whose name is ALLOW_LOCALHOST_API is not silent. Note it deliberately does
 * NOT excuse a *missing* variable: an unset variable is always an unconfigured
 * host, never an intention.
 */

/** Loopback in every spelling a browser will actually resolve to the client. */
const LOOPBACK = /^(?:[a-z][a-z0-9+.-]*:\/\/)?(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\]|::1)(?::\d+)?(?:[/?#]|$)/i;

export const DEV_FALLBACK_API_BASE_URL = "http://localhost:3001/api";

export function isLoopbackUrl(value) {
  return LOOPBACK.test(String(value ?? "").trim());
}

/**
 * Resolve the base URL, throwing rather than guessing in a production build.
 *
 * Both inputs are parameters (rather than read straight off `process.env`) so
 * the regression test can exercise every branch without mutating global state
 * — the production branches are precisely the ones that are impossible to
 * reach in a test run otherwise.
 */
export function resolveApiBaseUrl({
  raw = process.env.NEXT_PUBLIC_API_BASE_URL,
  nodeEnv = process.env.NODE_ENV,
  allowLoopback = process.env.ALLOW_LOCALHOST_API === "true",
} = {}) {
  const value = typeof raw === "string" ? raw.trim() : raw;
  const isProduction = nodeEnv === "production";

  if (!value) {
    if (isProduction) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not set. A production build must be given the " +
          "real backend URL (for example https://avayaudyog.onrender.com/api) — " +
          "Next.js inlines this value at build time, so falling back to localhost " +
          "here would ship a static site whose enquiry form posts to the visitor's " +
          "own machine and loses every lead silently.",
      );
    }
    return DEV_FALLBACK_API_BASE_URL;
  }

  if (isProduction && !allowLoopback && isLoopbackUrl(value)) {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL points at a loopback address (${value}) in a ` +
        "production build. Set it to the real backend URL. If this build is " +
        "deliberately local and will never be deployed, re-run with " +
        "ALLOW_LOCALHOST_API=true.",
    );
  }

  return value;
}

/**
 * The base URL the shipped code actually uses.
 *
 * Note the shape: the production branch resolves to the bare env value with no
 * fallback expression attached. That is deliberate and it is why the guard runs
 * in scripts/check-env.mjs rather than here.
 *
 * Next inlines `process.env.NODE_ENV` and `process.env.NEXT_PUBLIC_API_BASE_URL`
 * as literals at build time, so in a production build this whole expression
 * constant-folds to the real URL and the minifier drops the development branch
 * entirely — the string "http://localhost:3001/api" is not present anywhere in
 * the production bundle, which makes `grep -r localhost out/` a check that
 * actually means something.
 *
 * Putting the validation here instead would have the opposite effect: it would
 * ship the loopback regex, the fallback constant and both error messages into
 * every visitor's browser, re-run a build-time check on every page load, and
 * leave "localhost" scattered through the output for a grep to trip over.
 */
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || DEV_FALLBACK_API_BASE_URL;
