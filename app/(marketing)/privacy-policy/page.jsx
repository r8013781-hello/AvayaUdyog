import Link from "next/link";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Privacy Policy | Avaya Udyog";
const DESCRIPTION =
  "Learn how Avaya Udyog collects, uses, and protects your personal information when you use our website and services.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/privacy-policy`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  // Legal boilerplate has no informational or commercial value to a
  // searcher, and its sitewide footer link (every page links it once) was
  // giving it enough weight to compete with real commercial pages for
  // branded-query attention — see the entity/sitelink audit. `follow: true`
  // is deliberate: the page must stay fully crawlable so Google can see
  // this directive and continue through any links it contains; only
  // indexing (making the page itself eligible to rank/appear) is disabled.
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Avaya Udyog",
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="section bg-canvas">
      <div className="shell max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="display mt-6 text-[2.4rem] text-ink sm:text-5xl">
          Privacy{" "}
          <span className="accent text-sage-600">Policy</span>
        </h1>
        <p className="mt-4 text-[0.86rem] text-ink-muted">
          Last updated: August 2026
        </p>

        <div className="prose mt-12 max-w-none space-y-10">
          <Section title="1. Introduction">
            <p>
              Avaya Udyog (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;) is committed to protecting the privacy of
              visitors to our website at{" "}
              <Link href="/" className="font-semibold text-sage-700 underline underline-offset-2">
                avayaudyog.com
              </Link>
              . This Privacy Policy explains what personal information we
              collect, why we collect it, and how we use and protect it.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>
              When you submit an enquiry through our consultation form, we
              collect the following information:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Your name</li>
              <li>Phone number</li>
              <li>Email address (optional)</li>
              <li>City and address/locality (optional)</li>
              <li>Project description / message</li>
            </ul>
            <p className="mt-4">
              We also automatically collect non-personal technical data such
              as your browser type, device type, pages visited, and referring
              URL to help us understand how visitors use our site and to
              improve its performance.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your personal information to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Respond to your enquiry and provide design consultation</li>
              <li>Communicate with you about our services</li>
              <li>Improve our website and services</li>
            </ul>
            <p className="mt-4">
              We do not sell, rent, or share your personal information with
              third parties for their marketing purposes.
            </p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your enquiry data is stored securely on our servers. We use
              industry-standard security measures including encrypted
              connections (HTTPS) and access controls to protect your
              information.
            </p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>Our website uses the following third-party services:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Google Analytics</strong> &mdash; to understand website
                traffic and usage patterns
              </li>
              <li>
                <strong>Google Ads</strong> &mdash; to measure the effectiveness
                of our advertising
              </li>
              <li>
                <strong>Google Fonts</strong> &mdash; to serve web fonts
              </li>
            </ul>
            <p className="mt-4">
              These services may collect anonymised usage data in accordance
              with their own privacy policies.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Our website may use cookies and similar technologies placed by
              third-party analytics and advertising services. These help us
              understand how you interact with our site and measure the
              effectiveness of our advertising. You can control cookies
              through your browser settings.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              You have the right to request access to, correction of, or
              deletion of your personal information. To exercise these
              rights, please contact us at the details below.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <ul className="mt-3 list-none space-y-1.5 pl-0">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info.avayaudyog@gmail.com"
                  className="font-semibold text-sage-700 underline underline-offset-2"
                >
                  info.avayaudyog@gmail.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+917980640714"
                  className="font-semibold text-sage-700 underline underline-offset-2"
                >
                  +91 79806 40714
                </a>
              </li>
              <li>
                <strong>Location:</strong> Kolkata, West Bengal, India
              </li>
            </ul>
          </Section>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <Link
            href="/"
            className="text-[0.86rem] font-semibold text-sage-700 underline underline-offset-2 transition-colors hover:text-sage-900"
          >
            &larr; Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-[1.4rem] font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-[0.94rem] leading-[1.85] text-ink-soft">
        {children}
      </div>
    </section>
  );
}
