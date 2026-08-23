import { INSIGHTS } from "../lib/insights";

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
  services: "2026-08-23",
  modularKitchen: "2026-08-23",
  renovation: "2026-08-23",
  about: "2026-08-23",
  process: "2026-08-23",
  insights: "2026-08-23",
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
      url: `${SITE_URL}/services`,
      lastModified: LAST_MODIFIED.services,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/services/modular-kitchen`,
      lastModified: LAST_MODIFIED.modularKitchen,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/home-renovation`,
      lastModified: LAST_MODIFIED.renovation,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/residential-interior-design`,
      lastModified: LAST_MODIFIED.residential,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services/commercial-interior-design`,
      lastModified: LAST_MODIFIED.commercial,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: LAST_MODIFIED.about,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/process`,
      lastModified: LAST_MODIFIED.process,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/insights`,
      lastModified: LAST_MODIFIED.insights,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Articles are generated from the registry so the sitemap can never list
    // one that does not exist, or miss one that does.
    ...INSIGHTS.map((post) => ({
      url: `${SITE_URL}/insights/${post.slug}`,
      lastModified: post.published,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
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
