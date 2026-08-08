import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api, getToken, setToken } from "./api";

function mockFetchOnce(body, ok = true, status = ok ? 200 : 400) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch?.mockRestore?.();
  });

  it("stores and clears the auth token in localStorage", () => {
    expect(getToken()).toBeNull();
    setToken("abc123");
    expect(getToken()).toBe("abc123");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it("submitEnquiry posts the form data without an Authorization header", async () => {
    mockFetchOnce({ id: 1, name: "Priya", createdAt: "2026-08-08T00:00:00.000Z" });
    const formData = { name: "Priya", phone: "9999999999", email: "", city: "", address: "", query: "Hello" };
    await api.submitEnquiry(formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/enquiries");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBeUndefined();
    expect(JSON.parse(options.body)).toEqual(formData);
  });

  it("attaches a bearer token for authenticated requests", async () => {
    setToken("test-token");
    mockFetchOnce([]);
    await api.getLeads();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-token");
  });

  it("throws the server-provided error message on a failed request", async () => {
    mockFetchOnce({ error: "The employee ID or password is incorrect." }, false, 401);
    await expect(api.login("RAHUL", "wrong")).rejects.toThrow(
      "The employee ID or password is incorrect.",
    );
  });
});
