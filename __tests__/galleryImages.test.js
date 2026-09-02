import { describe, it, expect } from "vitest";
import { IMAGES } from "../lib/galleryImages";

/**
 * Guards the actual failure mode this data set has already had once: a stock
 * image captioned to imply a service Avaya has never done ("Retail Showroom
 * Experience", "bespoke hospitality interior" — removed, see
 * lib/galleryImages.js), and a duplicated real photo carrying dead props.
 *
 * `source` is internal-only — never rendered in the UI — so these checks are
 * the only thing standing between a future edit and the same mistake.
 */

const VALID_SOURCES = ["render", "site-work", "stock"];

// Vocabulary that asserts a *specific* service capability. Generic mood words
// ("luxury", "premium", "signature") are fine — they don't claim Avaya has
// built anything in particular. These do.
const UNEVIDENCED_VERTICAL_WORDS =
  /\bretail\b|\bshowroom\b|\bhotel\b|\bhospitality\b|\bclinic\b|\bhealthcare\b|\brestaurant\b/i;

const COMPLETED_WORK_WORDS =
  /\bcompleted\b|\bbuilt\b|\bconstructed\b|\bactual project\b|\bdelivered project\b/i;

describe("gallery image provenance", () => {
  it("gives every image a valid source", () => {
    IMAGES.forEach((img) => {
      expect(VALID_SOURCES, `${img.id} has invalid source "${img.source}"`).toContain(img.source);
    });
  });

  it("has no duplicate image file", () => {
    const seen = new Map();
    IMAGES.forEach((img) => {
      expect(seen.has(img.src), `${img.id} duplicates ${seen.get(img.src)}'s src: ${img.src}`).toBe(false);
      seen.set(img.src, img.id);
    });
  });

  it("never implies a service Avaya has no evidence for", () => {
    // The specific, already-confirmed failure: a stock or render image
    // captioned as retail, hospitality, healthcare or restaurant work. Real
    // site-work is exempt only if it is genuinely one of those — none is.
    IMAGES.forEach((img) => {
      const text = `${img.title} ${img.alt} ${img.meta || ""}`;
      expect(
        UNEVIDENCED_VERTICAL_WORDS.test(text),
        `${img.id} (${img.source}) implies an unevidenced vertical: "${text}"`,
      ).toBe(false);
    });
  });

  it("never lets a render or stock image claim to be completed/built work", () => {
    // Only source: "site-work" may describe something as actually built —
    // that is the one category for which it is true.
    IMAGES.filter((img) => img.source !== "site-work").forEach((img) => {
      const text = `${img.title} ${img.alt} ${img.meta || ""}`;
      expect(
        COMPLETED_WORK_WORDS.test(text),
        `${img.id} (${img.source}) claims completed/built work: "${text}"`,
      ).toBe(false);
    });
  });

  it("does not attribute any image to a named completed Avaya project", () => {
    // Carried forward from the original Gallery.test.jsx guard — every image
    // is stock, render, or undocumented site-work, never a named project.
    IMAGES.forEach((img) => {
      const text = `${img.title} ${img.alt}`;
      expect(text).not.toMatch(/by Avaya Udyog|Avaya Udyog .*project/i);
    });
  });

  it("carries no orphaned per-item fields the component does not render", () => {
    // The duplicate this file replaces had had tag1/tag2 that nothing ever
    // displayed — dead data from an incomplete edit. Every item's keys must
    // be a subset of the fields the component actually uses.
    const ALLOWED_KEYS = new Set(["id", "title", "alt", "category", "source", "src", "meta"]);
    IMAGES.forEach((img) => {
      Object.keys(img).forEach((key) => {
        expect(ALLOWED_KEYS.has(key), `${img.id} has an unexpected field "${key}"`).toBe(true);
      });
    });
  });
});
