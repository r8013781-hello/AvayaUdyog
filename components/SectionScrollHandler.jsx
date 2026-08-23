"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { claimSection, scrollToSection } from "../lib/sectionScroll";

/**
 * The receiving half of hash-free section navigation.
 *
 * SectionLink hands over a target section in memory and pushes the clean path;
 * this claims it once the destination page has rendered and scrolls there. It
 * renders nothing and lives in the marketing layout, so every route can be a
 * destination without each page having to opt in.
 *
 * ── Why the rAF, and why two of them ───────────────────────────────────────
 * The effect fires as soon as the new route commits, which is generally before
 * the browser has laid the page out — at that moment the section either does
 * not exist yet or is at the wrong offset, so scrolling immediately lands in
 * the wrong place or silently does nothing. Two nested animation frames put us
 * after layout and after paint, which is the earliest point the target's real
 * position is known. A fixed setTimeout would be a guess; this is not.
 *
 * ── Why it retries ─────────────────────────────────────────────────────────
 * Some destination sections are inside client components that mount a tick
 * later. Rather than assume, it re-checks for a short window and stops the
 * moment it succeeds — or gives up quietly, which leaves the visitor at the
 * top of the correct page. That is a mild disappointment, not a broken link,
 * and it is the right failure for something purely cosmetic.
 */
export default function SectionScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const id = claimSection();
    if (!id) return undefined;

    let cancelled = false;
    let attempts = 0;
    /* ~1s at 60fps — long enough for a late-mounting section, short enough
       that a genuinely missing one does not yank the page later. */
    const MAX_ATTEMPTS = 60;

    const attempt = () => {
      if (cancelled) return;
      if (scrollToSection(id)) return;
      if (++attempts >= MAX_ATTEMPTS) return;
      requestAnimationFrame(attempt);
    };

    const frame = requestAnimationFrame(() => requestAnimationFrame(attempt));

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
