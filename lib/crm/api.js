// Same resolved base URL as the marketing client — see lib/apiConfig.js.
// This file's behaviour is unchanged in development; the import only means a
// production build can no longer bake a localhost URL into /portal either.
import { API_BASE_URL as BASE_URL } from "../apiConfig";

const TOKEN_KEY = "avaya-crm-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Fires when an authenticated request comes back 401 (expired/invalid token)
 * — not on a failed login attempt, which is also a 401 but isn't a session
 * expiry. EmployeeLogin subscribes to force a clean sign-out instead of the
 * UI silently re-failing every subsequent request forever.
 */
const UNAUTHORIZED_EVENT = "avaya:unauthorized";
export function onUnauthorized(handler) {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

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

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

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
    if (auth && response.status === 401) window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export const api = {
  submitEnquiry: (formData) =>
    request("/enquiries", { method: "POST", body: formData }),

  login: (employeeId, password) =>
    request("/auth/login", { method: "POST", body: { employeeId, password } }),
  me: () => request("/auth/me", { auth: true }),

  getLeads: () => request("/leads", { auth: true }),
  createLead: (lead) => request("/leads", { method: "POST", body: lead, auth: true }),
  updateLead: (id, patch) => request(`/leads/${id}`, { method: "PATCH", body: patch, auth: true }),

  getCustomers: () => request("/customers", { auth: true }),
  createCustomer: (customer) => request("/customers", { method: "POST", body: customer, auth: true }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE", auth: true }),
  getProjects: () => request("/projects", { auth: true }),
  createProject: (project) => request("/projects", { method: "POST", body: project, auth: true }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE", auth: true }),
  addProjectPayment: (projectId, paymentData) => request(`/projects/${projectId}/payments`, { method: "POST", body: paymentData, auth: true }),

  getFollowups: () => request("/followups", { auth: true }),
  createFollowup: (followup) => request("/followups", { method: "POST", body: followup, auth: true }),
  setFollowupDone: (id, done) =>
    request(`/followups/${id}`, { method: "PATCH", body: { done }, auth: true }),
  deleteFollowup: (id) => request(`/followups/${id}`, { method: "DELETE", auth: true }),

  // Google review moderation — super-admin only on the server, so these will
  // 403 for anyone else even if the UI somehow rendered for them.
  getReviews: () => request("/reviews", { auth: true }),
  updateReview: (id, patch) => request(`/reviews/${id}`, { method: "PATCH", body: patch, auth: true }),
  createManualReview: (review) => request("/reviews", { method: "POST", body: review, auth: true }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: "DELETE", auth: true }),
  syncGoogleReviews: () => request("/reviews/sync", { method: "POST", auth: true }),

  getQuotations: () => request("/quotations", { auth: true }),
  getQuotation: (id) => request(`/quotations/${id}`, { auth: true }),
  createQuotation: (quotation) => request("/quotations", { method: "POST", body: quotation, auth: true }),
  updateQuotation: (id, quotation) => request(`/quotations/${id}`, { method: "PATCH", body: quotation, auth: true }),
  deleteQuotation: (id) => request(`/quotations/${id}`, { method: "DELETE", auth: true }),

  deleteLead: (id) => request(`/leads/${id}`, { method: "DELETE", auth: true }),

  getEmployees: () => request("/employees", { auth: true }),
  createEmployee: (employee) => request("/employees", { method: "POST", body: employee, auth: true }),
  updateEmployee: (id, patch) => request(`/employees/${id}`, { method: "PATCH", body: patch, auth: true }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE", auth: true }),
};

export const RESOURCES = ["leads", "customers", "followups", "quotations", "projects"];
export const ACTIONS = ["create", "read", "update", "delete"];
