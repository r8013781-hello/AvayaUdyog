import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api, onSlowRequest, warmUpApi, __resetWarmUpForTests } from "../lib/api";

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

/**
 * Cold-start warm-up.
 *
 * The backend sleeps on its free tier; the wake-up currently lands on the
 * visitor's first enquiry, which is the worst possible request to make them
 * wait a minute for. Warming on first engagement with the form moves that
 * delay off the submit path.
 *
 * The constraint that matters is that it stays cheap and invisible: exactly
 * one request per page load, no polling, no slow-request event of its own, and
 * nothing that could show up in analytics.
 */
describe("cold-start warm-up", () => {
  beforeEach(() => {
    __resetWarmUpForTests();
  });

  afterEach(() => {
    global.fetch?.mockRestore?.();
  });

  it("hits the health endpoint, which is the cheapest route the server has", async () => {
    mockFetchOnce({ ok: true });
    await warmUpApi();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/health$/);
    expect(options.method).toBe("GET");
    // /api/health carries no rate limiter of its own, and crucially is not
    // /api/enquiries — a warm-up must never eat a visitor's enquiry allowance
    // (backend/server.js: 20 per 15 minutes on that route).
    expect(url).not.toMatch(/enquiries/);
  });

  it("fires at most once per page load, however many times it is called", async () => {
    mockFetchOnce({ ok: true });
    await warmUpApi();
    await warmUpApi();
    await warmUpApi();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("cannot be raced into a second request", async () => {
    // Two fields focused in the same tick must still produce one request.
    global.fetch = vi.fn(() => new Promise(() => {}));
    warmUpApi();
    warmUpApi();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("swallows a failure — a warm-up must never surface to the visitor", async () => {
    global.fetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(warmUpApi()).resolves.toBe(false);
  });

  it("does not fire the slow-request notice on its own", async () => {
    // The "Waking up the server" message belongs to a submit the visitor is
    // actually waiting on, not to a background warm-up they never asked for.
    vi.useFakeTimers();
    global.fetch = vi.fn(() => new Promise(() => {}));
    const handler = vi.fn();
    const unsubscribe = onSlowRequest(handler);

    warmUpApi();
    await vi.advanceTimersByTimeAsync(10000);

    expect(handler).not.toHaveBeenCalled();
    unsubscribe();
    vi.useRealTimers();
  });
});
