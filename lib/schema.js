// Ported verbatim from the Vite app's index.html JSON-LD block. Every field
// here already existed and was verified against real site content in an
// earlier audit pass — nothing invented, nothing added for this migration.
// Stable identifiers so the separate JSON-LD blocks on a page describe ONE
// business rather than three unrelated fragments. Google merges nodes that
// share an @id, which is what turns these into a connected entity graph —
// the `@graph` array is only a container, the @id references are the substance.
export const BUSINESS_ID = "https://avayaudyog.com/#business";
export const WEBSITE_ID = "https://avayaudyog.com/#website";

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": BUSINESS_ID,
  name: "Avaya Udyog",
  description:
    "Luxury interior design and decoration studio led by Mr. Biswanath Adhikari, serving residential and commercial clients for over 35 years.",
  url: "https://avayaudyog.com/",
  telephone: "+917980640714",
  email: "info.avayaudyog@gmail.com",
  image: "https://avayaudyog.com/hero/exterior.webp",
  logo: "https://avayaudyog.com/android-chrome-512x512.png",
  founder: {
    "@type": "Person",
    name: "Biswanath Adhikari",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  // ── Service coverage ──────────────────────────────────────────────────
  //
  // Coverage is PAN-INDIA. Confirmed by the site owner; Kolkata is the
  // studio's base and strongest local market, not the limit of where it
  // works.
  //
  // Two nodes, and only two, because each says something different and
  // neither can be inferred from the other:
  //
  //   Country/India — the actual extent of the service. This is the claim
  //   the business has confirmed, so it is the one that gets stated.
  //
  //   City/Kolkata — retained even though India already contains it. It is
  //   not redundant: it is the only place in the graph that distinguishes
  //   "we will travel anywhere" from "this is where we are established",
  //   and it is corroborated by `address` below, by the site's own copy and
  //   by the whole insights section. Dropping it would weaken the local
  //   signal that currently earns the site its Kolkata rankings.
  //
  // What is deliberately NOT done here:
  //
  //   * No second LocalBusiness node per city. Multiple LocalBusiness
  //     entities are a claim to multiple staffed premises. There is one
  //     business at one address, so there is one node.
  //   * No invented branch addresses. `address` stays the real Kolkata one.
  //   * No list of individual cities. Naming Mumbai, Delhi, Bengaluru and so
  //     on would be an unevidenced claim per city and the seed of a doorway
  //     structure — exactly what the earlier Salt Lake / New Town / Alipore
  //     list was removed for. "India" is one claim, and it is the true one.
  //
  // If the business ever opens a genuine second premises, that is a second
  // LocalBusiness node with its own @id and its own real address — not
  // another string in this array.
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "City", name: "Kolkata" },
  ],

  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Interior Design Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Residential Interiors",
          description:
            "Warm, modern homes shaped around your lifestyle — thoughtful layouts, curated finishes, and elevated details.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Commercial Spaces",
          description:
            "Brand-first offices and retail environments designed to impress clients and keep teams inspired and productive.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Design Consultation",
          description:
            "Concept development, material guidance, and clear design direction that turn rough ideas into a buildable vision.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Turnkey Execution",
          description: "End-to-end project management from first sketch to final styling.",
        },
      },
    ],
  },
  priceRange: "$$$",
};

// A WebSite entity is a distinct schema.org type from the business itself
// — it identifies the site as a thing search engines can reference (e.g.
// for sitelinks search box eligibility). Only real, already-published
// facts: the name and canonical URL. No sameAs (no verified social
// profiles exist yet), no search action (there's no on-site search).
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "Avaya Udyog",
  url: "https://avayaudyog.com/",
  // Points at the business node rather than repeating its details.
  publisher: { "@id": BUSINESS_ID },
};

