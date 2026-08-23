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
  // Only what the business has actually established.
  //
  // This previously listed Salt Lake, New Town, Ballygunge and Alipore. None of
  // them has any supporting evidence anywhere in this repository — no projects,
  // no content, no images — and no recorded confirmation from the business.
  // They were introduced in commit 4c65d26 alongside unrelated work.
  //
  // Declaring a service area is a claim to Google and to customers, and an
  // unverified one is worse than an absent one: it invites local queries the
  // business may not be able to serve, and it is the seed of a doorway-page
  // structure if location pages are ever built on top of it.
  //
  // Kolkata stays because it is stated across the site's own published copy.
  // Howrah is a genuinely separate municipal city and was equally unevidenced,
  // so it goes too — proximity is not coverage.
  //
  // To restore any of these: confirm the business actually works there, then
  // add it back with a note recording who confirmed it and when, exactly as
  // __tests__/claims.test.js documents for the confirmed figures.
  areaServed: [{ "@type": "City", name: "Kolkata" }],

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
  // organization level. Repeating all six cities inside every page's own
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
