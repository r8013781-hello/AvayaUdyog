import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import PageCTAButton from "../../../../components/PageCTAButton";
import StatStrip from "../../../../components/StatStrip";
import { serviceSchema, webPageSchema, faqSchema } from "../../../../lib/schema";
import { imageSize } from "../../../../lib/imageDimensions";
import SectionLink from "../../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Residential Design & Decoration in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Warm, personalised home interiors in Kolkata — living rooms, bedrooms, kitchens and dining spaces designed by Avaya Udyog, led by Biswanath Adhikari.";
const OG_IMAGE = `${SITE_URL}/gallery/renders/living-room/living-room-render-01.jpg`;
const PAGE_URL = `${SITE_URL}/services/residential-interior-design`;

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
  name: "Residential Design & Decoration",
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
    src: "/gallery/renders/living-room/living-room-render-03.jpg",
    alt: "Warm modern living room with curated finishes and layered warm lighting",
  },
  {
    title: "Bedrooms",
    text: "Calm, restful spaces in soft neutral tones, plush textures and warm wood finishes.",
    src: "/gallery/renders/bedroom/bedroom-render-01.jpg",
    alt: "Calm bedroom interior with soft neutral tones and inviting natural light",
  },
  {
    title: "Kitchens",
    text: "Modular kitchens with minimalist cabinetry, planned around how you actually cook and host.",
    src: "/gallery/renders/kitchen/kitchen-render-01.jpg",
    alt: "Open-plan modular kitchen with a wood island and minimalist cabinetry",
  },
  {
    title: "Dining Spaces",
    text: "Refined dining rooms with statement lighting that anchor the rest of the home around them.",
    src: "/gallery/renders/dining-room/dining-room-render-01.jpg",
    alt: "Refined dining room interior with statement pendant lighting and gold accents",
  },
];

// The four phases of the studio's own published offer catalog
// (lib/schema.js — Design Consultation, then Turnkey Execution, ending in
// styling), broken out into what actually happens at each stage. Nothing
// here fixes a timeline or a price; both genuinely depend on the flat.
const PHASES = [
  {
    step: "01",
    title: "Design Consultation",
    text: "We walk the space with you, understand how you actually use each room, and talk through layout options, material direction and budget expectations before anything is drawn.",
  },
  {
    step: "02",
    title: "Concept & Material Selection",
    text: "Layouts, finishes and furniture direction are worked through room by room until the whole home reads as one considered scheme rather than a set of unrelated rooms.",
  },
  {
    step: "03",
    title: "Turnkey Execution",
    text: "Civil work, electrical and plumbing coordination, carpentry, painting and fitting are managed on your behalf, so you are dealing with one point of contact rather than a list of separate contractors.",
  },
  {
    step: "04",
    title: "Final Styling & Handover",
    text: "Soft furnishings, art, lighting layers and the small details that make a finished room feel considered rather than merely complete.",
  },
];

// What "residential interior design" includes and what it doesn't — the
// single most common source of confusion at enquiry stage, and answerable
// honestly without inventing a price list or a guarantee.
const SCOPE = [
  {
    title: "One room, or the whole home",
    text: "A full home is designed as one scheme so rooms relate to each other, but a single room — a living room refresh, one bedroom — is just as much a real project. The process is the same; only the scale changes.",
  },
  {
    title: "Design and execution, under one roof",
    text: "We do not hand you a mood board and leave you to find contractors. Design decisions and the people who build them are managed together, so nothing gets lost in translation between the drawing and the site.",
  },
  {
    title: "Structural and civil work, when the layout needs it",
    text: "Where a layout genuinely requires breaking or moving a wall, re-routing plumbing, or upgrading an electrical point, that work is coordinated as part of the project rather than left for you to arrange separately.",
  },
  {
    title: "Your existing furniture, where it earns its place",
    text: "A full re-fit is not the only starting point. Pieces worth keeping are worked into the new layout rather than replaced by default — replacing everything is a choice, not a requirement.",
  },
];