// Small, reusable builders for the category/service landing pages — not
// the full localBusinessSchema. Each new page gets only the schema types
// its own content justifies (BreadcrumbList always; Service only where a
// page maps to one specific, already-published offering from
// localBusinessSchema.hasOfferCatalog above), referencing the same real
// name/url/areaServed already declared rather than restating the whole
// business entity on every route.
export function breadcrumbSchema(items, pageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // Addressable so the page's WebPage node can reference it by @id.
    ...(pageUrl ? { "@id": `${pageUrl}#breadcrumb` } : {}),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceSchema({ name, description, url }) {
  // areaServed is deliberately omitted — localBusinessSchema (injected once,
  // sitewide, by the marketing layout) already declares it at the
  // organization level. Restating the coverage inside every page's own
  // Service block would be exactly the "blindly copy the homepage's JSON-LD
  // onto every page" duplication this was built to avoid.
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: name,
    name,
    description,
    url,
    // Reference, not a copy. Restating name/url here would create a second
    // business node competing with the real one.
    provider: { "@id": BUSINESS_ID },
  };
}

/**
 * FAQPage, generated from the FAQ section's own data so the two can never
 * drift apart — the answers Google reads are literally the answers on screen,
 * which is the one thing FAQ markup is actually required to do.
 *
 * Worth knowing what this does and doesn't buy: since 2023 Google shows FAQ
 * rich results almost exclusively for government and health sites, so this is
 * not going to produce dropdowns under the listing. It is still worth
 * emitting — it is machine-readable Q&A for the assistants and answer engines
 * that do read it, and it costs one script tag.
 */
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/**
 * ImageObject — deliberately narrow.
 *
 * This must be called ONLY for a photograph Avaya Udyog can honestly stand
 * behind as its own site-work. A render or a stock photo has no place here:
 * marking either as an ImageObject tied to this business would be exactly
 * the false authorship claim the gallery provenance guardrails
 * (lib/galleryImages.js) exist to prevent — schema is still a claim, even
 * though nothing about it is visible on the page.
 *
 * width/height come from the same lib/imageDimensions.js manifest every
 * <img> on the site already uses, so this can never assert a size that
 * disagrees with what the page actually renders.
 */
export function imageObjectSchema({ url, width, height, caption }) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: url,
    url,
    width,
    height,
    ...(caption ? { caption } : {}),
    creator: { "@id": BUSINESS_ID },
  };
}

/**
 * The WebPage node — the piece that was missing.
 *
 * Without it, a page's Service and BreadcrumbList float unattached: nothing
 * says which page they describe or which site that page belongs to. This ties
 * them together, so a crawler reads one document about one business rather
 * than a handful of unrelated fragments that happen to share a URL.
 *
 * `about` should be the @id of the page's primary Service where it has one;
 * omit it on pages that do not map to a single offering.
 */
/**
 * Article schema for an Insight. Every field is drawn from lib/insights.js —
 * nothing here is invented for the schema. In particular:
 *
 *   - author is the business, not a fabricated named writer. No individual
 *     byline is published anywhere on these pages, so Person authorship
 *     would be inventing an identity; Organization authorship states only
 *     what is already true — Avaya Udyog publishes this.
 *   - datePublished comes straight from the article's real `published` date.
 *     Most insights have no separately tracked "last substantively edited"
 *     date (see lib/insights.js's own comments on this), so dateModified is
 *     omitted for them rather than set equal to datePublished, which would
 *     assert a fact — "this was revised" — that isn't true. Pass
 *     `dateModified` only where the data model actually tracks a real edit
 *     date for that article (currently just the `updated` field on
 *     interior-design-cost-kolkata).
 *   - image reuses the same OG image already published in the page's own
 *     metadata. Nothing new is being claimed about the image; the schema is
 *     just stating what the page already asserts elsewhere.
 */
export function articleSchema({ url, headline, description, datePublished, dateModified, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    datePublished,
    ...(dateModified ? { dateModified } : {}),
    author: { "@id": BUSINESS_ID },
    publisher: { "@id": BUSINESS_ID },
    ...(image ? { image } : {}),
  };
}

export function webPageSchema({ url, name, description, about }) {
  const node = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    // The page is published by the business, not merely about it.
    publisher: { "@id": BUSINESS_ID },
  };
  if (about) node.about = { "@id": about };
  return node;
}
