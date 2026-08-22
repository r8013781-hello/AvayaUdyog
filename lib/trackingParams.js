/**
 * Captures UTM parameters and Google Click ID (gclid) from the current
 * URL and persists them in sessionStorage so they survive in-site
 * navigation. Retrieval is a plain function — no hook required — so
 * both form components can call it at submission time.
 */

const STORAGE_KEY = "avaya-tracking-params";

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
];

/**
 * Read the URL query string once and stash any marketing params into
 * sessionStorage. Safe to call multiple times — only the first call
 * with actual params writes anything.
 */
export function captureTrackingParams() {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(window.location.href);
    const captured = {};
    let found = false;

    for (const key of TRACKED_PARAMS) {
      const value = url.searchParams.get(key);
      if (value) {
        captured[key] = value;
        found = true;
      }
    }

    if (found) {
      captured.landing_page = window.location.pathname;
      captured.referrer = document.referrer || "";
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
    } else if (!sessionStorage.getItem(STORAGE_KEY)) {
      // No UTM params and nothing stored yet — still record the
      // organic landing page and referrer for attribution.
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          landing_page: window.location.pathname,
          referrer: document.referrer || "",
        }),
      );
    }
  } catch {
    // sessionStorage unavailable (private browsing, full storage, etc.).
  }
}

/**
 * Returns whatever tracking params were captured for this session.
 * Always returns a plain object — never throws.
 */
export function getTrackingParams() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
