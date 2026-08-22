// Replaces the Vite app's hand-maintained public/sitemap.xml with the App
// Router's generated-route convention. Only routes with real, substantial
// content are listed here — per the migration brief, no future URLs
// (/services, /projects, etc.) are added until those pages actually exist
// with real content.
export default function sitemap() {
  return [
    {
      url: "https://avayaudyog.com/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://avayaudyog.com/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://avayaudyog.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
