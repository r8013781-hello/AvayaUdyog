// Ported verbatim from the Vite app's index.html JSON-LD block. Every field
// here already existed and was verified against real site content in an
// earlier audit pass — nothing invented, nothing added for this migration.
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
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
  // Kolkata and Howrah are genuinely separate municipal cities. The other
  // four are not: Ballygunge and Alipore are Kolkata neighbourhoods, and
  // Salt Lake (Bidhannagar) and New Town are planned townships — `Place` is
  // the accurate schema.org type for all four.
  //
  // NOTE: these four locality claims have no supporting evidence anywhere in
  // the repository (no projects, content, or images) and no recorded business
  // confirmation. They are left in place pending that confirmation — if the
  // business does not actually serve them, they should be removed rather than
  // retyped.
  areaServed: [
    { "@type": "City", name: "Kolkata" },
    { "@type": "City", name: "Howrah" },
    { "@type": "Place", name: "Salt Lake" },
    { "@type": "Place", name: "New Town" },
    { "@type": "Place", name: "Ballygunge" },
    { "@type": "Place", name: "Alipore" },
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
  name: "Avaya Udyog",
  url: "https://avayaudyog.com/",
};

// Small, reusable builders for the category/service landing pages — not
// the full localBusinessSchema. Each new page gets only the schema types
// its own content justifies (BreadcrumbList always; Service only where a
// page maps to one specific, already-published offering from
// localBusinessSchema.hasOfferCatalog above), referencing the same real
// name/url/areaServed already declared rather than restating the whole
// business entity on every route.
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
    serviceType: name,
    name,
    description,
    url,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: localBusinessSchema.name,
      url: localBusinessSchema.url,
    },
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
