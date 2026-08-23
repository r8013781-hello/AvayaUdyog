import Link from "next/link";
import Analytics from "../components/Analytics";

/**
 * The 404.
 *
 * This lives at the app root, not inside the (marketing) route group, because
 * Next only ever renders the root layout for a not-found — so there is no
 * Navbar or Footer here and the page has to carry its own way back. That is
 * also why <Analytics /> is mounted explicitly: without it, broken inbound
 * links and mistyped URLs would be completely invisible in GA4, and knowing
 * which URLs people are landing on wrongly is the entire point of having a
 * 404 you control.
 *
 * Every destination below is a route that genuinely exists (see
 * app/sitemap.js). Nothing here is invented — it is a way out, not a pitch.
 */

export const metadata = {
  title: "Page not found | Avaya Udyog",
  // No `robots` here on purpose: Next already emits noindex for not-found,
  // and adding a second robots meta tag says nothing new.
};

const DESTINATIONS = [
  { href: "/", label: "Home", note: "Start from the beginning" },
  {
    href: "/#services",
    label: "Services",
    note: "Everything the studio does",
  },
  {
    href: "/services/residential-interior-design",
    label: "Homes",
    note: "Residential interiors",
  },
  {
    href: "/services/commercial-interior-design",
    label: "Offices & retail",
    note: "Commercial spaces",
  },
];

export default function NotFound() {
  return (
    <>
      <Analytics />

      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-2xl">
          <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">
            Error 404
          </p>

          <h1 className="display mt-5 text-[2.6rem] leading-[1.1] text-ink sm:text-5xl">
            This page isn&apos;t
            <br />
            <span className="accent text-sage-600">here anymore.</span>
          </h1>

          <p className="mt-6 max-w-md text-[1.02rem] leading-[1.85] text-ink-soft">
            The link may be out of date, or the address may have a typo in it.
            Everything else is exactly where it was.
          </p>

          <div className="hair-gold my-10" />

          <ul className="space-y-1">
            {DESTINATIONS.map(({ href, label, note }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-baseline justify-between gap-6 rounded-2xl px-4 py-4 transition-colors hover:bg-sage-50"
                >
                  <span className="font-display text-[1.15rem] font-semibold text-ink transition-colors group-hover:text-sage-700">
                    {label}
                  </span>
                  <span className="shrink-0 text-right text-[0.8rem] text-ink-muted">
                    {note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-line pt-8 text-[0.88rem]">
            <span className="text-ink-muted">Or reach us directly:</span>
            <a
              href="tel:+917980640714"
              className="font-semibold text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
            >
              +91 79806 40714
            </a>
            <a
              href="https://wa.me/917980640714"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
