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

  it("points page-less services at a section of the services hub", () => {
    // Design Consultation and Turnkey Execution have no page of their own and
    // should not get a thin one — they anchor into /services instead.
    const src = source("components/Footer.jsx");
    expect(src).toMatch(/\/services#design-consultation/);
    expect(src).toMatch(/\/services#turnkey-execution/);
  });

  it("keeps an id for every service the hub is linked to by anchor", () => {
    const hub = source("app/(marketing)/services/page.jsx");
    ["design-consultation", "turnkey-execution"].forEach((id) => {
      expect(hub, `services hub is missing id "${id}"`).toMatch(new RegExp(`id: "${id}"`));
    });
  });
});
