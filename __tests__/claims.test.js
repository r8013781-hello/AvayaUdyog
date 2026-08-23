import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A guard on the claims the site makes about itself.
 *
 * Everything asserted publicly has to be something the business has actually
 * established. The failure mode this catches is not malice — it is the very
 * ordinary drift where a phrase from a meta description gets promoted into a
 * button, and a page ends up promising something nobody agreed to.
 *
 * If the business confirms a claim, add it to the allowances here with a note
 * saying who confirmed it. Do not delete the test.
 */

const MARKETING = join(process.cwd(), "app", "(marketing)");

/**
 * Comments are not claims. A note explaining why a price is absent should not
 * itself trip the price check, so only the code that ships is scanned.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function pageFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return pageFiles(full);
    return entry.name === "page.jsx" ? [full] : [];
  });
}

const PAGES = pageFiles(MARKETING).map((file) => ({
  file: file.replace(process.cwd() + "/", ""),
  source: stripComments(readFileSync(file, "utf8")),
}));

/**
 * Claims the business has explicitly confirmed as accurate.
 *
 * Confirmed by the site owner on 2026-08-23, in response to a direct question
 * about whether these were real: "those are correct".
 *
 * These are pinned rather than merely allowed. A confirmed figure is only
 * worth anything while it stays the figure that was confirmed — the failure
 * mode worth catching is not someone removing "700+", it is someone quietly
 * rounding it up to "1000+" a year from now. Changing a value here should
 * take a fresh confirmation, not a find-and-replace.
 */
const CONFIRMED_CLAIMS = [
  { value: "35+", meaning: "years of experience" },
  { value: "700+", meaning: "spaces designed and delivered" },
  { value: "100%", meaning: "client satisfaction" },
];

describe("confirmed figures", () => {
  const STAT_FILES = [
    "components/Hero.jsx",
    "components/AboutCompany.jsx",
    "components/StatStrip.jsx",
  ];

  it.each(STAT_FILES)("%s publishes only confirmed figures", (file) => {
    const source = stripComments(readFileSync(join(process.cwd(), file), "utf8"));
    const confirmed = CONFIRMED_CLAIMS.map((c) => c.value);

    // Every "N+" or "N%" headline figure in a stats block must be one of the
    // confirmed ones.
    const figures = source.match(/value: "([^"]+)"/g) || [];
    expect(figures.length).toBeGreaterThan(0);

    figures.forEach((figure) => {
      const value = figure.slice(8, -1);
      expect(confirmed, `${file} publishes unconfirmed figure ${value}`).toContain(
        value,
      );
    });
  });
});

describe("structured data", () => {
  const schema = stripComments(
    readFileSync(join(process.cwd(), "lib", "schema.js"), "utf8"),
  );

  it("declares no hand-written aggregateRating", () => {
    // "100% client satisfaction" is a confirmed marketing claim, and it is
    // still not a rating. schema.org aggregateRating must be backed by real,
    // countable reviews; writing ratingValue: 5 / reviewCount: 700 because the
    // site says 100% and 700+ is exactly the fabrication Google issues manual
    // actions for, and it would put the whole property at risk to win one
    // star graphic.
    //
    // There is a legitimate route to this field and it is already half built:
    // once real Google reviews flow through the moderation pipeline
    // (backend/routes/reviews.js), an aggregateRating can be COMPUTED from the
    // approved rows — a true average over a true count. Derive it there, from
    // data. Never type it here.
    expect(schema).not.toMatch(/aggregateRating|ratingValue|reviewCount/);
  });
});

describe("public claims", () => {
  it("finds the marketing pages to check", () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(6);
  });

  it("does not promise a free consultation", () => {
    // The business's own visible CTAs have always read "Book a Consultation".
    // The word "free" appears only in the sitewide meta description, which
    // predates this test and is the owner's to confirm or remove. No page may
    // turn it into a visible promise until then.
    PAGES.forEach(({ file, source }) => {
      expect(source, `${file} promises a free consultation`).not.toMatch(
        /free\s+consultation/i,
      );
    });
  });

  it("quotes no price or rate", () => {
    PAGES.forEach(({ file, source }) => {
      expect(source, `${file} quotes a price`).not.toMatch(
        /₹|\bRs\.?\s*\d|\bper\s+sq\.?\s?ft\b|\blakhs?\b|\bcrores?\b/i,
      );
    });
  });

  it("claims no completed projects in a named locality", () => {
    // Every photograph in this repository is stock (commit 054f46d), so the
    // site cannot evidence work in any specific neighbourhood.
    PAGES.forEach(({ file, source }) => {
      expect(source, `${file} claims projects in a locality`).not.toMatch(
        /\b\d+\+?\s*(?:projects|homes|flats|spaces|apartments)\s+(?:in|across|around)\s+[A-Z]/,
      );
    });
  });

  it("claims no awards or certifications", () => {
    PAGES.forEach(({ file, source }) => {
      expect(source, `${file} claims an award`).not.toMatch(
        /\baward[- ]winning\b|\bcertified\b|\bISO\s*\d|\baccredited\b/i,
      );
    });
  });

  it("leaves no dead links behind", () => {
    // href="#" reads as a real destination and delivers nothing.
    PAGES.forEach(({ file, source }) => {
      expect(source, `${file} has a dead href="#"`).not.toMatch(/href="#"/);
    });
  });
});

describe("components", () => {
  const COMPONENTS = readdirSync(join(process.cwd(), "components"))
    .filter((name) => name.endsWith(".jsx"))
    .map((name) => ({
      file: `components/${name}`,
      source: stripComments(
        readFileSync(join(process.cwd(), "components", name), "utf8"),
      ),
    }));

  it("has no dead links in the shared chrome", () => {
    COMPONENTS.forEach(({ file, source }) => {
      expect(source, `${file} has a dead href="#"`).not.toMatch(/href[=:]\s*"#"/);
    });
  });
});
