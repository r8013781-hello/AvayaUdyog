import React, { useState } from "react";
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
} from "lucide-react";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  query: "",
};

const FIELD_LABELS = {
  name: "Your name",
  phone: "Phone number",
  email: "Email address",
  city: "City",
  address: "Address / locality",
  query: "Project description",
};

export default function Footer() {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    /* Clear a field's error as soon as the visitor starts fixing it. */
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    Object.keys(emptyForm).forEach((key) => {
      if (!formData[key].trim()) nextErrors[key] = `${FIELD_LABELS[key]} is required`;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    console.log("Query Submitted:", formData);
    setSubmitted(true);
    setFormData(emptyForm);
    setErrors({});
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
                  Interior Design
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
                href="tel:+919830478820"
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
                    +91 98304 78820
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
                <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-3.5">
                  <div className="grid gap-3.5 sm:grid-cols-2">
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
                      icon={Phone}
                      type="tel"
                      name="phone"
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
                  </div>

                  <Field
                    icon={Building}
                    name="address"
                    placeholder="Address / Locality"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    className={fieldClass("address")}
                  />

                  <div>
                    <div className="relative">
                      <MessageSquare className="field-icon !top-5 !translate-y-0" />
                      <textarea
                        name="query"
                        placeholder="Describe your project vision..."
                        value={formData.query}
                        onChange={handleInputChange}
                        rows="4"
                        aria-invalid={Boolean(errors.query)}
                        className={`${fieldClass("query")} resize-none py-4`}
                      />
                    </div>
                    {errors.query && <FieldError message={errors.query} />}
                  </div>

                  <button type="submit" className="btn-primary group w-full">
                    Send Inquiry
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

        {/* ---------- Studio / Services / Connect / Newsletter ---------- */}
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
              <a
                href="#"
                className="text-[0.8rem] font-medium text-ink-muted transition-colors hover:text-sage-700"
              >
                Privacy Policy
              </a>
              <span className="h-1 w-1 rotate-45 bg-gold/60" aria-hidden="true" />
              <a
                href="#"
                className="text-[0.8rem] font-medium text-ink-muted transition-colors hover:text-sage-700"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const STUDIO_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Founder", href: "#founder" },
];

const SERVICE_LINKS = [
  "Residential Interiors",
  "Commercial Spaces",
  "Design Consultation",
  "Turnkey Execution",
];

const CONNECT_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "WhatsApp", href: "https://wa.me/919830478820" },
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
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    console.log("Newsletter signup:", email);
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="mt-20 border-t border-line pt-14">
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 sm:gap-x-10">
        <FooterColumn heading="Studio">
          <ul className="space-y-3">
            {STUDIO_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn heading="Services">
          <ul className="space-y-3">
            {SERVICE_LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#services"
                  className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn heading="Connect">
          <ul className="space-y-3">
            {CONNECT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[0.86rem] text-ink-soft transition-colors hover:text-sage-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <div className="col-span-2 sm:col-span-1">
          <FooterColumn heading="Newsletter">
            <p className="text-[0.86rem] leading-[1.7] text-ink-soft">
              Design notes and finished spaces, a few times a year.
            </p>
            {subscribed ? (
              <p className="mt-5 text-[0.84rem] font-semibold text-sage-700">
                You&apos;re on the list.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-5">
                <div className="flex items-end gap-2 border-b border-line-strong pb-2.5 transition-colors focus-within:border-sage-500">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full min-w-0 bg-transparent text-[0.86rem] text-ink placeholder-ink-faint focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sage-800 text-white transition-colors hover:bg-sage-900"
                  >
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </form>
            )}
          </FooterColumn>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }) {
  return <p className="mt-1.5 pl-1 text-[0.72rem] font-medium text-red-600">{message}</p>;
}

function Field({ icon: Icon, error, className, name, ...props }) {
  return (
    <div>
      <div className="relative">
        <Icon className="field-icon" />
        <input
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
