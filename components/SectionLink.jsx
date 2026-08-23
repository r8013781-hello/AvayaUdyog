"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { rememberSection, scrollToSection } from "../lib/sectionScroll";

/**
 * A link to a section of a page — one that works from anywhere on the site,
 * and that behaves like moving around a single page rather than navigating.
 *
 * ── The original bug this exists to fix ────────────────────────────────────
 * The navbar and footer used to scroll to section ids with a plain <button>.
 * That works on the homepage, where those sections live, and does absolutely
 * nothing on the other sixteen routes — the control looked live, responded to
 * hover, and silently did nothing when clicked.
 *
 * So the rendered element is always a real <Link> with a real `/path#section`
 * href. That matters for more than tidiness:
 *   - crawlers follow it, so the section's page keeps its internal link,
 *   - right-click "copy link address" gives something that actually works,
 *   - middle-click and ⌘/Ctrl-click open a new tab that lands in the right
 *     place — those go through the browser, not through our click handler,
 *     and they NEED the hash to work, which is why it stays in the markup.
 *
 * ── What a plain left-click does instead ───────────────────────────────────
 * Two cases, and neither leaves a hash in the address bar:
 *
 *   Already on the page — cancel the navigation and glide to the section.
 *     Nothing re-renders and the URL is untouched.
 *
 *   On a different page — cancel it, hand the target to lib/sectionScroll,
 *     and push the CLEAN path. The destination page's SectionScrollHandler
 *     picks it up on arrival and scrolls. The visitor sees `/`, never
 *     `/#gallery`.
 *
 * The previous version smooth-scrolled but then called
 * `history.replaceState(null, "", href)` to "keep the URL honest". That was
 * the wrong trade for chrome navigation: it wrote `/#gallery` into the address
 * bar for what is, to the visitor, simply scrolling down the page they are
 * already on.
 */
export default function SectionLink({ href, className, onNavigate, children, ...rest }) {
  const router = useRouter();
  const pathname = usePathname();
  const [path, hash] = href.split("#");
  const targetPath = path || "/";

  const handleClick = (event) => {
    onNavigate?.();

    if (!hash) return;

    /**
     * Let the browser handle anything that is not a plain left-click:
     * new tab, new window, download, or a click the page has already
     * cancelled. Hijacking these is the classic way a custom link handler
     * breaks ⌘-click.
     */
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    if (pathname === targetPath) {
      // Already here — just move. If the section is somehow missing, fall
      // back to the ordinary navigation rather than swallowing the click.
      if (!scrollToSection(hash)) router.push(href);
      return;
    }

    rememberSection(hash);
    router.push(targetPath);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
