import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEnquirySubmitter, enquiryFingerprint } from "../lib/enquirySubmission";
import {
  saveEnquiryDraft,
  loadEnquiryDraft,
  clearEnquiryDraft,
  clearLegacyInbox,
  DRAFT_TTL_MS,
  ENQUIRY_DRAFT_KEY,
  LEGACY_WEBSITE_INBOX_KEY,
} from "../lib/crmIntake";

/**
 * The lead pipeline's failure path.
 *
 * The bug this suite exists for: on a failed submit the old code wrote the
 * enquiry to the visitor's own localStorage under a key called
 * "avaya-crm-website-inbox" and moved on. Nothing read that key, and nothing
 * could — it lives in a stranger's browser. The lead was lost, and the code
 * read as though it had been captured.
 *
 * So the invariants under test are about honesty as much as behaviour: a
 * failure must be reported as a failure, the visitor's typing must survive it,
 * retry must be one click, and no retry may ever produce two leads.
 */

const FORM = {
  name: "Priya",
  phone: "9999999999",
  email: "priya@example.com",
  city: "Kolkata",
  address: "Salt Lake",
  message: "Three-bedroom flat, full interiors.",
};

function makeSubmitter(submit) {
  return createEnquirySubmitter({ submit });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("api failure", () => {
  it("reports a failure as a failure and never as a send", async () => {
    const submit = vi.fn().mockRejectedValue(new Error("Could not reach the server."));
    const outcome = await makeSubmitter(submit).send(FORM);

    expect(outcome.status).toBe("failed");
    // The one thing that must never happen: a visitor told it worked.
    expect(outcome.status).not.toBe("sent");
    expect(outcome.error).toBeInstanceOf(Error);
  });

  it("keeps the visitor's typing so a retry costs one click, not a retype", async () => {
    const submit = vi.fn().mockRejectedValue(new Error("boom"));
    await makeSubmitter(submit).send(FORM);

    expect(loadEnquiryDraft()).toEqual(FORM);
  });

  it("still fails cleanly when storage is unavailable", async () => {
    // Private-mode browsers throw on setItem. Losing the draft is acceptable;
    // throwing out of the submit handler and freezing the button is not.
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const submit = vi.fn().mockRejectedValue(new Error("boom"));

    const outcome = await makeSubmitter(submit).send(FORM);
    expect(outcome.status).toBe("failed");
    expect(outcome.draftSaved).toBe(false);
    spy.mockRestore();
  });
});

describe("retry", () => {
  it("sends again after a failure and reports success", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("cold start timed out"))
      .mockResolvedValueOnce({ id: 42 });
    const submitter = makeSubmitter(submit);

    const first = await submitter.send(FORM);
    expect(first.status).toBe("failed");

    const second = await submitter.send(FORM);
    expect(second.status).toBe("sent");
    expect(second.result).toEqual({ id: 42 });
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("clears the draft once the retry succeeds", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ id: 1 });
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    expect(loadEnquiryDraft()).toEqual(FORM);

    await submitter.send(FORM);
    // A draft that outlives its enquiry is just abandoned personal data.
    expect(loadEnquiryDraft()).toBeNull();
    expect(window.localStorage.getItem(ENQUIRY_DRAFT_KEY)).toBeNull();
  });

  it("retries an edited enquiry as the edited one", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ id: 2 });
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    const corrected = { ...FORM, phone: "8888888888" };
    await submitter.send(corrected);

    expect(submit).toHaveBeenLastCalledWith(corrected);
  });
});

