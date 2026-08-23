// Trimmed from the root app's src/lib/api.js: the marketing site only
// ever calls one endpoint (submitEnquiry) against the same CRM backend.
// No auth/token handling here at all — this app has no login of its own,
// see components/LoginLink.jsx.
import { getTrackingParams } from "./trackingParams";
import { API_BASE_URL as BASE_URL } from "./apiConfig";

/**
 * The backend runs on a free-tier host that spins down after inactivity —
 * the first request after a while can take 30-60s to wake it back up. That's
 * an infrastructure limit no amount of frontend code can remove, but a form
 * silently doing nothing for a minute reads as broken. Fire a "this is slow"
 * event once a request has been pending a few seconds so calling UI can show
 * something reassuring instead of a frozen button.
 */
const SLOW_REQUEST_EVENT = "avaya:slow-request";
export function onSlowRequest(handler) {
  window.addEventListener(SLOW_REQUEST_EVENT, handler);
  return () => window.removeEventListener(SLOW_REQUEST_EVENT, handler);
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  const slowTimer = setTimeout(() => window.dispatchEvent(new CustomEvent(SLOW_REQUEST_EVENT, { detail: { path } })), 4000);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(slowTimer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

/**
 * Cold-start warm-up.
 *
 * The backend sleeps on its free tier and takes 30-60s to wake. That whole
 * delay currently lands on the visitor's first enquiry — the single request
 * where a minute of apparent silence costs a lead. Waking the server while
 * they are still typing moves the delay off the critical path entirely: by the
 * time they press Send, the instance is usually already up.
 *
 * The behaviour is constrained on purpose:
 *
 *   * At most ONE request per page load, whatever calls it. `warmUpStarted`
 *     is set synchronously before the fetch, so concurrent callers cannot
 *     race past it. No polling, no interval, no retry.
 *   * Fired on real intent only — the first focus inside the enquiry form
 *     (see components/ContactPanel.jsx), not on page load and not on merely
 *     opening the panel. A visitor who never touches the form never causes a
 *     request, so this adds nothing to the traffic of ordinary browsing.
 *   * GET /api/health, which is the cheapest route the server has: no
 *     database call, no auth, and generously above the enquiry rate limit
 *     (backend/server.js applies the 20-per-15-min limiter to
 *     /api/enquiries only, so a warm-up can never consume a visitor's
 *     enquiry allowance).
 *   * Deliberately outside `request()`: no slow-request event (a warm-up is
 *     invisible and must not trigger the "waking up the server" notice on its
 *     own), no thrown errors, and no tracking call of any kind. Analytics see
 *     nothing — this fires no GA4 event and touches no gtag surface.
 *
 * Expected effect: one extra ~200-byte GET per visitor who engages the form,
 * in exchange for removing the cold start from the submit path in the common
 * case. It cannot fix a wake that takes longer than the visitor's typing;
 * the "Waking up the server" message stays as the backstop for that.
 */
let warmUpStarted = false;

export function warmUpApi() {
  if (warmUpStarted) return Promise.resolve(false);
  warmUpStarted = true;
  try {
    return fetch(`${BASE_URL}/health`, { method: "GET", cache: "no-store" })
      .then(() => true)
      .catch(() => false);
  } catch {
    // A synchronous throw (no fetch, blocked by a policy) must never surface
    // in a focus handler.
    return Promise.resolve(false);
  }
}

/** Test-only: lets a spec exercise the once-per-page-load guard. */
export function __resetWarmUpForTests() {
  warmUpStarted = false;
}

export const api = {
  submitEnquiry: (formData) =>
    request("/enquiries", {
      method: "POST",
      body: { ...formData, ...getTrackingParams() },
    }),

  /**
   * Approved Google reviews only. The marketing site never contacts Google
   * directly — these have already been synced into the CRM and explicitly
   * approved for display by a super admin.
   */
  getPublicReviews: () => request("/reviews/public"),
};
