import Link from "next/link";
import { ArrowUpRight, PenTool, Home, Sparkles } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { webPageSchema } from "../../../lib/schema";
import PageCTAButton from "../../../components/PageCTAButton";
import StatStrip from "../../../components/StatStrip";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Interior Designer in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Avaya Udyog is a Kolkata interior design studio led by Biswanath Adhikari, delivering residential and commercial interiors for over 35 years. Book a consultation.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/interior-designer-kolkata`;

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

// Same three principles published in components/About.jsx — restated here
// rather than re-imported since that component is a client "use client"
// section built for the homepage's reveal-on-scroll treatment.
const PRINCIPLES = [
  {
    icon: PenTool,
    title: "Timeless Aesthetics",
    text: "We harmonise inherited design wisdom with contemporary innovation, crafting rooms that stay relevant and captivating for generations.",
  },
  {
    icon: Home,
    title: "Personalised Approach",
    text: "Your story shapes our design. We listen deeply and turn your aspirations and lifestyle into spaces that are practical and breathtaking.",
  },
  {
    icon: Sparkles,
    title: "Uncompromising Quality",
    text: "From premium materials to expert craftsmanship, we hold every project to the most rigorous standards of excellence.",
  },
];

const CAPABILITIES = [
  {
    href: "/residential-interior-designer-kolkata",
    title: "Residential Interiors",
    text: "Warm, modern homes shaped around your lifestyle — thoughtful layouts, curated finishes, and elevated details.",
    src: "/services/s1-residential.webp",
    alt: "Bright, gallery-walled modern living room — residential interior design",
    cta: "Explore residential interiors",
  },
  {
    href: "/commercial-interior-designer-kolkata",
    title: "Commercial Spaces",
    text: "Brand-first offices and retail environments designed to impress clients and keep teams inspired, productive, and proud of where they work.",
    src: "/services/s2-commercial.webp",
    alt: "Glass-walled modern office corridor — commercial interior design",
    cta: "Explore commercial interiors",
  },
];

// Design-direction references, NOT completed project photography. Every
// image under public/ is self-hosted stock (see commit 054f46d, "Self-host
// all site photography") — no real Avaya Udyog project photos exist in this
// repository. So these are framed as the aesthetic the studio works in, and
// the alt text describes the room rather than attributing it to a delivered
// project. Swap in real photography and this framing can change.
const DESIGN_DIRECTION = [
  {
    title: "Warm Modern Living Room",
    alt: "Warm modern living room with curated finishes and layered warm lighting",
    src: "/gallery/g1-1505693416388.webp",
    meta: "Residential · Curated finishes",
  },
  {
    title: "Office Workspace",
    alt: "Modern office workspace with natural light and a premium build finish",
    src: "/gallery/g6-1497366754035.webp",
    meta: "Commercial · Natural light",
  },
  {
    title: "Open-Plan Kitchen",
    alt: "Open-plan modular kitchen with a wood island and minimalist cabinetry",
    src: "/gallery/g5-1556911220.webp",
    meta: "Residential · Wood island",
  },
  {
    title: "Retail Showroom",
    alt: "Retail showroom interior with an elegant product display and strong brand presence",
    src: "/gallery/g7-1524758631624.webp",
    meta: "Commercial · Elegant display",
  },
];

const webPage = webPageSchema({
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  about: undefined,
});

export default function InteriorDesignerKolkataPage() {
  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Interior Designer in Kolkata", path: "/interior-designer-kolkata" },
          ]}
        />
      </div>

      {/* ---------- Intro ---------- */}
      <section className="section !pt-10">
        <div className="shell relative">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <figure className="order-2 overflow-hidden rounded-[2rem] bg-sage-100 shadow-lift lg:order-1">
              <img
                src="/hero/exterior.webp"
                alt="Contemporary residential exterior — interior design in Kolkata"
                loading="eager"
                decoding="async"
                className="h-[24rem] w-full object-cover sm:h-[28rem]"
              />
            </figure>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Interior Designer in Kolkata</span>
              <h1 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
                Interior design, <span className="accent text-sage-600">grounded in Kolkata.</span>
              </h1>
              <p className="mt-6 max-w-prose2 text-[1.02rem] leading-[1.85] text-ink-soft">
                Avaya Udyog is a Kolkata interior design studio led by{" "}
                <strong className="font-semibold text-ink">Biswanath Adhikari</strong>,
                shaping residential and commercial spaces with timeless craftsmanship
                and a promise of complete client satisfaction — for over{" "}
                <strong className="font-semibold text-ink">35 years</strong>.
              </p>
              <p className="mt-4 max-w-prose2 text-[1.02rem] leading-[1.85] text-ink-soft">
                Whether you&apos;re furnishing a home or fitting out a workplace, our
                team works across both residential and commercial interiors,
                from first concept through turnkey execution.
              </p>

              <div className="mt-9">
                <PageCTAButton triggerSource="category_page_cta">
                  Book a Consultation
                </PageCTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- What we do ---------- */}
      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">How We Design</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              Every project follows the same{" "}
              <span className="accent text-sage-600">three principles.</span>
            </h2>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line-strong bg-sage-50 text-sage-600">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Residential + Commercial capability ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">Two Disciplines, One Studio</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              Residential <span className="accent text-sage-600">and</span> commercial.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.96rem] leading-[1.85] text-ink-muted">
              Two dedicated pages, each covering the design approach, capability
              and process for that side of the studio.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card card-hover group block overflow-hidden"
              >
                <figure className="overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-64 w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                  />
                </figure>
                <div className="p-7">
                  <h3 className="font-display text-[1.35rem] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[0.94rem] leading-[1.8] text-ink-muted">
                    {item.text}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-label text-sage-700">
                    {item.cta}
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured work ---------- */}
      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">Design Direction</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              The kind of interiors{" "}
              <span className="accent text-sage-600">we design.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.96rem] leading-[1.85] text-ink-muted">
              A sense of the material palette, lighting and detailing our work
              is built around — across both homes and workplaces.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DESIGN_DIRECTION.map((img) => (
              <figure
                key={img.title}
                className="overflow-hidden rounded-[1.5rem] bg-sage-100 shadow-soft"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover"
                />
                <figcaption className="p-4">
                  <span className="block text-[0.56rem] font-bold uppercase tracking-label text-sage-600">
                    {img.meta}
                  </span>
                  <span className="mt-1 block font-display text-[0.98rem] font-semibold text-ink">
                    {img.title}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-10 text-center">
            <Link
              href="/#gallery"
              className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-label text-sage-700 transition-colors hover:text-sage-900"
            >
              Browse the full gallery
              <ArrowUpRight size={14} />
            </Link>
          </p>
          <p className="mt-6 text-center text-[0.62rem] font-semibold uppercase tracking-label text-ink-faint">
            Full walkthroughs, drawings and material boards are shared during
            consultation.
          </p>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <StatStrip />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="relative overflow-hidden rounded-[2rem] bg-sage-900 px-8 py-12 text-center shadow-lift md:px-14">
            <h2 className="display text-[2rem] text-white sm:text-[2.4rem]">
              Ready to start your project?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.94rem] leading-[1.8] text-sage-100/75">
              Share your vision with us and receive a personalised
              consultation from our design team.
            </p>
            <div className="mt-8 flex justify-center">
              <PageCTAButton triggerSource="category_page_cta" className="bg-white text-sage-900 hover:bg-gold-soft">
                Book a Consultation
              </PageCTAButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
