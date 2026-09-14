"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SectionLink from "./SectionLink";
import { Menu, X, Phone, ArrowUpRight } from "lucide-react";
import { useContactModal } from "./ContactModalProvider";
import { useLoginModal } from "./LoginModalProvider";
import { trackPhoneClick } from "../lib/tracking";

// Every entry is a real href. Section entries point at /#id so they work from
// any route — previously they were scroll-only, which meant Home, Gallery,
// Founder and FAQ did nothing at all on the sixteen non-homepage routes.
//
// ── Deliberately four ──────────────────────────────────────────────────────
// This list was eight (Home, About, Services, Process, Gallery, Founder,
// Insights, FAQ). Eight small-caps items plus a phone number plus a Login
// button is more than a header can carry legibly: at that density nothing is
// emphasised, so the two things a visitor actually came to do — see the work,
// and make contact — compete with six links of equal weight.
//
// What stays is the shortest set that still answers "who are you, what do you
// do, show me, how do I reach you":
//
//   Home · About · Services · Gallery   + the phone number + Login
//
// Process, Founder, Insights and FAQ were removed from the HEADER, not from
// the site. Every one of them keeps a link on every single page via
// STUDIO_LINKS in components/Footer.jsx, so they lose no internal link equity
// and stay one click from anywhere — checked by the "stays reachable" test in
// __tests__/navigation.test.js, which is what stops this trim from quietly
// orphaning a page later.
//
// They are also reachable from where they are actually relevant, which is
// better placement than a permanent header slot: /process is linked from the
// services hub and both service pages, /insights from the services hub and
// every article, and #faq sits directly above the footer's enquiry form on
// the homepage.
//
// Before adding an entry here, ask whether it belongs in the footer instead.
// The header is the one place on the site where restraint is worth more than
// completeness.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#gallery", label: "Gallery" },
];

// A hairline outline traced around the logo's own shapes, built from four
// zero-blur drop-shadows fired N/S/E/W of it — not a blurred glow. Progressively
// thinned from a full pixel down to this: any smaller and sub-pixel rounding
// in the browser's filter rasterizer starts dropping the stroke entirely
// rather than thinning it further.
const OUTLINE_FILTER = [
  [0.15, 0],
  [-0.15, 0],
  [0, 0.15],
  [0, -0.15],
]
  .map(([x, y]) => `drop-shadow(${x}px ${y}px 0 rgba(255,255,255,0.85))`)
  .join(" ");

/**
 * The full Avaya Udyog logo — roundel + wordmark in one image, not a
 * separately-typed name next to an icon. There is only one legible render of
 * it (dark ink on transparent), outlined in white over the hero photo and
 * plain once the header goes solid on scroll.
 */
function Logo({ scrolled }) {
  return (
    <Image
      src="/logo-lockup-dark-text.png"
      alt="Avaya Udyog — Furniture & Interior Design & Decoration"
      height={80}
      width={364}
      priority
      className="h-9 w-auto object-contain transition-[filter] duration-500 ease-smooth md:h-10"
      style={{ filter: scrolled ? "none" : OUTLINE_FILTER }}
    />
  );
}

export default function Navbar() {
  const openContactModal = useContactModal();
  const openLoginModal = useLoginModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("hero");
  const pathname = usePathname();

  /** A nav entry is current if its route matches, or its section is in view. */
  const isCurrent = (href) => {
    const [path, hash] = href.split("#");
    const target = path || "/";
    if (hash) return pathname === target && activeId === hash;
    return pathname === target;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Highlight the link for whichever section owns the upper third of the viewport. */
  useEffect(() => {
    // Only the /#section entries have an element to observe, and only on the
    // page that owns them. Everywhere else this finds nothing and the observer
    // simply never runs, which is correct.
    const sections = NAV_LINKS.map((link) => link.href.split("#")[1])
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
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
            <Link
              href="/"
              className="group flex items-center"
              aria-label="Avaya Udyog — home"
            >
              <Logo scrolled={scrolled} />
            </Link>

            {/* Desktop links — small caps, thin underline. */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = isCurrent(link.href);
                const className = `group relative px-3.5 py-2 text-[0.78rem] font-bold uppercase tracking-label transition-colors duration-300 ${
                  scrolled
                    ? isActive
                      ? "text-sage-700"
                      : "text-ink-muted hover:text-sage-700"
                    : isActive
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                }`;
                const underline = (
                  <span
                    className={`absolute inset-x-3.5 bottom-0.5 h-px origin-left bg-gold-hair transition-transform duration-500 ease-smooth ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                );

                return (
                  <SectionLink
                    key={link.href}
                    href={link.href}
                    className={className}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    {underline}
                  </SectionLink>
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
                <span className="text-[0.9rem] font-semibold tracking-tight">
                  +91 79806 40714
                </span>
              </a>

              <button
                type="button"
                onClick={() => openLoginModal()}
                className="btn-primary group !px-6 !py-3"
              >
                Login
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
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
          <Image
            src="/logo-lockup-dark-text.png"
            alt="Avaya Udyog"
            height={80}
            width={364}
            className="h-8 w-auto object-contain"
          />
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
          {NAV_LINKS.map((link) => {
            const className =
              "flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-lg font-medium text-ink transition-colors hover:bg-sage-50 hover:text-sage-700";
            return (
              <SectionLink
                key={link.href}
                href={link.href}
                onNavigate={() => setMobileMenuOpen(false)}
                className={className}
              >
                {link.label}
                <ArrowUpRight size={16} className="text-sage-300" />
              </SectionLink>
            );
          })}
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

        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            openLoginModal();
          }}
          className="mt-5 flex w-full items-center justify-center rounded-full border border-line-strong bg-sage-50 px-4 py-3 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-sage-800 transition-colors hover:border-sage-400 hover:bg-sage-100"
        >
          Login
        </button>

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
