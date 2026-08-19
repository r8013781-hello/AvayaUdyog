import ContactModalProvider from "../../components/ContactModalProvider";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WhatsappButton from "../../components/WhatsappButton";
import { localBusinessSchema, websiteSchema } from "../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Avaya Udyog | Premium Interior Designer in Kolkata";
const DESCRIPTION =
  "Looking for the best interior designer in Kolkata? Avaya Udyog delivers luxury interiors with 35+ years of expertise. Book a free consultation today.";
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
      {/* Static export still ships a client-rendered slideshow (see
          HeroSlideshow.jsx) — this preload is what lets the browser start
          fetching the first hero image in parallel with the JS bundle
          instead of waiting for it to mount. Marketing-only: /portal never
          renders this image, so it has no reason to preload it. */}
      <link rel="preload" as="image" href="/hero/exterior.webp" fetchPriority="high" />

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

      <ContactModalProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsappButton />
      </ContactModalProvider>
    </>
  );
}
