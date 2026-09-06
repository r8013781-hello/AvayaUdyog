import { describe, it, expect } from "vitest";
import {
  PROMO_QUOTES,
  PROMO_BACKGROUNDS,
  nextRotationIndex,
  promoSlideFor,
} from "../lib/promoQuotes";

describe("promo content", () => {
  it("every quote has a headline and a supporting line", () => {
    expect(PROMO_QUOTES.length).toBeGreaterThanOrEqual(6);
    for (const q of PROMO_QUOTES) {
      expect(typeof q.headline).toBe("string");
      expect(q.headline.trim().length).toBeGreaterThan(0);
      expect(q.sub.trim().length).toBeGreaterThan(0);
    }
  });

  it("every background is a local public/ path to an image", () => {
    for (const src of PROMO_BACKGROUNDS) {
      expect(src).toMatch(/^\/[\w/-]+\.(webp|jpg|png)$/);
    }
  });

  it("leads with decoration — the company's headline service — and stays wide, not location-locked", () => {
    const joined = PROMO_QUOTES.map((q) => `${q.headline} ${q.sub}`).join(" ").toLowerCase();
    // Decoration / styling / finishing must be front and centre.
    const decorLines = PROMO_QUOTES.filter((q) =>
      /decorat|décor|decor|styl|dress|finish/i.test(`${q.headline} ${q.sub}`),
    );
    expect(decorLines.length).toBeGreaterThanOrEqual(PROMO_QUOTES.length / 2);
    // Proof points appear as quiet support.
    expect(joined).toMatch(/35\+ years/);
    expect(joined).toMatch(/700\+/);
    expect(joined).toMatch(/100% satisfaction/);
    expect(joined).toMatch(/consultation/);
    // Deliberately not anchored to a single city.
    expect(joined).not.toMatch(/kolkata|bengal|howrah|salt lake/);
  });
});

describe("nextRotationIndex", () => {
  it("advances and wraps", () => {
    expect(nextRotationIndex(0, 3)).toBe(1);
    expect(nextRotationIndex(2, 3)).toBe(0);
  });
  it("never returns the same index it was given (for length > 1)", () => {
    for (let i = 0; i < 5; i += 1) expect(nextRotationIndex(i, 5)).not.toBe(i);
  });
  it("is defensive about bad input", () => {
    expect(nextRotationIndex(-1, 4)).toBe(0);
    expect(nextRotationIndex(0, 0)).toBe(0);
    expect(nextRotationIndex(NaN, 4)).toBe(0);
  });
});

describe("promoSlideFor", () => {
  it("returns a quote + background for an appearance number", () => {
    const slide = promoSlideFor(0);
    expect(slide.quote).toBe(PROMO_QUOTES[0]);
    expect(slide.background).toBe(PROMO_BACKGROUNDS[0]);
  });

  it("cycles independently through quotes and backgrounds", () => {
    const slide = promoSlideFor(PROMO_QUOTES.length + 1);
    expect(slide.quote).toBe(PROMO_QUOTES[1 % PROMO_QUOTES.length]);
    expect(slide.background).toBe(PROMO_BACKGROUNDS[(PROMO_QUOTES.length + 1) % PROMO_BACKGROUNDS.length]);
  });

  it("tolerates a nonsense appearance value", () => {
    expect(promoSlideFor(-3).quote).toBe(PROMO_QUOTES[0]);
    expect(promoSlideFor(undefined).quote).toBe(PROMO_QUOTES[0]);
  });
});