describe("duplicate prevention", () => {
  it("collapses a double submit into a single request", async () => {
    // Enter held down, or a double tap on a slow phone: both clicks land
    // before React can re-render the button into its disabled state.
    let resolveSubmit;
    const submit = vi.fn(() => new Promise((resolve) => { resolveSubmit = resolve; }));
    const submitter = makeSubmitter(submit);

    const a = submitter.send(FORM);
    const b = submitter.send(FORM);
    resolveSubmit({ id: 7 });

    const [first, second] = await Promise.all([a, b]);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(first.status).toBe("sent");
    expect(second.status).toBe("sent");
  });

  it("does not re-send an enquiry the server already accepted", async () => {
    const submit = vi.fn().mockResolvedValue({ id: 3 });
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    const again = await submitter.send(FORM);

    expect(again.status).toBe("duplicate");
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submitter.hasBeenAccepted(FORM)).toBe(true);
  });

  it("treats a changed enquiry as a genuinely new one", async () => {
    const submit = vi.fn().mockResolvedValue({ id: 4 });
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    const outcome = await submitter.send({ ...FORM, message: "Also the kitchen." });

    expect(outcome.status).toBe("sent");
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("does not treat stray whitespace as a different enquiry", async () => {
    const submit = vi.fn().mockResolvedValue({ id: 5 });
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    const outcome = await submitter.send({ ...FORM, name: "  Priya  " });

    expect(outcome.status).toBe("duplicate");
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("does not block a second enquiry after a failure — only after a success", async () => {
    const submit = vi.fn().mockRejectedValue(new Error("boom"));
    const submitter = makeSubmitter(submit);

    await submitter.send(FORM);
    const outcome = await submitter.send(FORM);

    expect(outcome.status).toBe("failed");
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("reports nothing in flight once a request settles", async () => {
    const submit = vi.fn().mockResolvedValue({ id: 6 });
    const submitter = makeSubmitter(submit);
    const pending = submitter.send(FORM);
    expect(submitter.isSending).toBe(true);
    await pending;
    expect(submitter.isSending).toBe(false);
  });
});

describe("success after retry", () => {
  it("survives two failures and then delivers exactly one lead", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("500"))
      .mockResolvedValueOnce({ id: 99 });
    const submitter = makeSubmitter(submit);

    expect((await submitter.send(FORM)).status).toBe("failed");
    expect((await submitter.send(FORM)).status).toBe("failed");
    expect((await submitter.send(FORM)).status).toBe("sent");

    // A fourth press must not file a second lead.
    expect((await submitter.send(FORM)).status).toBe("duplicate");
    expect(submit).toHaveBeenCalledTimes(3);
    expect(loadEnquiryDraft()).toBeNull();
  });
});

describe("draft storage is the visitor's, not a server backup", () => {
  it("stores only the fields the visitor typed", async () => {
    saveEnquiryDraft({ ...FORM, utm_source: "google", gclid: "abc", id: "WEB-1" });
    const stored = JSON.parse(window.localStorage.getItem(ENQUIRY_DRAFT_KEY));

    expect(Object.keys(stored.form).sort()).toEqual(
      ["address", "city", "email", "message", "name", "phone"].sort(),
    );
    expect(JSON.stringify(stored)).not.toMatch(/gclid|utm_source|WEB-/);
  });

  it("expires a stale draft rather than holding personal data indefinitely", () => {
    const now = Date.now();
    saveEnquiryDraft(FORM, now);

    expect(loadEnquiryDraft(now + DRAFT_TTL_MS - 1)).toEqual(FORM);
    expect(loadEnquiryDraft(now + DRAFT_TTL_MS + 1)).toBeNull();
    // Expiry deletes rather than merely hiding.
    expect(window.localStorage.getItem(ENQUIRY_DRAFT_KEY)).toBeNull();
  });

  it("discards a corrupted draft instead of throwing", () => {
    window.localStorage.setItem(ENQUIRY_DRAFT_KEY, "{not json");
    expect(() => loadEnquiryDraft()).not.toThrow();
    expect(loadEnquiryDraft()).toBeNull();
  });

  it("clears on demand", () => {
    saveEnquiryDraft(FORM);
    clearEnquiryDraft();
    expect(loadEnquiryDraft()).toBeNull();
  });

  it("retires the old misleadingly-named inbox key", () => {
    // The key asserted a CRM inbox that never existed. It is deleted, not
    // migrated — migrating it would carry the same false claim forward.
    window.localStorage.setItem(LEGACY_WEBSITE_INBOX_KEY, JSON.stringify([{ id: "WEB-1" }]));
    clearLegacyInbox();
    expect(window.localStorage.getItem(LEGACY_WEBSITE_INBOX_KEY)).toBeNull();
  });

  it("no longer exposes anything named like a server-side capture", async () => {
    const crmIntake = await import("../lib/crmIntake");
    expect(crmIntake.captureWebsiteEnquiry).toBeUndefined();
    expect(crmIntake.WEBSITE_INBOX_KEY).toBeUndefined();
  });
});

describe("fingerprint", () => {
  it("ignores field order and undefined values", () => {
    expect(enquiryFingerprint({ name: "A", phone: "1" })).toBe(
      enquiryFingerprint({ phone: "1", name: "A", email: undefined }),
    );
  });
});

/**
 * Every enquiry surface must go through the submitter.
 *
 * This exists because of a real miss during this work: the contact drawer was
 * converted and components/Footer.jsx — a second, equally live enquiry form —
 * was not. It kept calling the deleted captureWebsiteEnquiry(), which the
 * build reported only as a warning. In production that is a ReferenceError on
 * the failure path: the one moment the visitor most needs the retry UI is the
 * exact moment the component would have crashed.
 *
 * A grep-level test rather than a render test on purpose. The failure mode is
 * "somebody added a third form and wired it straight to api.submitEnquiry",
 * and no amount of testing the two known forms would catch that.
 */
describe("enquiry surfaces", () => {
  const { readFileSync, readdirSync } = require("node:fs");
  const { join } = require("node:path");

  const componentSources = readdirSync(join(process.cwd(), "components"))
    .filter((name) => name.endsWith(".jsx"))
    .map((name) => ({
      file: `components/${name}`,
      source: readFileSync(join(process.cwd(), "components", name), "utf8"),
    }));

  /** Anything that renders a form and submits an enquiry. */
  const enquiryForms = componentSources.filter(
    ({ source }) => source.includes("<form") && source.includes("submitEnquiry"),
  );

  it("finds the known enquiry forms", () => {
    // ContactPanel (the drawer) and Footer. If this number changes, the new
    // surface must satisfy the assertions below.
    expect(enquiryForms.map((f) => f.file).sort()).toEqual([
      "components/ContactPanel.jsx",
      "components/Footer.jsx",
    ]);
  });

  it.each(enquiryForms.map((f) => [f.file, f.source]))(
    "%s submits through createEnquirySubmitter",
    (file, source) => {
      expect(source, `${file} must use the submitter`).toMatch(/createEnquirySubmitter/);
      // A bare `await api.submitEnquiry(...)` in a handler bypasses the
      // duplicate guard and the draft entirely.
      expect(source, `${file} calls api.submitEnquiry directly`).not.toMatch(
        /await\s+api\.submitEnquiry/,
      );
    },
  );

  it.each(enquiryForms.map((f) => [f.file, f.source]))(
    "%s warms the backend on first engagement",
    (file, source) => {
      expect(source, `${file} should warm the cold-start`).toMatch(/warmUpApi/);
      expect(source).toMatch(/onFocusCapture=\{handleFirstIntent\}/);
    },
  );

  it.each(enquiryForms.map((f) => [f.file, f.source]))(
    "%s never claims a failed enquiry was saved",
    (file, source) => {
      // The old copy called localStorage a "backup". No surface may imply that
      // anyone at Avaya Udyog can recover a lead the API rejected.
      expect(source, `${file} still references the deleted capture helper`).not.toMatch(
        /captureWebsiteEnquiry/,
      );
      expect(source, `${file} describes local storage as a backup`).not.toMatch(
        /courtesy backup|we have saved|saved your enquiry|we've got your details/i,
      );
    },
  );

  it.each(enquiryForms.map((f) => [f.file, f.source]))(
    "%s announces a failure to assistive technology",
    (file, source) => {
      expect(source, `${file} failure banner needs role="alert"`).toMatch(
        /role="alert"/,
      );
    },
  );

  it.each(enquiryForms.map((f) => [f.file, f.source]))(
    "%s counts a conversion only on a real send, never on a duplicate",
    (file, source) => {
      // Firing trackConsultationSubmit for a suppressed duplicate would
      // double-count the same lead in GA4 and in Ads conversion data.
      expect(source).toMatch(/if \(outcome\.status === "sent"\)/);
    },
  );
});
