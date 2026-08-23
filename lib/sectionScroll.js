/**
 * Same-page section navigation, without putting a hash in the address bar.
 *
 * ── What this is for ───────────────────────────────────────────────────────
 * Clicking "Gallery" in the header should feel like moving around one page:
 * the view glides to the section and the URL stays `/`. It should not read as
 * a navigation, and it should not leave `/#gallery` behind in the address bar
 * or in the back/forward history.
 *
 * ── The awkward case, and how it is handled ────────────────────────────────
 * From the homepage that is easy: cancel the click and scroll. From /about it
 * is not, because the section does not exist in the current document — the
 * browser has to load the homepage first, and the ordinary way to say "scroll
 * to this once you arrive" is exactly the hash we are trying to avoid.
 *
 * So the target is handed over in memory instead. `rememberSection` records it
 * in a module variable, the router navigates to the clean path, and
 * SectionScrollHandler on the destination page claims it and scrolls. A module
 * variable is the right store here precisely because it does NOT survive a
 * full page load: a client-side click sets it and the very next render
 * consumes it, while a hard reload or an externally-pasted URL starts with
 * nothing pending, which is the correct behaviour — that visitor's URL is
 * whatever they actually asked for and we should not second-guess it.
 *
 * Note this deliberately does not replace hash links generally. A shared or
 * bookmarked /services#turnkey-execution still works exactly as before, and
 * the long-form articles' "On this page" contents lists still set a hash so a
 * reader can copy a link to a section. Only chrome navigation — the header and
 * footer links a visitor uses to move around — is hash-free.
 */

/**
 * The section a click asked for, waiting to be consumed by the page it lives
 * on. Deliberately module scope, not sessionStorage: see above.
 */
let pendingSection = null;

export function rememberSection(id) {
  pendingSection = id;
}

/** Read and clear in one step, so a stale target cannot fire twice. */
export function claimSection() {
  const id = pendingSection;
  pendingSection = null;
  return id;
}

export function hasPendingSection() {
  return pendingSection !== null;
}

/**
 * Scroll an element into view, honouring the visitor's motion preference.
 *
 * `scroll-margin-top` on the target sections (see app/globals.css) is what
 * keeps the heading clear of the fixed navbar — without it the browser aligns
 * the section's top edge with the viewport's, which parks the heading behind
 * the header and lands the reader a paragraph in.
 */
export function scrollToSection(id) {
  const el = typeof document !== "undefined" && document.getElementById(id);
  if (!el) return false;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  /**
   * Move focus as well as the viewport. Scrolling alone leaves a keyboard or
   * screen-reader user's focus back on the link they clicked, so their next
   * Tab returns to the navbar and the jump did nothing for them — the same
   * failure the skip link is built to avoid. preventScroll stops the focus
   * call from fighting the smooth scroll we just started.
   */
  const hadTabIndex = el.hasAttribute("tabindex");
  if (!hadTabIndex) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  if (!hadTabIndex) {
    // Leave the DOM as we found it, so the section never becomes a tab stop.
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }

  return true;
}
