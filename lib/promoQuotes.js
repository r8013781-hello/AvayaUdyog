/**
 * Content + rotation for the recurring promotional popup (components/PromoPopup.jsx).
 *
 * A plain, pure module so the copy is reviewable in one place and the rotation
 * is unit-testable.
 *
 * Voice: broad and aspirational, leading with the feeling of a finished,
 * beautifully decorated space. Avaya Udyog is an interior DESIGN & DECORATION
 * company — decoration (styling, furnishing, finishing, the final dressing of
 * a room) is the headline service, so most lines put that front and centre.
 * Scale (35+ years, 700+ projects, 100% satisfaction) sits underneath as quiet
 * proof rather than as the hook.
 */

export const PROMO_QUOTES = [
  {
    headline: "Designed to fit you. Decorated to feel like home.",
    sub: "The full journey — layout, finishes and the final styling — handled by one team.",
  },
  {
    headline: "From bare rooms to beautifully decorated spaces.",
    sub: "Furnishing, finishing and décor, delivered ready to live in.",
  },
  {
    headline: "Decoration is where a room finds its soul.",
    sub: "Colour, texture, light and detail — composed until the space feels complete.",
  },
  {
    headline: "We don’t just design a space. We dress it.",
    sub: "Down to the last cushion, curtain and light fixture.",
  },
  {
    headline: "A home you can’t wait to come back to.",
    sub: "Considered design and honest craft, from first idea to final finish.",
  },
  {
    headline: "The art of decoration, backed by decades of craft.",
    sub: "35+ years of interiors, and a single promise: 100% satisfaction.",
  },
  {
    headline: "Beautifully styled. Precisely delivered.",
    sub: "One accountable process — no hand-offs, no surprises on the bill.",
  },
  {
    headline: "Interiors and décor worth living in.",
    sub: "700+ homes and workspaces, designed, decorated and built to completion.",
  },
  {
    headline: "Your vision, styled into rooms you love.",
    sub: "Start with a free consultation and watch it take shape.",
  },
  {
    headline: "Less renovation stress. A fully finished, styled home.",
    sub: "We phase the work around your life and hold the timeline we set.",
  },
];

/**
 * Full-bleed background photos — finished, styled interiors. Plain public/
 * paths so the static export needs no image server; each is already sized and
 * compressed. Rotated in step with the quotes.
 */
export const PROMO_BACKGROUNDS = [
  "/hero/living.webp",
  "/hero/bedroom.webp",
  "/gallery/g2-1494526585095.webp",
  "/about/living-space.webp",
  "/gallery/g7-1524758631624.webp",
  "/hero/bath.webp",
];

/** Next index in a cycle, never repeating the current one back-to-back. */
export function nextRotationIndex(current, length) {
  if (!Number.isInteger(length) || length <= 0) return 0;
  if (!Number.isInteger(current) || current < 0) return 0;
  return (current + 1) % length;
}

/** The quote + background for a given appearance number (0-based). */
export function promoSlideFor(appearance) {
  const i = Number.isInteger(appearance) && appearance >= 0 ? appearance : 0;
  return {
    quote: PROMO_QUOTES[i % PROMO_QUOTES.length],
    background: PROMO_BACKGROUNDS[i % PROMO_BACKGROUNDS.length],
  };
}
