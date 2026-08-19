import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api, onSlowRequest } from "../lib/api";

// Trimmed to match the trimmed lib/api.js — only submitEnquiry and
// onSlowRequest exist in this app (no auth/token surface, see the
// migration report for why). The root app's api.test.js has equivalent
// coverage for the full CRM API client, unchanged, in the Vite app.

function mockFetchOnce(body, ok = true, status = ok ? 200 : 400) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

describe("marketing api client", () => {
  afterEach(() => {
    global.fetch?.mockRestore?.();
  });

  it("submitEnquiry posts the form data without an Authorization header", async () => {
    mockFetchOnce({ id: 1, name: "Priya", createdAt: "2026-08-08T00:00:00.000Z" });
    const formData = { name: "Priya", phone: "9999999999", email: "", city: "", address: "", message: "Hello" };
    await api.submitEnquiry(formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/enquiries");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBeUndefined();
    expect(JSON.parse(options.body)).toEqual(formData);
  });

  it("throws the server-provided error message on a failed request", async () => {
    mockFetchOnce({ error: "Request failed." }, false, 500);
    await expect(
      api.submitEnquiry({ name: "", phone: "", email: "", city: "", address: "", message: "" }),
    ).rejects.toThrow("Request failed.");
  });

  it("throws a clear message when the network request itself fails", async () => {
    global.fetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(
      api.submitEnquiry({ name: "", phone: "", email: "", city: "", address: "", message: "" }),
    ).rejects.toThrow("Could not reach the server");
  });

  it("fires a slow-request event if a request is still pending after 4s (cold-start warning)", async () => {
    vi.useFakeTimers();
    let resolveFetch;
    global.fetch = vi.fn(() => new Promise((resolve) => { resolveFetch = resolve; }));

    const handler = vi.fn();
    const unsubscribe = onSlowRequest(handler);

    const pending = api.submitEnquiry({ name: "Test", phone: "1", email: "", city: "", address: "", message: "hi" });

    await vi.advanceTimersByTimeAsync(3999);
    expect(handler).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2);
    expect(handler).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, status: 200, json: () => Promise.resolve({ id: 1 }) });
    await pending;
    unsubscribe();
    vi.useRealTimers();
  });

  it("does not fire the slow-request event when a request resolves quickly", async () => {
    mockFetchOnce({ id: 1 });
    const handler = vi.fn();
    const unsubscribe = onSlowRequest(handler);
    await api.submitEnquiry({ name: "Test", phone: "1", email: "", city: "", address: "", message: "hi" });
    expect(handler).not.toHaveBeenCalled();
    unsubscribe();
  });
});
