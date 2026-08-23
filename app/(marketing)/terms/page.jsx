import Link from "next/link";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Terms of Service | Avaya Udyog";
const DESCRIPTION =
  "Terms and conditions governing the use of the Avaya Udyog website and interior design services.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/terms`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
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

export default function TermsPage() {
  return (
    <div className="section bg-canvas">
      <div className="shell max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="display mt-6 text-[2.4rem] text-ink sm:text-5xl">
          Terms of{" "}
          <span className="accent text-sage-600">Service</span>
        </h1>
        <p className="mt-4 text-[0.86rem] text-ink-muted">
          Last updated: August 2026
        </p>

        <div className="prose mt-12 max-w-none space-y-10">
          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using the Avaya Udyog website at{" "}
              <Link href="/" className="font-semibold text-sage-700 underline underline-offset-2">
                avayaudyog.com
              </Link>
              , you agree to be bound by these Terms of Service. If you do
              not agree to these terms, please do not use our website.
            </p>
          </Section>

          <Section title="2. Services">
            <p>
              Avaya Udyog provides interior design and decoration services
              including residential interiors, commercial spaces, design
              consultation, and turnkey execution. The scope, timeline, and
              cost of any project are agreed upon individually with each
              client and documented separately.
            </p>
          </Section>

          <Section title="3. Enquiries and Consultations">
            <p>
              Submitting an enquiry through our website does not constitute
              a binding agreement or contract. It is a request for our team
              to contact you to discuss your project. We aim to respond to
              all enquiries within 24 hours during business days.
            </p>
          </Section>

          <Section title="4. Intellectual Property">
            <p>
              All content on this website &mdash; including text, images, designs,
              logos, and graphics &mdash; is the property of Avaya Udyog and is
              protected by applicable intellectual property laws. You may
              not reproduce, distribute, or use our content without prior
              written permission.
            </p>
          </Section>

          <Section title="5. Project Photography">
            <p>
              Photographs of completed projects displayed on our website and
              portfolio are used with appropriate permissions. These images
              represent actual work completed by Avaya Udyog and may not be
              reproduced without our consent.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              The information on this website is provided for general
              informational purposes. While we strive to keep the content
              accurate and up to date, we make no warranties about the
              completeness, accuracy, or suitability of the information.
              Specific project details, pricing, and timelines are discussed
              and agreed upon individually.
            </p>
          </Section>

          <Section title="7. External Links">
            <p>
              Our website may contain links to third-party websites. We are
              not responsible for the content, privacy practices, or
              availability of those external sites.
            </p>
          </Section>

          <Section title="8. Changes to Terms">
            <p>
              We reserve the right to update these Terms of Service at any
              time. Changes will be reflected on this page with an updated
              date. Continued use of the website after changes constitutes
              acceptance of the new terms.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              These terms are governed by and construed in accordance with
              the laws of India. Any disputes arising from these terms shall
              be subject to the exclusive jurisdiction of the courts in
              Kolkata, West Bengal.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For questions about these Terms of Service, please contact us:
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
