/**
 * The insights registry.
 *
 * One source of truth for the hub listing, each article's own metadata, the
 * sitemap and the cross-links. The hub cannot list an article that does not
 * exist, and an article cannot drift from how the hub describes it.
 *
 * Why this content type exists: insights is the only authority-building asset
 * on this site that needs NO business facts the studio has not confirmed. It
 * is domain knowledge — how materials behave, how projects actually run, what
 * goes wrong. That makes it the fastest legitimate route to topical authority
 * while photography, coverage and pricing remain blocked.
 *
 * Rules for anything added here:
 *   - No prices, no project claims, no named clients, no invented results.
 *   - Every article names an `owningService`, and links to it in prose. An
 *     article that sends research traffic nowhere commercial is decoration.
 *   - `published` is the real date the article was written, never backdated.
 */

export const INSIGHTS = [
  {
    slug: "materials-for-kolkata-climate",
    title: "Choosing interior materials that survive Kolkata's climate",
    description:
      "Humidity, monsoon and salt air decide which interior materials last in Kolkata and which fail early. What that means for plywood, veneer, paint, metal and flooring.",
    excerpt:
      "Most material failures in Kolkata homes are not manufacturing defects. They are the predictable result of specifying for a drier climate than the one the material has to live in.",
    owningService: { href: "/services/modular-kitchen", label: "Modular kitchen design" },
    readingMinutes: 7,
    published: "2026-08-23",
  },
  {
    slug: "what-happens-in-a-design-consultation",
    title: "What actually happens in an interior design consultation",
    description:
      "What a first interior design consultation covers, what to bring, what gets decided and what does not — so the meeting is useful rather than vague.",
    excerpt:
      "People arrive at a first consultation expecting to discuss style. The conversation that actually shapes the project is about how you use the space.",
    owningService: { href: "/process", label: "Our process" },
    readingMinutes: 6,
    published: "2026-08-23",
  },
  {
    slug: "living-at-home-during-renovation",
    title: "Can you live at home during a renovation?",
    description:
      "When staying put during a renovation works, when it does not, and how sequencing, dust and services decide the answer for your specific project.",
    excerpt:
      "The honest answer depends far more on scope than on the size of the home — and getting it wrong means months in one room rather than weeks.",
    owningService: { href: "/services/home-renovation", label: "Home renovation" },
    readingMinutes: 6,
    published: "2026-08-23",
  },
];

export function getInsight(slug) {
  return INSIGHTS.find((i) => i.slug === slug) || null;
}

/** Newest first — the order the hub lists them in. */
export function listInsights() {
  return [...INSIGHTS].sort((a, b) => b.published.localeCompare(a.published));
}
