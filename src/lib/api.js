const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
const TOKEN_KEY = "avaya-crm-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
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
