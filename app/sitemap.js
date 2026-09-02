import { INSIGHTS } from "../lib/insights";

// /about, /process and /services were merged into the homepage as sections
// and their routes deleted, so they are gone from here too — a sitemap that
// lists a URL the build does not produce is a self-inflicted 404 report in
// Search Console. Those three URLs need host-side 301s to `/`; see
// docs/page-merge.md.
//
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
  // Absorbed the About, Process and Services-hub content.
  home: "2026-08-24",
  modularKitchen: "2026-08-23",
  renovation: "2026-08-23",
  insights: "2026-08-23",
  residential: "2026-08-23",
  // Gained the constraints / workflow / phasing / delivery sections.
  commercial: "2026-08-24",
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
      url: `${SITE_URL}/insights`,
      lastModified: LAST_MODIFIED.insights,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Articles are generated from the registry so the sitemap can never list
    // one that does not exist, or miss one that does.
    // `updated` where an article has been materially revised since it was
    // published, `published` otherwise — same principle as the constants
    // above: only claim a change when there was one.
    ...INSIGHTS.map((post) => ({
      url: `${SITE_URL}/insights/${post.slug}`,
      lastModified: post.updated ?? post.published,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
    // /privacy-policy is deliberately not listed: it's noindex, follow
    // (app/(marketing)/privacy-policy/page.jsx) — legal boilerplate with no
    // commercial or informational value to a searcher. Listing a noindex
    // page in the sitemap sends Google a contradictory signal for no
    // benefit, so it's simply left out rather than included at a low
    // priority. The page itself, its canonical, and the footer link are
    // unchanged — only sitemap discovery is affected.
    {
      url: `${SITE_URL}/terms`,
      lastModified: LAST_MODIFIED.terms,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
