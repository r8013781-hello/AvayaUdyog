/**
 * Gallery image data — extracted from components/Gallery.jsx so the
 * provenance guardrail in __tests__/galleryImages.test.js can inspect it
 * directly, the same pattern lib/insights.js and lib/faqs.js already use.
 *
 * ── Why `source` exists ─────────────────────────────────────────────────
 * Every item carries a `source`: "render" | "site-work" | "stock". This is
 * NOT rendered anywhere in the UI — no visible "Render" or "Stock" badge.
 * Its only job is to let the tests below refuse a change that would let an
 * external or design-visualisation image imply completed Avaya project work
 * it cannot support. The customer sees a premium gallery; the codebase knows
 * the truth about every tile in it.
 *
 * ── Why two images were removed here, not just recaptioned ────────────────
 * The set previously included a stock "Retail Showroom Experience" and a
 * stock "Modern Boutique Hotel Lounge... bespoke hospitality interior" image.
 * Avaya has no evidenced retail or hospitality work anywhere in this
 * repository, and both captions independently asserted a specific capability
 * no amount of surrounding context could make true. A visible disclaimer was
 * ruled out deliberately — this is a premium site, not a caveats page — so
 * the only honest fix was removal. Nothing was added to replace them: this
 * pass sources no new imagery, and a gap is better than another ambiguous
 * placeholder in the same two slots.
 *
 * The remaining stock images (t1, t2, t3) were kept. Unlike the two removed,
 * none of them independently claims a specific vertical Avaya cannot support
 * — "Warm Modern Living Room" and "Luxury Lounge Styling" sit within
 * residential, "Signature Office Workspace" within commercial/office. Both
 * are services Avaya genuinely offers, so these read as mood/inspiration
 * imagery rather than a false capability claim.
 *
 * The duplicated heritage stained-glass entry (formerly r5 AND r6, same
 * file) is now a single entry. The orphaned `tag1`/`tag2` props that existed
 * only on the duplicate — and that the component never rendered — are gone
 * with it.
 */

export const IMAGES = [
  {
    id: "r1",
    title: "Signature Living Room",
    alt: "A warm, curated living room interior glowing with atmosphere",
    category: "residential",
    source: "render",
    src: "/gallery/renders/living-room/living-room-render-01.jpg",
    meta: "Signature interiors · atmosphere",
  },
  {
    id: "r2",
    title: "Contemporary Bedroom Design",
    alt: "A calm, tailored bedroom interior in deep navy tones",
    category: "residential",
    source: "render",
    src: "/gallery/renders/bedroom/bedroom-render-01.jpg",
    meta: "Calm palettes · tailored comfort",
  },
  {
    id: "r3",
    title: "Warm Modern Bedroom",
    alt: "A modern bedroom with warm wood textures and elegant lighting",
    category: "residential",
    source: "render",
    src: "/gallery/renders/bedroom/bedroom-render-02.jpg",
    meta: "Wood textures · elegant lighting",
  },
  {
    id: "r4",
    title: "Open Plan Kitchen",
    alt: "A minimalist modular kitchen with clean lines and premium finishes",
    category: "residential",
    source: "render",
    src: "/gallery/renders/kitchen/kitchen-render-01.jpg",
    meta: "Modular design · premium finishes",
  },
  {
    id: "r5",
    title: "Heritage Stained Glass",
    alt: "A finished heritage stained glass installation on site",
    category: "residential",
    source: "site-work",
    src: "/gallery/site-work/finished-heritage-stained-glass.jpg",
    meta: "Heritage install · on-site work",
  },
  {
    id: "t1",
    title: "Warm Modern Living Room",
    alt: "Warm modern living room with curated finishes and layered warm lighting",
    category: "residential",
    source: "stock",
    src: "/gallery/g1-1505693416388.webp",
    meta: "Curated finishes · warm lighting",
  },
  {
    id: "t2",
    title: "Luxury Lounge Styling",
    alt: "Luxury lounge interior styling with layered textures and a contemporary design theme",
    category: "residential",
    source: "stock",
    src: "/gallery/g2-1494526585095.webp",
    meta: "Layered textures · contemporary",
  },
  {
    id: "t3",
    title: "Signature Office Workspace",
    alt: "Modern office workspace interior with natural light and a premium build finish",
    category: "commercial",
    source: "stock",
    src: "/gallery/g6-1497366754035.webp",
    meta: "Natural light · premium build",
  },
];
