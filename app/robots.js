// Replaces the Vite app's static public/robots.txt with the App Router's
// generated-route convention (produces a real /robots.txt at build time
// under output: 'export'). Same intent as before — allow the public site,
// keep the sitemap discoverable.
//
// /portal is back on this host (the CRM now lives here too, see
// app/portal/) — restoring the same Disallow the original Vite app's
// robots.txt had. This is defense in depth alongside the noindex meta
// tag on app/portal/layout.jsx, not the only thing protecting it.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/portal",
    },
    sitemap: "https://avayaudyog.com/sitemap.xml",
  };
}
