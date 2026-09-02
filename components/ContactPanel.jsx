"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  MessageSquare,
  Send,
  MessageCircle,
  Check,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { loadEnquiryDraft, clearEnquiryDraft, clearLegacyInbox } from "../lib/crmIntake";
import { createEnquirySubmitter } from "../lib/enquirySubmission";
import { api, onSlowRequest, warmUpApi } from "../lib/api";
import {
  trackPhoneClick,
  trackEmailClick,
  trackWhatsAppClick,
  trackConsultationSubmit,
  trackConsultationError,
} from "../lib/tracking";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  city: "",
  message: "",
  project_type: "",
};

const FIELD_LABELS = {
  name: "Your name",
  address: "Address / locality",
  phone: "Phone number",
  email: "Email address",
  city: "City",
  message: "Project description",
  project_type: "Project type",
};

const REQUIRED_FIELDS = ["name", "phone", "message"];

// One optional qualification field — a closed list, not a required question.
// Keeps this the same shape as the rest of the form: nothing new to type,
// one tap to answer or skip entirely.
const PROJECT_TYPES = ["Residential", "Renovation", "Modular Kitchen", "Commercial / Office", "Not sure yet"];

/**
 * One submitter for the module, not one per mount. Both the duplicate guard
 * and the in-flight guard have to outlive a remount to be worth anything —
 * closing and reopening the drawer must not hand the visitor a fresh state
 * machine that has forgotten what it already sent.
 */
const submitter = createEnquirySubmitter({ submit: (formData) => api.submitEnquiry(formData) });

