// Trimmed from the root app's src/lib/api.js: the marketing site only
// ever calls one endpoint (submitEnquiry) against the same CRM backend.
// No auth/token handling here at all — this app has no login of its own,
// see components/LoginLink.jsx.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

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

export const api = {
  submitEnquiry: (formData) =>
    request("/enquiries", { method: "POST", body: formData }),
};
