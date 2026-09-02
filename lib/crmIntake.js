/**
 * Local draft storage for an enquiry that FAILED to send.
 *
 * ── What this used to be, and why it was dangerous ─────────────────────────
 * This module was called a "backup". It wrote the failed enquiry into the
 * visitor's own localStorage under a key named `avaya-crm-website-inbox`, and
 * nothing ever read it. It could not have been read: localStorage is
 * origin-scoped and device-scoped, so a record sitting in a stranger's browser
 * on their phone is not reachable by the CRM, by the backend, or by anyone at
 * Avaya Udyog — not later, not ever. The name "inbox" made it look like a
 * lead had been captured somewhere recoverable. It had not. The lead was gone,
 * and the code said otherwise, which is worse than having no fallback at all
 * because it is the kind of thing that stops anyone from building a real one.
 *
 * ── What it is now ─────────────────────────────────────────────────────────
 * Exactly one honest thing: the visitor's own unsent draft, kept so that THEY
 * can retry without retyping — including after an accidental refresh or a tab
 * crash mid-failure. It is a convenience for the person at the keyboard. It is
 * not a backup, it is not a record, and no code or copy anywhere may describe
 * it as one. The only party who can recover a lead from here is the visitor,
 * by pressing "Try again".
 *
 * Consequences of that framing, all deliberate:
 *
 *   * It is cleared the instant a send succeeds. A draft that outlives its
 *     enquiry is just abandoned personal data.
 *   * It expires (DRAFT_TTL_MS). Someone who failed to send a week ago and
 *     came back is not owed their old message, and their name, phone number
 *     and address should not sit in the browser indefinitely.
 *   * It stores only the form fields the visitor typed. No tracking
 *     parameters, no identifiers, nothing they did not enter themselves.
 *
 * The genuine fix for a lost lead is server-side — the enquiry has to reach
 * something durable. Until then the honest fallback is: never claim success,
 * keep their typing, make retry one click, and show the phone/WhatsApp route
 * that works when the API does not (see components/ContactPanel.jsx).
 */

/**
 * Deliberately a new key. The old `avaya-crm-website-inbox` name asserted a
 * CRM inbox that never existed; anything written under it is unreachable
 * legacy data and is cleaned up on first use rather than migrated, because
 * migrating it would preserve the same false claim in a new key.
 */
const DRAFT_KEY = "avaya-enquiry-draft";
const LEGACY_INBOX_KEY = "avaya-crm-website-inbox";

/** Long enough to survive a refresh or a walk to better signal; not longer. */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const FIELDS = ["name", "phone", "email", "city", "address", "message", "project_type"];

function storage() {
  try {
    // Private-mode Safari and storage-blocked browsers throw on access, not
    // just on write, so even reading `window.localStorage` needs the guard.
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Only the fields the visitor typed — never tracking params or ids. */
function pickFields(formData) {
  return FIELDS.reduce((acc, key) => {
    acc[key] = typeof formData?.[key] === "string" ? formData[key] : "";
    return acc;
  }, {});
}

/**
 * Persist an enquiry the visitor tried to send and we could not deliver.
 * Returns true only if it was actually written — the caller must never treat
 * a false here as anything other than "the draft is gone too".
 */
export function saveEnquiryDraft(formData, now = Date.now()) {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(DRAFT_KEY, JSON.stringify({ savedAt: now, form: pickFields(formData) }));
    return true;
  } catch {
    // Quota exceeded, or storage disabled. The form stays usable and the
    // in-memory form state is untouched, so retry still works on this page.
    return false;
  }
}

/** The visitor's unsent draft, or null if there isn't a live one. */
export function loadEnquiryDraft(now = Date.now()) {
  const store = storage();
  if (!store) return null;
  let parsed;
  try {
    const raw = store.getItem(DRAFT_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || !parsed.form) {
    clearEnquiryDraft();
    return null;
  }
  if (typeof parsed.savedAt !== "number" || now - parsed.savedAt > DRAFT_TTL_MS) {
    clearEnquiryDraft();
    return null;
  }
  return pickFields(parsed.form);
}

/** Drop the draft. Called on every successful send, and on expiry. */
export function clearEnquiryDraft() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(DRAFT_KEY);
  } catch {
    /* Nothing to do — an undeletable draft is harmless, an unhandled throw isn't. */
  }
}

/**
 * Remove the old, misleadingly-named key from any browser that still carries
 * it. Not a migration: that data represents enquiries that were never
 * delivered and are far past any useful retry window.
 */
export function clearLegacyInbox() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(LEGACY_INBOX_KEY);
  } catch {
    /* Best effort. */
  }
}

export const ENQUIRY_DRAFT_KEY = DRAFT_KEY;
export const LEGACY_WEBSITE_INBOX_KEY = LEGACY_INBOX_KEY;
