import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  trackEvent,
  trackPhoneClick,
  trackWhatsAppClick,
  trackConsultationSubmit,
  trackConsultationError,
} from "../lib/tracking";
import { captureTrackingParams, getTrackingParams } from "../lib/trackingParams";

/**
 * The measurement layer had no tests. It is the code that decides whether any
 * of the SEO and ad spend can be attributed at all, and its central promise is
 * that it never throws — an ad-blocker, private browsing or a missing GA id
 * must never take the page down with it.
 */

const STORAGE_KEY = "avaya-tracking-params";

function setUrl(href) {
  window.history.replaceState({}, "", href);
}

describe("tracking events", () => {
  beforeEach(() => {
    delete window.gtag;
    sessionStorage.clear();
  });

  it("does not throw when gtag never loaded", () => {
    // Ad-blockers make this the normal case for a meaningful share of visitors.
    expect(() => trackEvent("test_event", { a: 1 })).not.toThrow();
    expect(() => trackPhoneClick("navbar")).not.toThrow();
    expect(() => trackWhatsAppClick("footer")).not.toThrow();
    expect(() => trackConsultationSubmit("footer")).not.toThrow();
    expect(() => trackConsultationError("footer", "submit_failed")).not.toThrow();
  });

  it("forwards the event name and params to gtag", () => {
    window.gtag = vi.fn();
    trackEvent("consultation_form_open", { trigger_source: "hero" });
    expect(window.gtag).toHaveBeenCalledWith("event", "consultation_form_open", {
      trigger_source: "hero",
    });
  });

  it("labels the click location on a phone click", () => {
    window.gtag = vi.fn();
    trackPhoneClick("navbar");
    expect(window.gtag).toHaveBeenCalledWith("event", "phone_click", {
      link_location: "navbar",
    });
  });

  it("fires no Ads conversion while the Ads account is unconfigured", () => {
    // NEXT_PUBLIC_GOOGLE_ADS_ID is unset in this project today. A conversion
    // sent to an empty send_to would be silently discarded by Google and look
    // like it worked.
    window.gtag = vi.fn();
    trackConsultationSubmit("footer");

    const conversions = window.gtag.mock.calls.filter(
      (call) => call[1] === "conversion",
    );
    expect(conversions).toHaveLength(0);
  });
});

describe("attribution capture", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setUrl("/");
  });

  afterEach(() => setUrl("/"));

  it("captures campaign parameters from the landing URL", () => {
    setUrl("/?utm_source=google&utm_medium=cpc&utm_campaign=kolkata&gclid=CjwKCA");
    captureTrackingParams();

    const params = getTrackingParams();
    expect(params.utm_source).toBe("google");
    expect(params.utm_medium).toBe("cpc");
    expect(params.utm_campaign).toBe("kolkata");
    expect(params.gclid).toBe("CjwKCA");
  });

  it("records the landing page for organic visits too", () => {
    setUrl("/services");
    captureTrackingParams();
    expect(getTrackingParams().landing_page).toBe("/services");
  });

  it("keeps the FIRST organic landing page across later page loads", () => {
    // Otherwise every attributed lead would look like it came from whichever
    // page the visitor happened to be on when they finally submitted.
    setUrl("/services");
    captureTrackingParams();

    setUrl("/services/residential-interior-design");
    captureTrackingParams();

    expect(getTrackingParams().landing_page).toBe("/services");
  });

  it("lets a real campaign arrival overwrite an earlier organic visit", () => {
    setUrl("/");
    captureTrackingParams();

    setUrl("/services?utm_source=google&gclid=NEW");
    captureTrackingParams();

    const params = getTrackingParams();
    expect(params.gclid).toBe("NEW");
    expect(params.landing_page).toBe("/services");
  });

  it("captures only whitelisted parameters", () => {
    // Whatever this returns is spread straight into the enquiry POST body, so
    // arbitrary query strings must not become arbitrary payload fields.
    setUrl("/?utm_source=google&evil=payload&admin=true");
    captureTrackingParams();

    const params = getTrackingParams();
    expect(params.utm_source).toBe("google");
    expect(params).not.toHaveProperty("evil");
    expect(params).not.toHaveProperty("admin");
  });

  it("returns an empty object rather than throwing on corrupt storage", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not json");
    expect(() => getTrackingParams()).not.toThrow();
    expect(getTrackingParams()).toEqual({});
  });

  it("survives sessionStorage being unavailable", () => {
    // Safari private browsing throws on setItem rather than failing quietly.
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError");
    };
    try {
      expect(() => captureTrackingParams()).not.toThrow();
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
