"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, User, Phone, Layers, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { createEnquirySubmitter } from "../lib/enquirySubmission";
import { api, onSlowRequest, warmUpApi } from "../lib/api";
import { trackEvent, trackConsultationSubmit, trackConsultationError } from "../lib/tracking";
import { promoSlideFor } from "../lib/promoQuotes";

/**
 * Recurring promotional popup for the marketing site.
 *
 * Behaviour, and the reasoning behind each guard:
 *
 *   • First appearance 45s after load, then every 45s — the interval the brief
 *     asked for — but capped at MAX_APPEARANCES per browser session so it can
 *     never become hostile.
 *   • Never opens while another modal owns the screen (the contact drawer and
 *     the login dialog both lock <body> scroll — that's the signal we read),
 *     while the tab is hidden, or once the visitor has converted.
 *   • The 45s clock pauses on a hidden tab and resumes on return, so a
 *     backgrounded tab can't ambush the visitor with a stale popup.
 *   • A successful submit sets a session flag and the popup never appears
 *     again for that session.
 *   • Each appearance rotates to a different marketing headline + background
 *     photo (lib/promoQuotes.js), continuing across reloads.
 *
 * SSG-safe: every timer, storage read and DOM touch is inside an effect, so
 * the one build-time render in Node is a no-op.
 */

const INTERVAL_MS = 45_000;
const MAX_APPEARANCES = 4;
const KEY_CONVERTED = "avaya_promo_converted";
const KEY_APPEARANCES = "avaya_promo_appearances";

const PROJECT_TYPES = ["Residential", "Renovation", "Modular Kitchen", "Commercial / Office", "Not sure yet"];

/** One submitter for the module — the dedupe / in-flight guards must outlive remounts. */
const submitter = createEnquirySubmitter({ submit: (formData) => api.submitEnquiry(formData) });

