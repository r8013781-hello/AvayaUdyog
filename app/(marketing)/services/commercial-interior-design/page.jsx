import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import PageCTAButton from "../../../../components/PageCTAButton";
import StatStrip from "../../../../components/StatStrip";
import { serviceSchema, webPageSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Commercial Interior Designer in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Brand-first office and retail interiors in Kolkata by Avaya Udyog — designed to impress clients and keep teams inspired and productive. Book a consultation.";
const OG_IMAGE = `${SITE_URL}/services/s2-commercial.webp`;
const PAGE_URL = `${SITE_URL}/services/commercial-interior-design`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
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

const service = serviceSchema({
  name: "Commercial Interior Design",
  description:
    "Brand-first offices and retail environments designed to impress clients and keep teams inspired and productive.",
  url: PAGE_URL,
});

// Scoped to the two commercial types the published "Commercial Spaces"
// service copy actually claims — "brand-first offices and retail
// environments" (components/Services.jsx, lib/schema.js). Hospitality was
// dropped: its only basis was a stock gallery photo captioned "boutique
// hotel lounge", which is not evidence the studio takes hospitality work.
// The images are design-direction references, not project photography.
const SPACES = [
  {
    title: "Offices",
    text: "Workspaces with natural light and a premium build finish, designed to keep teams productive and proud of where they work.",
    src: "/gallery/g6-1497366754035.webp",
    alt: "Modern office workspace with natural light and a premium build finish",
  },
  {
    title: "Retail Showrooms",
    text: "Product display and store layout built around a strong, consistent brand presence.",
    src: "/gallery/g7-1524758631624.webp",
    alt: "Retail showroom interior with an elegant product display and strong brand presence",
  },
];

const webPage = webPageSchema({
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  about: `${PAGE_URL}#service`,
});

export default function CommercialInteriorDesignerKolkataPage() {
  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            {
              name: "Commercial Interior Design",
              path: "/services/commercial-interior-design",
            },
          ]}
        />
      </div>

      {/* ---------- Intro ---------- */}
      <section className="section !pt-10">
        <div className="shell relative">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <figure className="order-2 overflow-hidden rounded-[2rem] bg-sage-100 shadow-lift lg:order-1">
              <img
                src="/services/s2-commercial.webp"
                alt="Glass-walled modern office corridor — commercial interior design"
                loading="eager"
                decoding="async"
                className="h-[24rem] w-full object-cover sm:h-[28rem]"
              />
            </figure>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Commercial Interior Designer in Kolkata</span>
              <h1 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
                Workspaces built for{" "}
                <span className="accent text-sage-600">the brand behind them.</span>
              </h1>
              <p className="mt-6 max-w-prose2 text-[1.02rem] leading-[1.85] text-ink-soft">
                Avaya Udyog designs brand-first offices and retail
                environments across Kolkata — spaces built to impress clients
                and keep teams inspired, productive, and proud of where they
                work.
              </p>

              <div className="mt-9">
                <PageCTAButton triggerSource="commercial_page_cta">
                  Discuss Your Commercial Project
                </PageCTAButton>
              </div>

              {/* Confirmed figures, on a page that otherwise asks for an
                  enquiry without offering any reason to trust it. */}
              <StatStrip className="mt-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- What we design ---------- */}
      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">What We Design</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              Spaces people <span className="accent text-sage-600">work and gather in.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SPACES.map((space) => (
              <div key={space.title} className="card card-hover overflow-hidden">
                <img
                  src={space.src}
                  alt={space.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-[1.2rem] font-semibold text-ink">
                    {space.title}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                    {space.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">How a Commercial Project Runs</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              From brief to <span className="accent text-sage-600">final fit-out.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="card p-7">
              <span className="flex h-9 items-center rounded-full border border-line-strong px-3.5 font-display text-[0.8rem] font-semibold text-sage-700">
                01
              </span>
              <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">
                Design Consultation
              </h3>
              <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                Concept development, material guidance, and clear design
                direction that turn a brief into a refined, buildable plan for
                your space.
              </p>
            </div>
            <div className="card p-7">
              <span className="flex h-9 items-center rounded-full border border-line-strong px-3.5 font-display text-[0.8rem] font-semibold text-sage-700">
                02
              </span>
              <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">
                Turnkey Execution
              </h3>
              <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                From first sketch to final styling, we manage every detail so
                your fit-out feels effortless from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Cross-links ---------- */}
      <section className="section !py-20">
        <div className="shell relative grid gap-6 sm:grid-cols-2">
          <Link
            href="/services"
            className="card card-hover group flex items-center justify-between gap-4 p-6"
          >
            <span className="font-display text-[1.05rem] font-semibold text-ink">
              ← Back to Interior Designer in Kolkata
            </span>
          </Link>
          <Link
            href="/services/residential-interior-design"
            className="card card-hover group flex items-center justify-between gap-4 p-6"
          >
            <span className="font-display text-[1.05rem] font-semibold text-ink">
              Looking for home interiors instead?
            </span>
            <ArrowUpRight
              size={16}
              className="flex-shrink-0 text-sage-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="relative overflow-hidden rounded-[2rem] bg-sage-900 px-8 py-12 text-center shadow-lift md:px-14">
            <h2 className="display text-[2rem] text-white sm:text-[2.4rem]">
              Have a workspace in mind?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.94rem] leading-[1.8] text-sage-100/75">
              Share your project with us and receive a personalised
              consultation from our design team.
            </p>
            <div className="mt-8 flex justify-center">
              <PageCTAButton triggerSource="commercial_page_cta" className="bg-white text-sage-900 hover:bg-gold-soft">
                Discuss Your Commercial Project
              </PageCTAButton>
              <Link href="/process" className="text-[0.78rem] font-bold uppercase tracking-label text-white underline underline-offset-4 hover:text-gold-light">
                Our process
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
