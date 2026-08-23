import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  ClipboardCheck,
  Layers,
  PackageSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import PageCTAButton from "../../../../components/PageCTAButton";
import StatStrip from "../../../../components/StatStrip";
import { serviceSchema, webPageSchema } from "../../../../lib/schema";
import { imageSize } from "../../../../lib/imageDimensions";
import SectionLink from "../../../../components/SectionLink";

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


/**
 * The four constraints that separate a workplace fit-out from a home.
 *
 * All four are general commercial-interiors practice, not claims about
 * completed projects — this page still has no project evidence behind it (every
 * photograph in the repository is stock), so it earns attention by being useful
 * about the decision rather than by asserting a portfolio.
 */
const COMMERCIAL_CONSTRAINTS = [
  {
    icon: CalendarClock,
    title: "A date that costs money",
    text: "A home can slip a fortnight. A workplace opening late means rent on two spaces, a team without desks, or a shop not trading. The programme is therefore designed backwards from the date, and the decisions that sit on the critical path get made first — even when they are the least interesting ones.",
  },
  {
    icon: Building2,
    title: "A landlord and a lease",
    text: "Fit-out guidelines, permitted working hours, service-lift booking, core-and-shell conditions and reinstatement obligations at the end of the term. These are usually discoverable in a week and expensive to discover in month three, so they are checked before layouts are fixed rather than after.",
  },
  {
    icon: Users,
    title: "More than one decision-maker",
    text: "Someone owns the budget, someone owns the brand, someone owns IT, and someone will be responsible for the space once it opens. Sign-off is quicker when it is clear from the start who approves what — and slower, always, when that is discovered at the drawing stage.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance and building services",
    text: "Fire detection and egress, sprinkler and smoke-detector layouts, HVAC distribution, power density and structured cabling all interact with the ceiling and the partition plan. Coordinating them early is cheaper than moving a partition later, and it is the most common reason a fit-out has to be reworked.",
  },
];

/** The delivery sequence, and what the client actually holds at each stage. */
const WORKFLOW = [
  {
    step: "01",
    title: "Brief and feasibility",
    text: "Headcount and how the team actually works, the operating constraints, the lease conditions, and what the space physically allows. This is also where the phasing decision below gets made, because it changes everything downstream.",
    output: "An agreed brief, a test-fit showing what the space can hold, and a realistic programme.",
  },
  {
    step: "02",
    title: "Design and specification",
    text: "Layout, materials, lighting, joinery and finishes, developed against the brand rather than against a catalogue. Specification is written to a standard, not to a look, so that what is priced is what gets built.",
    output: "Drawings, material boards and a written specification detailed enough to quote and to build from.",
  },
  {
    step: "03",
    title: "Services coordination and approvals",
    text: "Electrical, data, HVAC, fire and plumbing resolved against the ceiling and partition plan, then whatever the landlord and the building require before work can start.",
    output: "Coordinated drawings and the approvals in hand, before the first day on site.",
  },
  {
    step: "04",
    title: "Procurement and long-lead items",
    text: "Ordering sequenced against the programme rather than against the build, so the items with the longest lead times are placed first and never become the reason a date moves.",
    output: "A procurement schedule tied to the programme, with the long-lead items already committed.",
  },
  {
    step: "05",
    title: "Execution on site",
    text: "Trades sequenced in the right order and supervised daily, under whichever phasing arrangement was agreed. Progress and any variation are reported as they happen, not at the end.",
    output: "A single point of responsibility for the site, and no gap where a contractor takes over midway.",
  },
  {
    step: "06",
    title: "Snagging and handover",
    text: "Systems tested, defects listed and closed, and the space handed over with what the people who maintain it will need a year from now.",
    output: "A signed-off snag list, tested services, and the handover pack described below.",
  },
];

/**
 * The three phasing options. Presented as trade-offs rather than
 * recommendations — which one is right depends on the business's own numbers,
 * which we do not have and should not pretend to.
 */
const PHASING = [
  {
    title: "Vacant possession",
    text: "The fastest and usually the cheapest per unit of work: trades overlap freely, noise and dust are irrelevant, and there is no daily make-safe. It requires somewhere else for the team to be, so the real cost sits outside the fit-out budget — in temporary space, or in downtime.",
  },
  {
    title: "Phased, zone by zone",
    text: "The business keeps operating while the work moves through the space in sections. It extends the programme, because each zone needs its own sealing, protection and make-good, and some trades get mobilised more than once. Usually the right answer when relocating is not practical.",
  },
  {
    title: "Out of hours",
    text: "Evenings, weekends, or whatever window the building permits. Least disruptive to trading and the most expensive per hour, with a longer programme because each shift loses time to setting up and clearing down. Frequently the only option in a retail unit that cannot close.",
  },
];

