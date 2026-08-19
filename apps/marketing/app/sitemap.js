// Replaces the Vite app's hand-maintained public/sitemap.xml with the App
// Router's generated-route convention. Only the homepage exists as an
// indexable route right now — per the migration brief, no future URLs
// (/services, /projects, etc.) are added here until those pages actually
// exist with real content.
export default function sitemap() {
  return [
    {
      url: "https://avayaudyog.com/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