const FAQS = [
  {
    q: "Do I have to redesign the whole flat, or can I start with one room?",
    a: "Either. A full-home scheme reads better because every room relates to the next, but a single room is a complete project in its own right, priced and scheduled on its own terms.",
  },
  {
    q: "Do you handle civil work like breaking a wall or moving plumbing, or only decor?",
    a: "Where the layout genuinely calls for it, yes — civil and MEP work is coordinated as part of the project rather than something you arrange separately with a different contractor.",
  },
  {
    q: "Can I keep and reuse furniture I already own?",
    a: "Yes. Pieces worth keeping are worked into the new layout. A full replacement is one option among several, not the default.",
  },
  {
    q: "Can I keep living at home while the work is happening?",
    a: "It depends on scope and sequencing more than on the size of the home — a single room can often be done while you stay put; a full re-fit usually cannot. This is covered in more detail in our note on living at home during a renovation.",
  },
  {
    q: "What actually happens at the first consultation?",
    a: "We look at how you use each space, talk through layout and material direction, and set realistic expectations on budget — before any design work starts. The full walkthrough is in what actually happens in a design consultation.",
  },
];

const faq = faqSchema(FAQS);

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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            {
              name: "Residential Design & Decoration",
              path: "/services/residential-interior-design",
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
                src="/gallery/renders/living-room/living-room-render-01.jpg"
                {...imageSize("/gallery/renders/living-room/living-room-render-01.jpg")}
                alt="Bright, gallery-walled modern living room — residential interior design"
                loading="eager"
                decoding="async"
                className="h-[24rem] w-full object-cover sm:h-[28rem]"
              />
            </figure>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Residential Design & Decoration in Kolkata</span>
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
                  {...imageSize(room.src)}
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

      {/* ---------- Scope ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Scope</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              What&apos;s included, <span className="accent text-sage-600">plainly.</span>
            </h2>
            <p className="mt-5 text-[0.98rem] leading-[1.8] text-ink-soft">
              The most common question at enquiry stage isn&apos;t about style — it&apos;s
              about scope. Here&apos;s the honest answer.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {SCOPE.map(({ title, text }) => (
              <div key={title} className="rounded-[1.25rem] border border-line bg-white p-7 shadow-hair">
                <h3 className="font-display text-[1.1rem] font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-[0.93rem] leading-[1.8] text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="text-center">
            <span className="eyebrow-center">How a Residential Project Runs</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              From first idea to <span className="accent text-sage-600">final styling.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {PHASES.map(({ step, title, text }) => (
              <div key={step} className="card p-7">
                <span className="flex h-9 items-center rounded-full border border-line-strong px-3.5 font-display text-[0.8rem] font-semibold text-sage-700">
                  {step}
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-[2.4rem]">
                Before you <span className="accent text-sage-600">start.</span>
              </h2>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {FAQS.map(({ q, a }, i) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[1.1rem] font-semibold leading-snug text-ink group-hover:text-sage-700">{q}</h3>
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-600 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-2xl pb-7 pr-12 text-[0.94rem] leading-[1.85] text-ink-muted">
                    {i === 3 ? (
                      <>
                        It depends on scope and sequencing more than on the size of the
                        home — a single room can often be done while you stay put; a
                        full re-fit usually cannot. This is covered in more detail in{" "}
                        <Link href="/insights/living-at-home-during-renovation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
                          our note on living at home during a renovation
                        </Link>.
                      </>
                    ) : i === 4 ? (
                      <>
                        We look at how you use each space, talk through layout and
                        material direction, and set realistic expectations on budget —
                        before any design work starts. The full walkthrough is in{" "}
                        <Link href="/insights/what-happens-in-a-design-consultation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
                          what actually happens in a design consultation
                        </Link>.
                      </>
                    ) : (
                      a
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Cross-links ---------- */}
      <section className="section !py-20">
        <div className="shell relative grid gap-6 sm:grid-cols-2">
          <SectionLink
            href="/#services"
            className="card card-hover group flex items-center justify-between gap-4 p-6"
          >
            <span className="font-display text-[1.05rem] font-semibold text-ink">
              ← All interior design services
            </span>
          </SectionLink>
          <Link
            href="/services/commercial-interior-design"
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
            <div className="mt-8 flex flex-col items-center gap-6">
              <PageCTAButton triggerSource="residential_page_cta" className="bg-white text-sage-900 hover:bg-gold-soft">
                Book a Consultation
              </PageCTAButton>
              <div className="flex flex-wrap items-center justify-center gap-5 text-[0.9rem] font-medium text-sage-200/90">
                <SectionLink href="/#how-we-work" className="transition-colors hover:text-white">
                  Our process
                </SectionLink>
                <span className="h-1 w-1 rounded-full bg-sage-200/40" aria-hidden="true" />
                <Link href="/services/modular-kitchen" className="transition-colors hover:text-white">
                  Modular kitchens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