/** What actually decides whether the date holds. */
const DELIVERY = [
  {
    icon: Layers,
    title: "Coordination",
    text: "One studio holding design and execution together, so nothing is handed to a separate contractor midway and re-interpreted.",
    points: [
      "Services coordinated against the ceiling plan before site starts",
      "One point of contact, not a designer and a contractor blaming each other",
      "Daily site supervision rather than periodic visits",
      "Variations recorded and priced as they arise",
    ],
  },
  {
    icon: PackageSearch,
    title: "Procurement",
    text: "Ordering driven by lead time rather than by build sequence — the discipline that keeps a programme from being decided by whichever item arrives last.",
    points: [
      "Long-lead items identified at specification, not at ordering",
      "Named specification per item, so substitutions are a decision and not a surprise",
      "Delivery dates tied to the programme and tracked against it",
      "Client-supplied items scheduled with the same rigour as ours",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Handover",
    text: "Agreeing what “finished” means at the start, so the end of the project is a checklist rather than an argument.",
    points: [
      "Joint snag walk, with a written list and closing dates",
      "Services tested and demonstrated, not merely installed",
      "Warranties and product documentation collected in one pack",
      "Care and maintenance guidance for the finishes actually used",
    ],
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
                {...imageSize("/services/s2-commercial.webp")}
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
                  {...imageSize(space.src)}
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

      {/* ---------- What makes a commercial fit-out different ---------- */}
      <section className="section !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Before You Brief Anyone</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              A workplace fit-out is not{" "}
              <span className="accent text-sage-600">a large home.</span>
            </h2>
            <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
              The design vocabulary overlaps; almost nothing else does. A home has one
              decision-maker and no deadline that costs money. A workplace has a lease,
              a landlord, a finance approval, a team that has to keep working throughout,
              and a date by which it must open. Those four constraints shape the project
              far more than any material choice, so they are worth settling before a
              layout is drawn.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {COMMERCIAL_CONSTRAINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line-strong bg-sage-50 text-sage-600">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Workflow ---------- */}
      <section className="section bg-sage-50/50 !py-20" id="workflow">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">How a Commercial Project Runs</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              From brief to <span className="accent text-sage-600">final fit-out.</span>
            </h2>
            <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
              The same two services a residential project uses — design consultation and
              turnkey execution — but sequenced around an operating business. What
              changes is the order things have to be decided in, and how much of it has
              to be locked before anyone starts building.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2">
            {WORKFLOW.map(({ step, title, text, output }) => (
              <li key={step} className="flex flex-col rounded-[1.5rem] border border-line bg-white p-7 shadow-hair">
                <span className="flex h-9 w-fit items-center rounded-full border border-line-strong px-3.5 font-display text-[0.8rem] font-semibold text-sage-700">
                  {step}
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
                <p className="mt-4 border-t border-line pt-4 text-[0.82rem] leading-[1.7] text-ink-soft">
                  <span className="font-semibold text-sage-700">You end up with:</span>{" "}
                  {output}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Phasing ---------- */}
      <section className="section !py-20" id="phasing">
        <div className="shell relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <span className="eyebrow">Phasing</span>
              <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-[2.5rem]">
                Working around <span className="accent text-sage-600">a live business.</span>
              </h2>
              <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
                Almost every commercial project has to answer one question before
                anything else: does the business stop, move, or keep running through the
                work? The answer changes the programme, the cost and the sequence — and
                it is a commercial decision, not a design one, so it belongs to you.
                What we do is set out honestly what each option costs in time and
                disruption.
              </p>
            </div>

            <ul className="space-y-4">
              {PHASING.map(({ title, text }) => (
                <li key={title} className="rounded-[1.25rem] border border-line bg-canvas p-6">
                  <h3 className="font-display text-[1.1rem] font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Coordination, procurement, handover ---------- */}
      <section className="section bg-sage-50/50 !py-20" id="delivery">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Delivery</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              The three things that decide{" "}
              <span className="accent text-sage-600">whether a date holds.</span>
            </h2>
            <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
              Commercial fit-outs rarely slip because of design. They slip because a
              consultant was appointed late, a long-lead item was ordered late, or
              nobody agreed in advance what &ldquo;finished&rdquo; meant. These are the three we
              manage most closely, and the three worth interrogating in anyone&apos;s
              proposal.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {DELIVERY.map(({ icon: Icon, title, text, points }) => (
              <div key={title} className="flex flex-col rounded-[1.5rem] border border-line bg-white p-7 shadow-hair">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line-strong bg-sage-50 text-sage-600">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
                <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-[0.87rem] leading-[1.7] text-ink-soft">
                      <Check size={14} strokeWidth={2.2} className="mt-1 shrink-0 text-sage-600" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
              <SectionLink href="/#how-we-work" className="text-[0.78rem] font-bold uppercase tracking-label text-white underline underline-offset-4 hover:text-gold-light">
                Our process
              </SectionLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