function readInt(key, fallback = 0) {
  try {
    const value = Number(window.sessionStorage.getItem(key));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  } catch {
    return fallback;
  }
}
function writeInt(key, value) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    /* private mode / storage disabled — state just won't persist */
  }
}
function readFlag(key) {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function writeFlag(key) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [appearance, setAppearance] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", project_type: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const timerRef = useRef(null);
  const firstFieldRef = useRef(null);
  const lastFocusRef = useRef(null);
  const warmedRef = useRef(false);
  const autocloseRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Another modal open? The contact drawer and the login dialog both do this.
  const anotherModalOpen = () =>
    typeof document !== "undefined" && document.body.style.overflow === "hidden";

  const schedule = useCallback(() => {
    clearTimer();
    if (readFlag(KEY_CONVERTED)) return;
    if (readInt(KEY_APPEARANCES) >= MAX_APPEARANCES) return;
    if (typeof document !== "undefined" && document.hidden) return; // resumes via visibilitychange

    timerRef.current = setTimeout(() => {
      // Re-check every guard at fire time, not only at schedule time.
      if (readFlag(KEY_CONVERTED) || readInt(KEY_APPEARANCES) >= MAX_APPEARANCES) return;
      if (document.hidden || anotherModalOpen()) {
        schedule(); // not now — try again next cycle
        return;
      }
      const n = readInt(KEY_APPEARANCES);
      writeInt(KEY_APPEARANCES, n + 1);
      setAppearance(n);
      setForm({ name: "", phone: "", project_type: "" });
      setErrors({});
      setSent(false);
      setFailed(false);
      setOpen(true);
      trackEvent("promo_popup_open", { appearance: n + 1 });
    }, INTERVAL_MS);
  }, []);

  // Boot + tab-visibility handling.
  useEffect(() => {
    if (readFlag(KEY_CONVERTED)) return undefined;

    // ?promo=now opens it straight away — a preview hook for reviewing the
    // copy and layout without waiting out the 45s timer.
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("promo") === "now") {
      setAppearance(readInt(KEY_APPEARANCES));
      setOpen(true);
      trackEvent("promo_popup_open", { appearance: "preview" });
    }

    schedule();
    const onVisibility = () => {
      if (document.hidden) clearTimer();
      else if (!open) schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimer();
      clearTimeout(autocloseRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => onSlowRequest(() => setWakingServer(true)), []);

  // Open: lock scroll, move focus in, wire Escape, restore focus on close.
  useEffect(() => {
    if (!open) return undefined;
    lastFocusRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") dismiss("escape");
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
      document.body.style.overflow = "";
      lastFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFirstIntent = () => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    warmUpApi();
  };

  const dismiss = (reason) => {
    setOpen((wasOpen) => {
      if (wasOpen) {
        trackEvent("promo_popup_dismiss", { reason, appearance });
        schedule();
      }
      return false;
    });
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.phone.trim()) next.phone = "Please enter a phone number";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    setWakingServer(false);
    setFailed(false);

    const message = `${form.project_type ? `${form.project_type} project.` : "Interior consultation."} (Requested via website pop-up.)`;

    const outcome = await submitter.send({
      name: form.name,
      phone: form.phone,
      email: "",
      city: "",
      address: "",
      project_type: form.project_type,
      message,
    });

    if (outcome.status === "sent" || outcome.status === "duplicate") {
      setSent(true);
      writeInt(KEY_APPEARANCES, MAX_APPEARANCES);
      writeFlag(KEY_CONVERTED);
      clearTimer();
      if (outcome.status === "sent") {
        trackConsultationSubmit("promo_popup", { project_type: form.project_type || undefined });
      }
      autocloseRef.current = setTimeout(() => setOpen(false), 2600);
    } else {
      setFailed(true);
      trackConsultationError("promo_popup", "submit_failed");
    }

    setSubmitting(false);
    setWakingServer(false);
  };

  if (!open) return null;

  const { quote, background } = promoSlideFor(appearance);

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-headline"
    >
      <button
        aria-label="Close"
        onClick={() => dismiss("scrim")}
        className="promo-fade absolute inset-0 h-full w-full cursor-default bg-sage-950/60 backdrop-blur-sm"
      />

      {/* One full-bleed photo behind everything, turned into an atmospheric
          backdrop by a deep gradient so white text and glass inputs keep
          their contrast. */}
      <div className="promo-pop relative isolate w-full max-w-[27rem] overflow-hidden rounded-[2rem] text-white shadow-float ring-1 ring-white/10">
        <div
          className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-sage-950/72 via-sage-950/85 to-sage-950/97"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-56 w-56 rounded-full bg-gold/25 blur-3xl"
          aria-hidden="true"
        />
        {/* Fine gold hairline along the top edge — the one premium accent. */}
        <div className="absolute inset-x-0 top-0 h-px bg-gold-hair" aria-hidden="true" />

        <button
          onClick={() => dismiss("close_button")}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-white/20 backdrop-blur transition hover:rotate-90 hover:bg-white/20 hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="p-8">
          {sent ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-gold-light ring-1 ring-white/25 backdrop-blur">
                <Check size={26} strokeWidth={2.2} />
              </span>
              <p className="display mt-5 text-2xl text-white">Thank you.</p>
              <p className="mx-auto mt-2 max-w-xs text-[0.92rem] leading-6 text-white/75">
                Our design &amp; décor team will call you back shortly to plan your space.
              </p>
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold-light">
                <Sparkles size={12} /> Avaya Udyog — Interior Design &amp; Décor
              </span>
              <div className="mt-3 h-px w-full bg-gold-hair opacity-80" aria-hidden="true" />

              <h2 id="promo-headline" className="display mt-4 text-[1.9rem] leading-[1.08] text-white">
                {quote.headline}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-[1.65] text-white/75">{quote.sub}</p>

              <form
                onSubmit={submit}
                onFocusCapture={handleFirstIntent}
                onInputCapture={handleFirstIntent}
                noValidate
                className="mt-6 space-y-2.5 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-md"
              >
                <p className="text-[0.78rem] font-semibold text-white/90">
                  Book a free consultation — no obligation.
                </p>

                {failed && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl bg-red-500/15 p-3 text-[0.8rem] leading-5 text-red-50 ring-1 ring-red-300/30"
                  >
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-200" />
                    <span>
                      That didn&apos;t go through. Please try again, or call us on{" "}
                      <a href="tel:+917980640714" className="font-semibold underline underline-offset-2">
                        +91 79806 40714
                      </a>
                      .
                    </span>
                  </div>
                )}

                <PromoField
                  ref={firstFieldRef}
                  icon={User}
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={change}
                  error={errors.name}
                />
                <PromoField
                  icon={Phone}
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={change}
                  error={errors.phone}
                />
                <div className="relative">
                  <Layers className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                  <label htmlFor="promo-project" className="sr-only">
                    Project type
                  </label>
                  <select
                    id="promo-project"
                    name="project_type"
                    value={form.project_type}
                    onChange={change}
                    className="w-full appearance-none rounded-xl border border-white/25 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-gold-light/60 focus:bg-white/15 focus:ring-2 focus:ring-gold-light/25 [&>option]:text-ink"
                  >
                    <option value="">Project type (optional)</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {wakingServer && (
                  <p className="flex items-start gap-2 rounded-xl bg-gold/15 px-3.5 py-2.5 text-[0.72rem] leading-5 text-gold-light ring-1 ring-gold/25">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-gold-light" aria-hidden="true" />
                    Connecting to our team — this can take a few seconds. Please don&apos;t close this.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-fill px-6 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-sage-950 shadow-gold transition-all duration-300 ease-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {submitting ? (wakingServer ? "Waking up…" : "Sending…") : failed ? "Try again" : "Request a callback"}
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.66rem] font-semibold uppercase tracking-[0.09em] text-white/55">
                <span>35+ years</span>
                <span className="text-white/25">•</span>
                <span>700+ projects</span>
                <span className="text-white/25">•</span>
                <span>100% satisfaction</span>
              </div>

              <button
                type="button"
                onClick={() => dismiss("maybe_later")}
                className="mt-2 w-full text-center text-[0.74rem] font-semibold text-white/45 transition hover:text-white/70"
              >
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const PromoField = forwardRef(function PromoField({ icon: Icon, error, ...props }, ref) {
  return (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder-white/55 outline-none transition focus:bg-white/15 focus:ring-2 focus:ring-gold-light/25 ${
            error ? "border-red-300/70 bg-red-500/10" : "border-white/25 focus:border-gold-light/60"
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 pl-1 text-[0.72rem] font-medium text-red-200">{error}</p>}
    </div>
  );
});
