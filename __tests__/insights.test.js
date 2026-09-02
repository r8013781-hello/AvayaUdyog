import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { INSIGHTS, getInsight, listInsights } from "../lib/insights";

/**
 * Registry integrity for the Insights section, plus the three articles added
 * in Phase 4B (modular-vs-carpenter-kitchen-kolkata,
 * how-to-read-an-interior-design-quotation, old-vs-new-build-kolkata-flats).
 *
 * The hub, the sitemap and every article page all derive from this one
 * registry — see lib/insights.js's own docs — so most of what matters is
 * enforceable here without rendering anything.
 */

const APP_DIR = join(process.cwd(), "app", "(marketing)", "insights");

describe("insights registry", () => {
  it("has no duplicate slugs", () => {
    const slugs = INSIGHTS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every insight a real published date and a real page.jsx", () => {
    INSIGHTS.forEach((insight) => {
      expect(insight.published, `${insight.slug} has no published date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const pagePath = join(APP_DIR, insight.slug, "page.jsx");
      expect(existsSync(pagePath), `${insight.slug} has no page.jsx at ${pagePath}`).toBe(true);
    });
  });

  it("points every owningService at a route this build actually produces", () => {
    // Either a real service page, or a homepage anchor (both are legitimate
    // per the existing "what-happens-in-a-design-consultation" entry).
    const REAL_SERVICE_HREFS = new Set([
      "/services/residential-interior-design",
      "/services/commercial-interior-design",
      "/services/home-renovation",
      "/services/modular-kitchen",
    ]);
    INSIGHTS.forEach((insight) => {
      const href = insight.owningService.href;
      const valid = REAL_SERVICE_HREFS.has(href) || href.startsWith("/#");
      expect(valid, `${insight.slug} owningService points at ${href}, which is neither a real service page nor a homepage anchor`).toBe(true);
    });
  });

  it("includes the three Phase 4B articles with the intended parent service", () => {
    expect(getInsight("modular-vs-carpenter-kitchen-kolkata")?.owningService.href).toBe("/services/modular-kitchen");
    expect(getInsight("how-to-read-an-interior-design-quotation")?.owningService.href).toBe("/services/residential-interior-design");
    expect(getInsight("old-vs-new-build-kolkata-flats")?.owningService.href).toBe("/services/home-renovation");
  });

  it("lists newest first", () => {
    const dates = listInsights().map((i) => i.published);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});

describe("Phase 4B article pages", () => {
  const NEW_SLUGS = [
    "modular-vs-carpenter-kitchen-kolkata",
    "how-to-read-an-interior-design-quotation",
    "old-vs-new-build-kolkata-flats",
  ];

  NEW_SLUGS.forEach((slug) => {
    const source = readFileSync(join(APP_DIR, slug, "page.jsx"), "utf8");

    it(`${slug} wires Article schema, not just WebPage`, () => {
      expect(source).toMatch(/articleSchema\(/);
      expect(source).toMatch(/webPageSchema\(/);
    });

    it(`${slug} sets a canonical alternate`, () => {
      expect(source).toMatch(/alternates:\s*{\s*canonical:/);
    });

    it(`${slug} links back to at least one real service page`, () => {
      expect(source).toMatch(/href="\/services\//);
    });

    it(`${slug} never mentions a specific Kolkata locality by name`, () => {
      // old-vs-new-build-kolkata-flats in particular must stay a general
      // condition-type article, not a disguised locality page.
      const LOCALITY_WORDS = /\bnew town\b|\bsalt lake\b|\bsector v\b|\bballygunge\b|\balipore\b|\bbehala\b|\bmukundapur\b|\bhowrah\b/i;
      expect(source).not.toMatch(LOCALITY_WORDS);
    });
  });
});
