import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

/**
 * Hash-free section navigation.
 *
 * Two properties are being protected, and they pull against each other:
 *
 *   1. The URL must stay clean. Clicking "Gallery" is, to the visitor,
 *      scrolling down the page they are already on — it should not write
 *      `/#gallery` into the address bar or the back/forward history.
 *
 *   2. The link must still be a real link. The previous incarnation of this
 *      component was a <button>, which worked on the homepage and silently did
 *      nothing on the other sixteen routes. Anything that makes the rendered
 *      href disappear, or that swallows ⌘-click, reintroduces a variant of
 *      that bug — so those are asserted explicitly rather than assumed.
 */

const push = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

// next/link renders a plain anchor under test; the real one does the same for
// an internal href, and this keeps the test about our click handling.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { default: SectionLink } = await import("../components/SectionLink");
const { hasPendingSection, claimSection } = await import("../lib/sectionScroll");

function addSection(id) {
  const el = document.createElement("section");
  el.id = id;
  el.scrollIntoView = vi.fn();
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  push.mockClear();
  pathname = "/";
  document.body.innerHTML = "";
  claimSection();
  window.history.replaceState(null, "", "/");
});

/**
 * jsdom cannot follow a link, and logs "Not implemented: navigation" whenever
 * an anchor click is left uncancelled. Blocking it at the window — the last
 * stop in the bubble phase — keeps the suite output clean while still letting
 * the assertions above observe defaultPrevented at the point that matters.
 */
const blockNavigation = (event) => event.preventDefault();
beforeEach(() => window.addEventListener("click", blockNavigation));
afterEach(() => window.removeEventListener("click", blockNavigation));

afterEach(cleanup);

describe("rendered markup", () => {
  it("renders a real anchor carrying the full path#hash", () => {
    // Crawlers follow this, and "copy link address" has to produce something
    // that works. The clean URL is a click-time behaviour, not a markup one.
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/#gallery");
  });
});

describe("clicking from the page that owns the section", () => {
  it("scrolls to the section and leaves the URL alone", async () => {
    const section = addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);

    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
    // The whole point: no hash, and no navigation.
    expect(window.location.hash).toBe("");
    expect(window.location.pathname).toBe("/");
    expect(push).not.toHaveBeenCalled();
  });

  it("scrolls smoothly, aligned to the top of the section", async () => {
    const section = addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("jumps instantly when the visitor prefers reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true });
    const section = addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    window.matchMedia.mockRestore();
  });

  it("moves focus to the section, not just the viewport", async () => {
    // Scrolling alone leaves a keyboard user's focus on the link, so their
    // next Tab goes back into the navbar and the jump achieved nothing.
    const section = addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(document.activeElement).toBe(section);
  });

  it("does not leave the section as a permanent tab stop", async () => {
    const section = addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(section.getAttribute("tabindex")).toBe("-1");
    section.dispatchEvent(new FocusEvent("blur"));
    expect(section.hasAttribute("tabindex")).toBe(false);
  });

  it("falls back to navigating if the section is somehow missing", async () => {
    // Better a working navigation than a click that does nothing — the exact
    // failure the old <button> implementation had.
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));
    expect(push).toHaveBeenCalledWith("/#gallery");
  });
});

describe("clicking from a different page", () => {
  beforeEach(() => {
    pathname = "/about";
  });

  it("navigates to the clean path, with no hash in the URL", async () => {
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(push).toHaveBeenCalledWith("/");
    expect(push).not.toHaveBeenCalledWith("/#gallery");
  });

  it("hands the section over for the destination page to pick up", async () => {
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));

    expect(hasPendingSection()).toBe(true);
    expect(claimSection()).toBe("gallery");
    // Claiming consumes it, so a stale target cannot fire on a later page.
    expect(hasPendingSection()).toBe(false);
  });

  it("works for a section on a page other than the homepage", async () => {
    render(<SectionLink href="/services#turnkey-execution">Turnkey</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "Turnkey" }));

    expect(push).toHaveBeenCalledWith("/services");
    expect(claimSection()).toBe("turnkey-execution");
  });
});

describe("links the browser should handle itself", () => {
  it("leaves a plain page link completely alone", async () => {
    render(<SectionLink href="/about">About</SectionLink>);
    fireEvent.click(screen.getByRole("link", { name: "About" }));
    // No hash means nothing for this component to do.
    expect(push).not.toHaveBeenCalled();
    expect(hasPendingSection()).toBe(false);
  });

  it("does not hijack ⌘-click / ctrl-click into a new tab", async () => {
    // These need the hash and go through the browser. Cancelling them is the
    // classic way a custom link handler breaks open-in-new-tab.
    addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);

    const link = screen.getByRole("link", { name: "Gallery" });
    for (const modifier of ["metaKey", "ctrlKey", "shiftKey", "altKey"]) {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
      Object.defineProperty(event, modifier, { value: true });

      // Read the flag in a bubble-phase listener on document, then cancel the
      // event ourselves — otherwise jsdom tries to follow the href and logs a
      // "Not implemented: navigation" error into the suite output. Reading it
      // here rather than after dispatch is also more honest: it is the value
      // at the moment the browser would decide what to do.
      let hijacked = null;
      document.addEventListener(
        "click",
        (e) => {
          hijacked = e.defaultPrevented;
          e.preventDefault();
        },
        { once: true },
      );

      link.dispatchEvent(event);
      expect(hijacked, `${modifier} click was hijacked`).toBe(false);
    }
    expect(push).not.toHaveBeenCalled();
  });

  it("ignores a non-left button", async () => {
    addSection("gallery");
    render(<SectionLink href="/#gallery">Gallery</SectionLink>);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 1 });
    let hijacked = null;
    document.addEventListener(
      "click",
      (e) => {
        hijacked = e.defaultPrevented;
        e.preventDefault();
      },
      { once: true },
    );
    screen.getByRole("link", { name: "Gallery" }).dispatchEvent(event);
    expect(hijacked).toBe(false);
  });
});

describe("onNavigate", () => {
  it("fires so the mobile sheet can close, in both cases", async () => {
    const onNavigate = vi.fn();
    addSection("gallery");
    render(
      <SectionLink href="/#gallery" onNavigate={onNavigate}>
        Gallery
      </SectionLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);

    pathname = "/about";
    cleanup();
    render(
      <SectionLink href="/#gallery" onNavigate={onNavigate}>
        Gallery
      </SectionLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });
});
