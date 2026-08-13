import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { captureWebsiteEnquiry } from "../lib/crmIntake";
import { api } from "../lib/api";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  city: "",
  message: "",
};

const FIELD_LABELS = {
  name: "Your name",
  address: "Address / locality",
  phone: "Phone number",
  email: "Email address",
  city: "City",
  message: "Project description",
};

const REQUIRED_FIELDS = ["name", "phone", "message"];

export default function ContactPanel({ isOpen, onClose }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const revertTimer = useRef(null);

  useEffect(() => () => clearTimeout(revertTimer.current), []);

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
    setSubmitFailed(false);
    try {
      await api.submitEnquiry(formData);
      setSent(true);
      setFormData(emptyForm);
      setErrors({});
      /* Briefly confirm, then return to a blank form so a visitor can send
         another enquiry without the panel feeling stuck on the receipt. */
      revertTimer.current = setTimeout(() => setSent(false), 2600);
    } catch {
      /* Keep it locally as a courtesy backup, but never tell the visitor we
         succeeded when we didn't — that's how enquiries go missing silently. */
      captureWebsiteEnquiry(formData, "Website enquiry");
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
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

                <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
                  {submitFailed && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4">
                      <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
                      <div className="text-[0.84rem] leading-6 text-red-800">
                        <p className="font-semibold">We couldn&apos;t send that just now.</p>
                        <p className="mt-0.5 text-red-700">
                          Your details are still filled in below — please try again, or reach us directly on{" "}
                          <a href="tel:+919830478820" className="font-semibold underline underline-offset-2">call</a>
                          {" "}or{" "}
                          <a href="https://wa.me/919830478820" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">WhatsApp</a>.
                        </p>
                      </div>
                    </div>
                  )}
                  <Field
                    icon={User}
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    className={fieldClass("name")}
                  />
                  <Field
                    icon={Building}
                    name="address"
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
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    className={fieldClass("email")}
                  />
                  <Field
                    icon={MapPin}
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    className={fieldClass("city")}
                  />

                  <div>
                    <div className="relative">
                      <MessageSquare className="field-icon !top-5 !translate-y-0" />
                      <textarea
                        name="message"
                        placeholder="Briefly describe your project..."
                        value={formData.query}
                        onChange={handleInputChange}
                        rows="4"
                        aria-invalid={Boolean(errors.query)}
                        className={`${fieldClass("message")} resize-none py-3.5`}
                      />
                    </div>
                    {errors.query && <FieldError message={errors.query} />}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary group w-full disabled:opacity-60">
                    {submitting ? "Sending…" : submitFailed ? "Try again" : "Send Inquiry"}
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
              href="tel:+919830478820"
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
                  +91 98304 78820
                </span>
              </span>
            </a>

            <a
              href="https://wa.me/919830478820"
              target="_blank"
              rel="noopener noreferrer"
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

function Field({ icon: Icon, error, className, ...props }) {
  return (
    <div>
      <div className="relative">
        <Icon className="field-icon" />
        <input aria-invalid={Boolean(error)} className={className} {...props} />
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
