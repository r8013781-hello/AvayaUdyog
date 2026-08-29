"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionLink from "./SectionLink";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Send,
  User,
  MessageSquare,
  Building,
  Check,
  AlertTriangle,
} from "lucide-react";
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
  phone: "",
  email: "",
  city: "",
  address: "",
  message: "",
};

const FIELD_LABELS = {
  name: "Your name",
  phone: "Phone number",
  email: "Email address",
  city: "City",
  address: "Address / locality",
  message: "Project description",
};

const REQUIRED_FIELDS = ["name", "phone", "message"];

/**
 * Its own submitter, separate from the contact drawer's.
 *
 * The two forms are genuinely independent surfaces: someone can legitimately
 * send from the footer and then send a different enquiry from the drawer, and
 * a shared duplicate-guard would refuse the second one. What each instance
 * still guarantees is the thing that matters — one lead per press of ITS
 * button, however many times it is pressed.
 *
 * Module scope rather than per-render, so the guards survive a re-render.
 */
const submitter = createEnquirySubmitter({ submit: (formData) => api.submitEnquiry(formData) });

export default function Footer() {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);
  const revertTimer = useRef(null);
  const warmedRef = useRef(false);

  useEffect(() => () => clearTimeout(revertTimer.current), []);

  /**
   * Wake the sleeping backend on first engagement with this form. Once per
   * page load across the whole app — warmUpApi() holds the guard, so the
   * footer and the contact drawer between them still make at most one request.
   */
  const handleFirstIntent = () => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    warmUpApi();
  };
  // The backend spins down after inactivity on its current hosting plan —
  // the first submission after idle can take up to a minute to wake it back
  // up. Say so, rather than leaving the button looking frozen.
  useEffect(() => onSlowRequest(() => setWakingServer(true)), []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    /* Clear a field's error as soon as the visitor starts fixing it. */
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

    /* Delivery, duplicate suppression and the local draft all live in the
       submitter (lib/enquirySubmission.js). It never throws, so this handler
       has no path that can leave the button stuck mid-send. */
    const outcome = await submitter.send(formData);

    if (outcome.status === "sent" || outcome.status === "duplicate") {
      /* "duplicate" means the server already has this exact enquiry — showing
         the confirmation is the accurate answer, not a convenient one. Only a
         real send is counted as a conversion. */
      setSubmitted(true);
      setFormData(emptyForm);
      setErrors({});
      if (outcome.status === "sent") {
        trackConsultationSubmit("footer", {
          has_email: Boolean(formData.email),
          city: formData.city || undefined,
        });
      }
      /* Briefly confirm, then return to a blank form so a visitor (or the
         same device) can send another enquiry without feeling stuck. */
      revertTimer.current = setTimeout(() => setSubmitted(false), 2600);
    } else {
      /* Never claim success we did not have. Their typing stays on screen and
         the banner offers retry plus the channels that work when the API
         does not. */
      setSubmitFailed(true);
      trackConsultationError("footer", "submit_failed");
    }

    setSubmitting(false);
    setWakingServer(false);
  };

  const fieldClass = (name) =>
    `field ${errors[name] ? "!border-red-300 !bg-red-50/40 focus:!ring-red-500/10" : ""}`;

  return (
    <footer className="relative overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-paper absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_100%,#000_20%,transparent_70%)]" />
        <div className="absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-sage-100/60 blur-[130px]" />
      </div>

      <div className="shell relative pt-24 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* ---------- Brand + channels ---------- */}
          <div>
            <div className="flex items-center gap-3.5">
              <span className="relative inline-flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-[30%] bg-sage-800" />
                <span className="absolute inset-[3px] rotate-45 rounded-[28%] border border-gold/50" />
                <span className="relative font-display text-xl font-semibold text-white">
                  A
                </span>
              </span>
              <span>
                <span className="block font-display text-2xl font-semibold tracking-[0.01em] text-ink">
                  Avaya <span className="text-sage-600">Udyog</span>
                </span>
                <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-wider2 text-ink-muted">
                  Interior Design &amp; Decoration
                </span>
              </span>
            </div>

            <p className="mt-8 max-w-sm text-[0.98rem] leading-[1.85] text-ink-soft">
              Transforming spaces into timeless masterpieces for over 35 years —
              where luxury meets functionality, and your vision becomes reality.
            </p>

            <div className="mt-10 space-y-2.5">
              <a
                href="mailto:info.avayaudyog@gmail.com"
                onClick={() => trackEmailClick("footer")}
                className="card card-hover group flex items-center gap-4 p-4"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-colors duration-500 group-hover:bg-sage-800 group-hover:text-white">
                  <Mail size={18} strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                    Email us
                  </span>
                  <span className="mt-0.5 block truncate text-[0.9rem] font-semibold text-ink">
                    info.avayaudyog@gmail.com
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  className="flex-shrink-0 text-sage-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <a
                href="tel:+917980640714"
                onClick={() => trackPhoneClick("footer")}
                className="card card-hover group flex items-center gap-4 p-4"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-colors duration-500 group-hover:bg-sage-800 group-hover:text-white">
                  <Phone size={18} strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                    Call us
                  </span>
                  <span className="mt-0.5 block text-[0.9rem] font-semibold text-ink">
                    +91 79806 40714
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  className="flex-shrink-0 text-sage-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <div className="card flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
                  <MapPin size={18} strokeWidth={1.6} />
                </span>
                <span>
                  <span className="block text-[0.56rem] font-bold uppercase tracking-label text-ink-muted">
                    Location
                  </span>
                  <span className="mt-0.5 block text-[0.9rem] font-semibold text-ink">
                    Kolkata, West Bengal
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Consultation form ---------- */}
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-8 shadow-lift sm:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/[0.09] blur-3xl"
              aria-hidden="true"
            />

            <div className="relative">
              <span className="eyebrow">Start a project</span>
              <h2 className="display mt-5 text-[2rem] text-ink sm:text-[2.4rem]">
                Tell us about your{" "}
                <span className="accent text-sage-600">vision.</span>
              </h2>
              <p className="mt-3 text-[0.94rem] leading-[1.8] text-ink-muted">
                Share a few details and our design team will get back to you
                within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-9 rounded-[1.5rem] border border-line bg-sage-50 p-9 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-800 text-white">
                    <Check size={24} strokeWidth={2.2} />
                  </span>
                  <p className="mt-5 font-display text-2xl font-semibold text-ink">
                    Thank you!
                  </p>
                  <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                    Your inquiry has been received. Our design team will contact
                    you shortly.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  /* onFocusCapture / onInputCapture drive the cold-start
                     warm-up on first engagement — the pair covers keyboard
                     focus and browser autofill, and both funnel into the same
                     once-per-page-load guard in warmUpApi(). */
                  onFocusCapture={handleFirstIntent}
                  onInputCapture={handleFirstIntent}
                  noValidate
                  className="mt-9 space-y-3.5"
                >
                  {/* role="alert" so the failure is announced rather than
                      leaving a screen-reader user on a button that appears to
                      have done nothing. The copy states plainly that the
                      message did NOT send and never implies anyone has a copy
                      of it — nobody does. */}
                  {submitFailed && (
                    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4">
                      <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
                      <div className="text-[0.84rem] leading-6 text-red-800">
                        <p className="font-semibold">We couldn&apos;t send that just now.</p>
                        <p className="mt-0.5 text-red-700">
                          Your details are still filled in below — please try again, or reach us directly on{" "}
                          <a href="tel:+917980640714" onClick={() => trackPhoneClick("error_fallback")} className="font-semibold underline underline-offset-2">call</a>
                          {" "}or{" "}
                          <a href="https://wa.me/917980640714" target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick("error_fallback")} className="font-semibold underline underline-offset-2">WhatsApp</a>.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field
                      icon={User}
                      name="name"
                    id="footer-name"
                    label="Your name"
                    required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      className={fieldClass("name")}
                    />
                    <Field
                      icon={Phone}
                      type="tel"
                      name="phone"
                    id="footer-phone"
                    label="Phone number"
                    required
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      className={fieldClass("phone")}
                    />
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field
                      icon={Mail}
                      type="email"
                      name="email"
                    id="footer-email"
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
                    id="footer-city"
                    label="City"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={errors.city}
                      className={fieldClass("city")}
                    />
                  </div>

                  <Field
                    icon={Building}
                    name="address"
                    id="footer-address"
                    label="Address or locality"
                    placeholder="Address / Locality"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    className={fieldClass("address")}
                  />

                  <div>
                    <div className="relative">
                      <MessageSquare className="field-icon !top-5 !translate-y-0" />
                      <label htmlFor="footer-message" className="sr-only">
                        About your project
                      </label>
                      <textarea
                        id="footer-message"
                        name="message"
                        required
                        placeholder="Describe your project vision..."
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        aria-invalid={Boolean(errors.message)}
                        className={`${fieldClass("message")} resize-none py-4`}
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
              )}
            </div>
          </div>
        </div>

        {/* ---------- Studio / Services / Connect ---------- */}
        <FooterNav />

        {/* ---------- Bottom bar ---------- */}
        <div className="border-t border-line py-8">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div className="flex items-center gap-3.5">
              {/* A small heritage mark — not a certification, just a nod to "35 years". */}
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/45 text-center"
                aria-hidden="true"
              >
                <span className="leading-none">
                  <span className="block font-display text-[0.68rem] font-bold text-gold-deep">
                    35
                  </span>
                  <span className="block text-[0.3rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Years
                  </span>
                </span>
              </span>
              <p className="text-[0.8rem] text-ink-muted">
                © {new Date().getFullYear()} Avaya Udyog. Crafted with care in
                Kolkata.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="text-[0.8rem] font-medium text-ink-muted transition-colors hover:text-sage-700">
                Privacy Policy
              </Link>
              <span className="h-1 w-1 rotate-45 bg-gold/60" aria-hidden="true" />
              <Link href="/terms" className="text-[0.8rem] font-medium text-ink-muted transition-colors hover:text-sage-700">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Scrolls to an in-page section without ever touching the URL — no more
   `/#services`-style hashes cluttering the address bar. */
