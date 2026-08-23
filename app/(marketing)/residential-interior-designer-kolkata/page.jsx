import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageCTAButton from "../../../components/PageCTAButton";
import StatStrip from "../../../components/StatStrip";
import { serviceSchema, webPageSchema } from "../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Residential Interior Designer in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Warm, personalised home interiors in Kolkata — living rooms, bedrooms, kitchens and dining spaces designed by Avaya Udyog, led by Biswanath Adhikari.";
const OG_IMAGE = `${SITE_URL}/services/s1-residential.webp`;
const PAGE_URL = `${SITE_URL}/residential-interior-designer-kolkata`;

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
  name: "Residential Interior Design",
  description:
    "Warm, modern homes shaped around your lifestyle — thoughtful layouts, curated finishes, and elevated details.",
  url: PAGE_URL,
});

// Room types describe the studio's residential *capability*, which the
// published "Residential Interiors" service copy supports. The images are
// design-direction references, not completed-project photography — every
// image under public/ is self-hosted stock (commit 054f46d), so alt text
// describes the room rather than attributing it to a delivered project.
const ROOMS = [
  {
    title: "Living Rooms",
    text: "Layouts and finishes built for how a family actually gathers, not just how a room photographs.",
    src: "/gallery/g1-1505693416388.webp",
    alt: "Warm modern living room with curated finishes and layered warm lighting",
  },
  {
    title: "Bedrooms",
    text: "Calm, restful spaces in soft neutral tones, plush textures and warm wood finishes.",
    src: "/gallery/g3-1540518614846.webp",
    alt: "Calm bedroom interior with soft neutral tones and inviting natural light",
  },
  {
    title: "Kitchens",
    text: "Modular kitchens with minimalist cabinetry, planned around how you actually cook and host.",
    src: "/gallery/g5-1556911220.webp",
    alt: "Open-plan modular kitchen with a wood island and minimalist cabinetry",
  },
  {
    title: "Dining Spaces",
    text: "Refined dining rooms with statement lighting that anchor the rest of the home around them.",
    src: "/gallery/g8-dining-refined.webp",
    alt: "Refined dining room interior with statement pendant lighting and gold accents",
  },
];

const webPage = webPageSchema({
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  about: `${PAGE_URL}#service`,
});

export default function ResidentialInteriorDesignerKolkataPage() {
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
            { name: "Interior Designer in Kolkata", path: "/interior-designer-kolkata" },
            {
              name: "Residential Interior Designer in Kolkata",
              path: "/residential-interior-designer-kolkata",
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
                src="/services/s1-residential.webp"
                alt="Bright, gallery-walled modern living room — residential interior design"
                loading="eager"
                decoding="async"
                className="h-[24rem] w-full object-cover sm:h-[28rem]"
              />
            </figure>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Residential Interior Designer in Kolkata</span>
              <h1 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
                Homes shaped around{" "}
                <span className="accent text-sage-600">how you live.</span>
              </h1>
              <p className="mt-6 max-w-prose2 text-[1.02rem] leading-[1.85] text-ink-soft">
                Avaya Udyog designs warm, modern homes across Kolkata — thoughtful
                layouts, curated finishes, and elevated details that make every
                day feel special. Every residential project is guided by the
                same three principles that shape our studio&apos;s work
                overall: timeless aesthetics, a personalised approach, and
                uncompromising quality.
              </p>

              <div className="mt-9">
                <PageCTAButton triggerSource="residential_page_cta">
                  Book a Consultation
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
              Every room, <span className="accent text-sage-600">considered.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {ROOMS.map((room) => (
              <div key={room.title} className="card card-hover overflow-hidden">
                <img
                  src={room.src}
                  alt={room.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-[1.2rem] font-semibold text-ink">
                    {room.title}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                    {room.text}
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
            <span className="eyebrow-center">How a Residential Project Runs</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              From first idea to <span className="accent text-sage-600">final styling.</span>
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
                direction that turn rough ideas into a refined, buildable
                vision for your home.
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
                your project feels effortless from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Cross-links ---------- */}
      <section className="section !py-20">
        <div className="shell relative grid gap-6 sm:grid-cols-2">
          <Link
            href="/interior-designer-kolkata"
            className="card card-hover group flex items-center justify-between gap-4 p-6"
          >
            <span className="font-display text-[1.05rem] font-semibold text-ink">
              ← Back to Interior Designer in Kolkata
            </span>
          </Link>
          <Link
            href="/commercial-interior-designer-kolkata"
            className="card card-hover group flex items-center justify-between gap-4 p-6"
          >
            <span className="font-display text-[1.05rem] font-semibold text-ink">
              Need an office or retail space designed?
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
              Have a home in mind?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.94rem] leading-[1.8] text-sage-100/75">
              Share your vision with us and receive a personalised
              consultation from our design team.
            </p>
            <div className="mt-8 flex justify-center">
              <PageCTAButton triggerSource="residential_page_cta" className="bg-white text-sage-900 hover:bg-gold-soft">
                Book a Consultation
              </PageCTAButton>
              <Link href="/process" className="text-[0.78rem] font-bold uppercase tracking-label text-white underline underline-offset-4 hover:text-gold-light">
                Our process
              </Link>
              <Link href="/services/modular-kitchen" className="text-[0.78rem] font-bold uppercase tracking-label text-white underline underline-offset-4 hover:text-gold-light">
                Modular kitchens
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