export default function ContactPanel({ isOpen, onClose }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);
  /* A draft restored from a previous failed attempt, so the notice can say so. */
  const [restoredDraft, setRestoredDraft] = useState(false);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const revertTimer = useRef(null);

  const warmedRef = useRef(false);

  useEffect(() => () => clearTimeout(revertTimer.current), []);
  useEffect(() => onSlowRequest(() => setWakingServer(true)), []);

  /* Retire the old, misleadingly-named "inbox" key from returning visitors. */
  useEffect(() => clearLegacyInbox(), []);

  /**
   * Wake the sleeping backend on first real engagement with the form — not on
   * mount, and not on open. Once per page load; see warmUpApi().
   */
  const handleFirstIntent = () => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    warmUpApi();
  };

  /**
   * Restore an enquiry a previous attempt failed to send, so a refresh in the
   * middle of a failure does not cost the visitor their typing. Only ever
   * their own draft, only on open, and only when the form is otherwise blank
   * so it can never overwrite something they are in the middle of writing.
   */
  useEffect(() => {
    if (!isOpen) return;
    const draft = loadEnquiryDraft();
    if (!draft) return;
    setFormData((prev) => {
      const untouched = Object.values(prev).every((value) => !value.trim());
      if (!untouched) return prev;
      setRestoredDraft(true);
      setSubmitFailed(true);
      return { ...emptyForm, ...draft };
    });
  }, [isOpen]);

  /* Lock the page, move focus in, and wire Escape while the drawer is open. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  /* Reset back to a blank form once the closing transition has finished. */
  useEffect(() => {
    if (isOpen) return undefined;
    const timer = setTimeout(() => {
      setSent(false);
      setSubmitFailed(false);
      setRestoredDraft(false);
      setFormData(emptyForm);
      setErrors({});
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((key) => {
      if (!formData[key].trim()) nextErrors[key] = `${FIELD_LABELS[key]} is required`;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setWakingServer(false);
    setSubmitFailed(false);

    /* The submitter owns delivery, duplicate suppression and the draft; this
       handler only translates its answer into what the visitor sees. It never
       throws, so there is no failure path that can leave the button stuck. */
    const outcome = await submitter.send(formData);

    if (outcome.status === "sent" || outcome.status === "duplicate") {
      /* "duplicate" means this exact enquiry already reached the server, so
         showing the same confirmation is accurate — the alternative is telling
         someone their message failed when it did not. It is not re-counted as
         a conversion: only a real send fires the analytics event. */
      setSent(true);
      setRestoredDraft(false);
      setFormData(emptyForm);
      setErrors({});
      if (outcome.status === "sent") {
        trackConsultationSubmit("contact_panel", {
          has_email: Boolean(formData.email),
          city: formData.city || undefined,
        });
      }
      /* Briefly confirm, then return to a blank form so a visitor can send
         another enquiry without the panel feeling stuck on the receipt. */
      revertTimer.current = setTimeout(() => setSent(false), 2600);
    } else {
      /* Never claim success we did not have. Their typing is still on screen
         and, where storage allows, kept for a refresh; the banner offers the
         retry and the two channels that work when the API does not. */
      setSubmitFailed(true);
      trackConsultationError("contact_panel", "submit_failed");
    }

    setSubmitting(false);
    setWakingServer(false);
  };

  const fieldClass = (name) =>
    `field ${errors[name] ? "!border-red-300 !bg-red-50/40" : ""}`;

  return (
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-[80] bg-sage-950/40 backdrop-blur-sm transition-opacity duration-500 ease-smooth ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* `invisible` keeps the closed drawer out of the tab order; because
          visibility transitions discretely, the exit still animates fully. */}
      <aside
        ref={panelRef}
        className={`fixed inset-y-0 right-0 z-[90] flex w-full flex-col border-l border-line bg-canvas-soft shadow-float transition-all duration-500 ease-smooth sm:w-[27.5rem] ${
          isOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Contact Avaya Udyog"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-line bg-white px-7 py-7">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sage-100/80 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Contact us</span>
              <h2 className="display mt-3.5 text-[2.1rem] text-ink">
                Let&apos;s design
                <br />
                <span className="accent text-sage-600">together.</span>
              </h2>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-700 transition-all duration-300 hover:rotate-90 hover:border-sage-400 hover:bg-sage-50"
              aria-label="Close contact panel"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-6">
          <div className="rounded-[1.5rem] border border-line bg-white p-6 shadow-soft">
            {sent ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-800 text-white">
                  <Check size={24} strokeWidth={2.2} />
                </span>
                <p className="mt-5 font-display text-2xl font-semibold text-ink">
                  Thank you!
                </p>
                <p className="mt-2 text-[0.9rem] leading-[1.8] text-ink-muted">
                  Our design team will contact you shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 className="flex items-center gap-3 font-display text-xl font-semibold text-ink">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-600">
                    <Send size={15} strokeWidth={1.8} />
                  </span>
                  Send an Inquiry
                </h3>

                {/* onFocusCapture fires for whichever field the visitor reaches
                    first, including via keyboard; onInputCapture covers the
                    autofill case, where a browser can populate every field
                    without a focus event ever landing. Both funnel into the
                    same once-per-page-load guard, so the pair costs at most
                    one request. */}
                <form
                  onSubmit={handleSubmit}
                  onFocusCapture={handleFirstIntent}
                  onInputCapture={handleFirstIntent}
                  noValidate
                  className="mt-5 space-y-3.5"
                >
                  {/* The wording is load-bearing. It says the message did NOT
                      go through, and it never suggests anyone at Avaya Udyog
                      has a copy — because nobody does. What it offers instead
                      is the three things that are actually true: the typing is
                      still here, the button retries, and the phone and
                      WhatsApp both work when the API does not.
                      role="alert" so a screen reader hears the failure rather
                      than being left on a button that appears to have done
                      nothing. */}
                  {submitFailed && (
                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4">
                      <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
                      <div className="text-[0.84rem] leading-6 text-red-800">
                        <p className="font-semibold">
                          {restoredDraft
                            ? "This message still hasn't been sent."
                            : "We couldn't send that just now."}
                        </p>
                        <p className="mt-0.5 text-red-700">
                          {restoredDraft
                            ? "We've brought back what you typed last time so you don't have to write it again. Please try again, or reach us directly on "
                            : "Your details are still filled in below — please try again, or reach us directly on "}
                          <a href="tel:+917980640714" onClick={() => trackPhoneClick("error_fallback")} className="font-semibold underline underline-offset-2">call</a>
                          {" "}or{" "}
                          <a href="https://wa.me/917980640714" target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick("error_fallback")} className="font-semibold underline underline-offset-2">WhatsApp</a>.
                        </p>
                        {restoredDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              clearEnquiryDraft();
                              setRestoredDraft(false);
                              setSubmitFailed(false);
                              setFormData(emptyForm);
                              setErrors({});
                            }}
                            className="mt-2 text-[0.78rem] font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                          >
                            Start a new message instead
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <Field
                    icon={User}
                    name="name"
                    id="contact-name"
                    label="Your name"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    className={fieldClass("name")}
                  />
                  <Field
                    icon={Building}
                    name="address"
                    id="contact-address"
                    label="Address or locality"
                    placeholder="Address / Locality"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    className={fieldClass("address")}
                  />
                  <Field
                    icon={Phone}
                    type="tel"
                    name="phone"
                    id="contact-phone"
                    label="Phone number"
                    required
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    className={fieldClass("phone")}
                  />
                  <Field
                    icon={Mail}
                    type="email"
                    name="email"
                    id="contact-email"
                    label="Email address"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    className={fieldClass("email")}
                  />
                  <Field
                    icon={MapPin}
                    name="city"
                    id="contact-city"
                    label="City"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    className={fieldClass("city")}
                  />

                  <div className="relative">
                    <Layers className="field-icon" />
                    <label htmlFor="contact-project" className="sr-only">
                      Project type (optional)
                    </label>
                    <select
                      id="contact-project"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleInputChange}
                      className={fieldClass("project_type")}
                    >
                      <option value="">Project type (optional)</option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="relative">
                      <MessageSquare className="field-icon !top-5 !translate-y-0" />
                      <label htmlFor="contact-message" className="sr-only">
                        About your project
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        placeholder="Briefly describe your project..."
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        aria-invalid={Boolean(errors.message)}
                        className={`${fieldClass("message")} resize-none py-3.5`}
                      />
                    </div>
                    {errors.message && <FieldError message={errors.message} />}
                  </div>

                  {wakingServer && <p className="rounded-2xl border border-gold/40 bg-gold-soft/70 px-4 py-3 text-xs leading-5 text-gold-deep">Waking up the server — this can take up to a minute on the first message after a while. Hang tight, don&apos;t refresh.</p>}
                  <button type="submit" disabled={submitting} className="btn-primary group w-full disabled:opacity-60">
                    {submitting ? (wakingServer ? "Waking up…" : "Sending…") : submitFailed ? "Try again" : "Send Inquiry"}
                    <Send
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Direct channels */}
          <div className="space-y-2.5">
            <a
              href="tel:+917980640714"
              onClick={() => trackPhoneClick("contact_panel")}
              className="card card-hover group flex items-center gap-4 p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-colors duration-500 group-hover:bg-sage-800 group-hover:text-white">
                <Phone size={17} strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                  Call us
                </span>
                <span className="mt-0.5 block text-[0.9rem] font-semibold text-ink">
                  +91 79806 40714
                </span>
              </span>
            </a>

            <a
              href="https://wa.me/917980640714"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("contact_panel")}
              className="card card-hover group flex items-center gap-4 p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#25d366]/12 text-[#128c4a] transition-colors duration-500 group-hover:bg-[#25d366] group-hover:text-white">
                <MessageCircle size={17} strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                  WhatsApp
                </span>
                <span className="mt-0.5 block text-[0.9rem] font-semibold text-ink">
                  Chat with our team
                </span>
              </span>
            </a>

            <a
              href="mailto:info.avayaudyog@gmail.com"
              onClick={() => trackEmailClick("contact_panel")}
              className="card card-hover group flex items-center gap-4 p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-colors duration-500 group-hover:bg-sage-800 group-hover:text-white">
                <Mail size={17} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                  Email
                </span>
                <span className="mt-0.5 block truncate text-[0.9rem] font-semibold text-ink">
                  info.avayaudyog@gmail.com
                </span>
              </span>
            </a>
          </div>

          <div className="rounded-[1.25rem] border border-line-gold bg-gold-soft/50 p-5">
            <div className="flex items-start gap-3.5">
              <MapPin size={17} className="mt-0.5 flex-shrink-0 text-gold-deep" />
              <div>
                <p className="text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                  Our location
                </p>
                <p className="mt-1 text-[0.9rem] font-semibold text-ink">
                  Kolkata, West Bengal
                </p>
                <p className="mt-0.5 text-[0.8rem] text-ink-muted">
                  Serving clients across India
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function FieldError({ message }) {
  return <p className="mt-1.5 pl-1 text-[0.72rem] font-medium text-red-600">{message}</p>;
}

function Field({ icon: Icon, error, className, id, label, ...props }) {
  return (
    <div>
      {/* A placeholder is not an accessible name — it disappears the moment
          typing starts and is not reliably announced. The visible design is
          unchanged; the label exists for screen readers and for click-to-focus. */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon className="field-icon" />
        <input id={id} aria-invalid={Boolean(error)} className={className} {...props} />
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