// "Services" appeared twice here — once as a route and once as a dead
// homepage-section scroll. Section entries are now /#id so they work from
// every page rather than only the homepage.
const STUDIO_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Process", href: "/#how-we-work" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Founder", href: "/#founder" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/#faq" },
];

// Two of these have a dedicated page and should go to it. The other two are
// homepage sections. Previously all four scrolled to #services, which meant
// four different labels did exactly the same thing and neither service page
// got a footer link at all.
// Design Consultation and Turnkey Execution have no page of their own, and
// should not get a thin one. They now anchor to their card on the services
// hub instead of scrolling to a section that exists only on the homepage.
const SERVICE_LINKS = [
  { label: "Residential Interiors", href: "/services/residential-interior-design" },
  { label: "Commercial Spaces", href: "/services/commercial-interior-design" },
  { label: "Modular Kitchens", href: "/services/modular-kitchen" },
  { label: "Renovation", href: "/services/home-renovation" },
  { label: "Design Consultation", href: "/#design-consultation" },
  { label: "Turnkey Execution", href: "/#turnkey-execution" },
];

// Only channels that actually go somewhere.
//
// Instagram, Facebook and LinkedIn were listed here with href="#" — three
// links that looked like a social presence and did nothing when clicked. A
// dead link is worse than an absent one: it spends a visitor's intent and
// returns nothing, and search engines read it as a broken outbound link.
// No profile URL exists anywhere in this repository (there is no `sameAs`
// in the JSON-LD either), so there was nothing to point them at.
//
// To restore them, add the real profile URLs here and mirror them into
// `sameAs` on localBusinessSchema in lib/schema.js so Google can connect the
// profiles to the business.
const CONNECT_LINKS = [
  { label: "WhatsApp", href: "https://wa.me/917980640714" },
  { label: "Call us", href: "tel:+917980640714" },
  { label: "Email us", href: "mailto:info.avayaudyog@gmail.com" },
];

