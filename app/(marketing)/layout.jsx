import ContactModalProvider from "../../components/ContactModalProvider";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WhatsappButton from "../../components/WhatsappButton";
import Analytics from "../../components/Analytics";
import SectionScrollHandler from "../../components/SectionScrollHandler";
import { localBusinessSchema, websiteSchema } from "../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Avaya Udyog | Premium Interior Designer in Kolkata";
const DESCRIPTION =
  "Looking for the best interior designer in Kolkata? Avaya Udyog delivers luxury residential and commercial interiors with 35+ years of expertise. Book a consultation today.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;

// Title/description/canonical/OG/Twitter/JSON-LD — everything specific to
// the marketing site — live here rather than the root layout. This is a
// route group (the parens don't add a URL segment, `/` stays `/`), and
// /portal is a sibling route under app/portal/, not a descendant of this
// layout, so none of this ever reaches it.
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "Avaya Udyog",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function MarketingLayout({ children }) {
  return (
    <>
      {/* The hero preload used to live here. It has moved to the homepage —
          app/(marketing)/page.jsx — for two reasons the built output made
          plain:

            1. Emitted from this layout it produced TWO identical
               <link rel="preload"> tags in the <head> of every page: React
               hoists the element into the head, and the same element also
               survives in the layout's own rendered output, so the browser
               was handed the declaration twice.

            2. The hero image is rendered by exactly one route. Preloading it
               from a layout that wraps sixteen routes meant /services,
               /about, /process and every insights article each downloaded a
               196 KB image they never display, and logged the browser's
               "preloaded but not used within a few seconds" warning.

          One declaration, on the one page that shows the image. */}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Analytics />

      {/* First focusable element in the document, so it is the very first
          thing a keyboard user reaches — a skip link placed after the nav is
          decoration. Styling in globals.css (.skip-link): off-canvas until
          focused, never display:none, which would drop it from the tab order.

          tabIndex={-1} on <main> makes it a valid focus target: without it the
          browser moves the scroll position but leaves focus on the link, so
          the next Tab returns to the navbar and the skip does nothing for the
          people who need it most. -1 keeps it out of the normal tab sequence
          while still allowing programmatic focus. */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Receives the section handed over by a SectionLink click and scrolls
          to it once the destination page has laid out — the half of hash-free
          section navigation that runs on arrival. Renders nothing. */}
      <SectionScrollHandler />

      <ContactModalProvider>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <WhatsappButton />
      </ContactModalProvider>
    </>
  );
}
