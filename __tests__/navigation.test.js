import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards against dead navigation controls.
 *
 * The bug this exists to prevent: the navbar and footer used to scroll to a
 * homepage section id with a plain <button>. That works on the homepage and
 * does nothing at all on every other route — the control looked live, hovered,
 * and silently failed. It shipped across sixteen pages because the link audit
 * only checked hrefs, and a button has no href to check.
 *
 * The invariant is simple: every entry in a navigation list must carry an
 * `href`. A link to a section is written `/#id` (or `/page#id`) so it resolves
 * from anywhere, never as a bare id.
 */

function source(file) {
  return readFileSync(join(process.cwd(), file), "utf8");
}

function linkList(src, name) {
  const start = src.indexOf(`const ${name} = [`);
  if (start === -1) throw new Error(`${name} not found`);
  const end = src.indexOf("];", start);
  return src.slice(start, end + 2);
}

const NAV_LISTS = [
  ["components/Navbar.jsx", "NAV_LINKS"],
  ["components/Footer.jsx", "STUDIO_LINKS"],
  ["components/Footer.jsx", "SERVICE_LINKS"],
  ["components/Footer.jsx", "CONNECT_LINKS"],
];

describe("navigation lists", () => {
  it.each(NAV_LISTS)("%s :: %s — every entry has an href", (file, name) => {
    const block = linkList(source(file), name);
    const entries = block.match(/\{[^}]*\}/g) || [];
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry, `${name} entry without href: ${entry.trim()}`).toMatch(/href:/);
    });
  });

  it.each(NAV_LISTS)("%s :: %s — no bare section ids", (file, name) => {
    const block = linkList(source(file), name);
    // `id: "gallery"` is the shape that produced the dead buttons.
    expect(block, `${name} still uses a bare id`).not.toMatch(/\bid:\s*"/);
  });

  it("has no duplicated label in a single footer list", () => {
    const src = source("components/Footer.jsx");
    ["STUDIO_LINKS", "SERVICE_LINKS", "CONNECT_LINKS"].forEach((name) => {
      const labels = [...linkList(src, name).matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(labels).size, `${name} has a duplicate label`).toBe(labels.length);
    });
  });

  it("routes section links through SectionLink, not a scroll handler", () => {
    // SectionLink renders a real <Link> and only intercepts the click when the
    // visitor is already on the page that owns the section.
    ["components/Navbar.jsx", "components/Footer.jsx"].forEach((file) => {
      const src = source(file);
      expect(src, `${file} should import SectionLink`).toMatch(/import SectionLink/);
      expect(src, `${file} still defines a scroll handler`).not.toMatch(/scrollToSection|scrollTo\(link/);
    });
  });

  it("points page-less services at their homepage section", () => {
    // Design Consultation and Turnkey Execution have no page of their own and
    // should not get a thin one. They used to anchor into the /services hub;
    // that hub is now merged into the homepage, so they anchor at their own
    // block in components/Services.jsx.
    const src = source("components/Footer.jsx");
    expect(src).toMatch(/\/#design-consultation/);
    expect(src).toMatch(/\/#turnkey-execution/);
    // The hub is gone — nothing may point at it.
    expect(src).not.toMatch(/"\/services"/);
  });

  /**
   * The header is deliberately four items (see the comment on NAV_LINKS).
   *
   * Two failure modes worth catching, and they pull in opposite directions:
   *
   *   1. Creep. Eight items is what it grew to last time, one reasonable-
   *      sounding addition at a time, until nothing in the header was
   *      emphasised. A cap makes the next addition a decision rather than a
   *      reflex.
   *
   *   2. Orphaning. Trimming the header is only safe because the footer
   *      carries the removed destinations on every page. If someone later
   *      tidies the footer, Process / Founder / Insights / FAQ would lose
   *      their sitewide internal link and quietly drop out of the crawlable
   *      structure — with nothing visibly broken to notice.
   */
  it("keeps the header to a minimal set", () => {
    const entries = linkList(source("components/Navbar.jsx"), "NAV_LINKS").match(/\{[^}]*\}/g) || [];
    expect(entries.length).toBeLessThanOrEqual(5);
  });

  it("still reaches every destination the header dropped", () => {
    // Removed from the navbar, and each must keep a link somewhere sitewide.
    const DROPPED = ["/#how-we-work", "/#founder", "/insights", "/#faq"];
    const footer = source("components/Footer.jsx");
    const navbar = source("components/Navbar.jsx");

    DROPPED.forEach((href) => {
      expect(navbar, `${href} is back in the navbar`).not.toMatch(
        new RegExp(`href: "${href.replace(/[/#]/g, "\\$&")}"`),
      );
      expect(footer, `${href} is no longer reachable from the footer`).toMatch(
        `href: "${href}"`,
      );
    });
  });

  it("keeps the phone number and the portal login in the header", () => {
    // Neither is in NAV_LINKS — they are rendered separately, so a change to
    // the link list can silently take them with it.
    const navbar = source("components/Navbar.jsx");
    expect(navbar).toMatch(/href="tel:\+917980640714"/);
    expect(navbar).toMatch(/const PORTAL_URL = "\/portal"/);
    // Present in both the desktop bar and the mobile sheet.
    expect(navbar.match(/href=\{PORTAL_URL\}/g) || []).toHaveLength(2);
    expect(navbar.match(/href="tel:\+917980640714"/g) || []).toHaveLength(2);
  });

  it("keeps an id for every section the chrome links to by anchor", () => {
    // The homepage now owns every anchor the navbar and footer point at. A
    // missing id here is a link that silently scrolls nowhere — the exact
    // failure this file was created for, in a new place.
    const services = source("components/Services.jsx");
    ["design-consultation", "turnkey-execution"].forEach((id) => {
      expect(services, `Services.jsx is missing id "${id}"`).toMatch(
        new RegExp(`id: "${id}"`),
      );
    });

    const OWNERS = {
      about: "components/About.jsx",
      services: "components/Services.jsx",
      "how-we-work": "components/HowWeWork.jsx",
      gallery: "components/Gallery.jsx",
      founder: "components/AboutCompany.jsx",
      faq: "components/FAQ.jsx",
      "which-service": "components/ServicesMore.jsx",
      "your-part": "components/YourPart.jsx",
      principles: "components/Principles.jsx",
    };
    Object.entries(OWNERS).forEach(([id, file]) => {
      expect(source(file), `${file} should render id="${id}"`).toMatch(`id="${id}"`);
    });
  });

  it("has no link left pointing at a merged-away route", () => {
    // /about, /process and the /services hub were merged into the homepage
    // and their routes deleted. A stale link to one is a 404 for a visitor
    // and a dead internal link for a crawler.
    const GONE = ['"/about"', '"/process"', '"/services"'];
    ["components/Navbar.jsx", "components/Footer.jsx"].forEach((file) => {
      const src = source(file);
      GONE.forEach((href) =>
        expect(src, `${file} still links to ${href}`).not.toContain(`href: ${href}`),
      );
    });
  });

  it("keeps the retired routes out of the sitemap", () => {
    // Listing a URL the build no longer produces is a self-inflicted 404
    // report in Search Console.
    const sitemap = source("app/sitemap.js");
    ["${SITE_URL}/about", "${SITE_URL}/process", "${SITE_URL}/services`"].forEach((url) => {
      expect(sitemap, `sitemap still lists ${url}`).not.toContain(url);
    });
  });
});