function FooterColumn({ heading, children }) {
  return (
    <div>
      <p className="text-micro font-bold uppercase text-ink-muted">{heading}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FooterNav() {
  return (
    <div className="mt-20 border-t border-line pt-14">
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 sm:gap-x-10">
        <FooterColumn heading="Studio">
          <ul className="space-y-3">
            {STUDIO_LINKS.map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn heading="Services">
          <ul className="space-y-3">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn heading="Connect">
          <ul className="space-y-3">
            {CONNECT_LINKS.map((link) => {
              // Only http(s) destinations open in a new tab. tel: and mailto:
              // hand off to the device, so a new tab would leave a blank one
              // behind — and both are still real links, not buttons.
              const isHttp = link.href.startsWith("http");
              const onClick =
                link.label === "WhatsApp"
                  ? () => trackWhatsAppClick("footer")
                  : link.href.startsWith("tel:")
                    ? () => trackPhoneClick("footer_connect")
                    : link.href.startsWith("mailto:")
                      ? () => trackEmailClick("footer_connect")
                      : undefined;

              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={isHttp ? "_blank" : undefined}
                    rel={isHttp ? "noopener noreferrer" : undefined}
                    onClick={onClick}
                    className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </FooterColumn>
      </div>
    </div>
  );
}

function FieldError({ message }) {
  return <p className="mt-1.5 pl-1 text-[0.72rem] font-medium text-red-600">{message}</p>;
}

function Field({ icon: Icon, error, className, name, id, label, ...props }) {
  return (
    <div>
      {/* See ContactPanel's Field — placeholders are not accessible names. */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon className="field-icon" />
        <input
          id={id}
          name={name}
          aria-invalid={Boolean(error)}
          className={className}
          {...props}
        />
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}
