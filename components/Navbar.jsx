"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, Phone, ArrowUpRight } from "lucide-react";
import { useContactModal } from "./ContactModalProvider";
import { trackPhoneClick } from "../lib/tracking";

const NAV_LINKS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "how-we-work", label: "Process" },
  { id: "gallery", label: "Gallery" },
  { id: "founder", label: "Founder" },
  { id: "faq", label: "FAQ" },
];

// The CRM lives inside this same app at /portal (see app/portal/page.jsx) —
// one domain, one deployment, a relative link.
const PORTAL_URL = "/portal";

/** The diamond monogram — a sage tile with a gold hairline inlay. */
function Monogram({ className = "h-11 w-11" }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <span className="absolute inset-0 rotate-45 rounded-[30%] bg-sage-800 shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-transform duration-700 ease-smooth group-hover:rotate-[135deg]" />
      <span className="absolute inset-[3px] rotate-45 rounded-[28%] border border-gold/50" />
      <span className="relative font-display text-lg font-semibold text-white">
        A
      </span>
    </span>
  );
}

export default function Navbar() {
  const openContactModal = useContactModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("hero");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Highlight the link for whichever section owns the upper third of the viewport. */
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window))
      return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const closeAndContact = () => {
    setMobileMenuOpen(false);
    openContactModal("mobile_menu");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled
            ? "border-b border-line bg-white/85 shadow-hair backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="shell">
          <div
            className={`flex items-center justify-between transition-all duration-500 ease-smooth ${
              scrolled ? "h-16" : "h-[4.75rem] md:h-[5.25rem]"
            }`}
          >
            <button
              onClick={() => scrollTo("hero")}
              className="group flex items-center gap-3"
              aria-label="Avaya Udyog — back to top"
            >
              <Monogram className="h-10 w-10 md:h-11 md:w-11" />
              <span className="text-left">
                <span
                  className={`block font-display text-[1.05rem] font-semibold leading-none tracking-[0.01em] transition-colors duration-500 md:text-lg ${
                    scrolled ? "text-ink" : "text-white"
                  }`}
                >
                  Avaya{" "}
                  <span
                    className={scrolled ? "text-sage-600" : "text-gold-light"}
                  >
                    Udyog
                  </span>
                </span>
                <span
                  className={`mt-1.5 block text-[0.54rem] font-semibold uppercase tracking-wider2 transition-colors duration-500 ${
                    scrolled ? "text-ink-muted" : "text-white/70"
                  }`}
                >
                  Interior Design
                </span>
              </span>
            </button>

            {/* Desktop links — small caps, thin underline. */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative px-3.5 py-2 text-[0.66rem] font-bold uppercase tracking-label transition-colors duration-300 ${
                      scrolled
                        ? isActive
                          ? "text-sage-700"
                          : "text-ink-muted hover:text-sage-700"
                        : isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-3.5 bottom-0.5 h-px origin-left bg-gold-hair transition-transform duration-500 ease-smooth ${
                        isActive
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <a
                href="tel:+917980640714"
                onClick={() => trackPhoneClick("navbar")}
                className={`group flex items-center gap-2.5 transition-colors ${
                  scrolled
                    ? "text-ink-soft hover:text-sage-700"
                    : "text-white/85 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                    scrolled
                      ? "border-line-strong text-sage-600 group-hover:border-sage-500 group-hover:bg-sage-50"
                      : "border-white/30 text-white group-hover:border-white/60 group-hover:bg-white/10"
                  }`}
                >
                  <Phone size={13} />
                </span>
                <span className="text-[0.78rem] font-semibold tracking-tight">
                  +91 79806 40714
                </span>
              </a>

              <a href={PORTAL_URL} className="btn-primary group !px-6 !py-3">
                Login
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden ${
                scrolled
                  ? "border-line-strong bg-white/70 text-sage-800 hover:border-sage-400"
                  : "border-white/30 bg-white/10 text-white hover:border-white/60"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-x-3 top-3 z-[60] origin-top rounded-3xl2 border border-line bg-white p-6 shadow-float transition-all duration-500 ease-smooth lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-ink">
            Avaya <span className="text-sage-600">Udyog</span>
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-sage-800"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>

        <div className="hair-gold my-5" />

        <nav className="space-y-0.5">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-lg font-medium text-ink transition-colors hover:bg-sage-50 hover:text-sage-700"
            >
              {link.label}
              <ArrowUpRight size={16} className="text-sage-300" />
            </button>
          ))}
        </nav>

        <div className="mt-5 border-t border-line pt-5">
          <a
            href="tel:+917980640714"
            onClick={() => trackPhoneClick("navbar_mobile")}
            className="flex items-center gap-3 text-ink-soft transition-colors hover:text-sage-700"
          >
            <Phone size={15} className="text-sage-500" />
            <span className="text-sm font-semibold">+91 79806 40714</span>
          </a>
        </div>

        <a
          href={PORTAL_URL}
          className="mt-5 flex w-full items-center justify-center rounded-full border border-line-strong bg-sage-50 px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-sage-800 transition-colors hover:border-sage-400 hover:bg-sage-100"
        >
          Login
        </a>

        <button onClick={closeAndContact} className="btn-primary mt-5 w-full">
          Book a Consultation
        </button>
      </div>

      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-[55] cursor-default bg-sage-950/25 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
          tabIndex={-1}
        />
      )}
    </>
  );
}
