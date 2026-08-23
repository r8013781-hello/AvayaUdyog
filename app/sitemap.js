// Replaces the Vite app's hand-maintained public/sitemap.xml with the App
// Router's generated-route convention. Only routes with real, substantial
// content are listed here — per the migration brief, no future URLs
// (/projects, /locations, etc.) are added until those pages actually exist
// with real content.
//
// `lastModified` is a per-route constant, deliberately NOT `new Date()`.
// Calling `new Date()` at build time re-stamps every URL on every deploy,
// telling Google the whole site changed each time the site is rebuilt —
// which is false, and devalues the signal for the pages that genuinely did
// change. Update a route's date here when that route's content actually
// changes.
const LAST_MODIFIED = {
  home: "2026-08-23",
  kolkata: "2026-08-23",
  residential: "2026-08-23",
  commercial: "2026-08-23",
  privacy: "2026-08-23",
  terms: "2026-08-23",
};

const SITE_URL = "https://avayaudyog.com";

export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED.home,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/interior-designer-kolkata`,
      lastModified: LAST_MODIFIED.kolkata,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/residential-interior-designer-kolkata`,
      lastModified: LAST_MODIFIED.residential,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/commercial-interior-designer-kolkata`,
      lastModified: LAST_MODIFIED.commercial,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: LAST_MODIFIED.privacy,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: LAST_MODIFIED.terms,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
