"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A link to a section of a page — one that works from anywhere on the site.
 *
 * The bug this exists to fix: the navbar and footer used to scroll to section
 * ids with a plain button. That works on the homepage, where those sections
 * live, and does absolutely nothing on the other sixteen routes — the control
 * looked live, responded to hover, and silently did nothing when clicked.
 *
 * This renders a real <Link> in every case, so:
 *   - it works from any page,
 *   - it is right-clickable, middle-clickable and shareable,
 *   - crawlers can follow it.
 *
 * When the visitor is ALREADY on the page that owns the section, we cancel the
 * navigation and smooth-scroll instead — so nothing re-renders and the motion
 * matches what it always did on the homepage.
 */
export default function SectionLink({ href, className, onNavigate, children, ...rest }) {
  const pathname = usePathname();
  const [path, hash] = href.split("#");
  const targetPath = path || "/";

  const handleClick = (event) => {
    onNavigate?.();

    if (!hash || pathname !== targetPath) return;

    const el = document.getElementById(hash);
    if (!el) return;

    event.preventDefault();
    el.scrollIntoView({ behavior: "smooth" });
    // Keep the URL honest so the section is linkable and the back button works.
    window.history.replaceState(null, "", href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
