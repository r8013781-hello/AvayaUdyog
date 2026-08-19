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
  areaServed: [
    { "@type": "City", name: "Kolkata" },
    { "@type": "City", name: "Salt Lake" },
    { "@type": "City", name: "New Town" },
    { "@type": "City", name: "Howrah" },
    { "@type": "City", name: "Ballygunge" },
    { "@type": "City", name: "Alipore" },
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
