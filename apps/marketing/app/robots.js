// Replaces the Vite app's static public/robots.txt with the App Router's
// generated-route convention (produces a real /robots.txt at build time
// under output: 'export'). Same intent as before — allow the public site,
// keep the sitemap discoverable.
//
// The old `Disallow: /portal` doesn't carry over: this marketing app has
// no /portal route at all (the CRM is a separate application — see the
// migration report), so there's nothing on this host to disallow.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://avayaudyog.com/sitemap.xml",
  };
}
