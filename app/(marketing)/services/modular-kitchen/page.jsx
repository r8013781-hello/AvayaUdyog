import Link from "next/link";
import { CookingPot, Ruler, Layers, ShieldCheck } from "lucide-react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { serviceSchema, webPageSchema, faqSchema } from "../../../../lib/schema";
import PageCTAButton from "../../../../components/PageCTAButton";
import SectionLink from "../../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Modular Kitchen Design in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "How a modular kitchen is actually planned, built and fitted — layouts, carcass and shutter materials, hardware and finishes — from a Kolkata studio with 35+ years in interiors.";
const OG_IMAGE = `${SITE_URL}/gallery/renders/kitchen/kitchen-render-01.jpg`;
const PAGE_URL = `${SITE_URL}/services/modular-kitchen`;

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
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

/**
 * Modular kitchens.
 *
 * Evidenced as a real service line, not invented: "Modular kitchen" is one of
 * the project types in the CRM's own project registration form
 * (components/crm/CustomerProjectPipeline.jsx), and the residential page
 * already publishes "Modular kitchens with minimalist cabinetry".
 *
 * Deliberately image-free. Every photograph under public/ is stock, and a
 * kitchen page illustrated with stock kitchens invites exactly the reading —
 * "here is a kitchen we built" — that the site has already been corrected once
 * to avoid.
 *
 * No prices anywhere. This is the page a visitor most wants a number on, and
 * the business has not published one. What IS written is the honest and more
 * useful thing: what actually drives the cost up or down, so a reader can
 * reason about their own budget before speaking to anyone.
 */

const service = serviceSchema({
  name: "Modular Kitchen Design",
  description:
    "Modular kitchen design and installation — layout planning, cabinetry, hardware and finishes.",
  url: PAGE_URL,
});

const webPage = webPageSchema({
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  about: `${PAGE_URL}#service`,
});

const LAYOUTS = [
  {
    name: "Straight / single-wall",
    fit: "Compact flats and open-plan rooms where the kitchen shares a wall with the living space.",
    note: "Everything on one run. Simplest to build and the least forgiving — if the sink, hob and fridge are badly ordered you feel it every day.",
  },
  {
    name: "L-shaped",
    fit: "The most common Kolkata flat kitchen, and usually the right answer.",
    note: "Two adjacent walls give you a natural work triangle and a corner that has to be solved properly — a blind corner without the right pull-out is dead space forever.",
  },
  {
    name: "Parallel / galley",
    fit: "Long, narrow kitchens with a door at each end.",
    note: "Efficient if the run between counters is right. Too narrow and two people cannot pass; too wide and you are walking the length of the kitchen for every task.",
  },
  {
    name: "U-shaped",
    fit: "Larger kitchens where one cook wants everything within reach.",
    note: "Maximum storage and counter run. Needs genuine floor width or it closes in.",
  },
  {
    name: "Island",
    fit: "Open-plan layouts with room to walk fully around a central block.",
    note: "Wonderful when the space genuinely allows it. Forced into a room that is too small, it becomes an obstacle you edge past.",
  },
];

const MATERIALS = [
  {
    part: "Carcass — the box",
    options: "Marine-grade plywood · BWP plywood · HDF-HMR · particle board",
    reality:
      "The part nobody sees and the part that decides how long the kitchen lasts. Kolkata's humidity is unkind to anything under-specified here, and a failed carcass cannot be fixed without dismantling the run. This is the wrong place to save money.",
  },
  {
    part: "Shutters — the doors",
    options: "Laminate · acrylic · membrane · PU · veneer · glass",
    reality:
      "What you look at and touch every day. The trade-off is finish quality against how it ages: high-gloss acrylic looks superb and shows every fingerprint; matte laminate is far more forgiving in a kitchen used hard.",
  },
  {
    part: "Counter",
    options: "Granite · quartz · solid surface",
    reality:
      "Granite is the long-standing default here for good reason. Quartz gives a more consistent surface and more colour choice at higher cost. Match the edge detail to how the kitchen is actually cleaned.",
  },
  {
    part: "Hardware",
    options: "Hinges · drawer channels · lift-ups · corner solutions",
    reality:
      "The single most under-considered decision. Hinges and channels are what you operate thousands of times a year, and cheap ones announce themselves within months. Good hardware in a modest kitchen beats poor hardware in an expensive one.",
  },
];

const COST_DRIVERS = [
  "Total running length of cabinetry — the largest single factor, ahead of finish",
  "Carcass specification, which is invisible and non-negotiable",
  "Shutter finish, where the range between laminate and acrylic or PU is wide",
  "Hardware brand and tier, including soft-close and corner mechanisms",
  "Tall units and loft storage, which add height as well as length",
  "Appliance integration — built-in hobs, hoods, ovens and their cut-outs",
  "Counter material and the amount of edge and cut-out work it needs",
  "Site condition: existing plumbing and electrical points that must move",
];

const FAQS = [
  {
    q: "How long does a modular kitchen take to install?",
    a: "Installation itself is quick relative to the rest of a project — the long part is what comes before it: final measurement, manufacture and delivery. What we can say plainly is that measurement happens only once the civil work, plumbing points and electrical points are final, because a kitchen manufactured against a measurement that later moves cannot be adjusted on site.",
  },
  {
    q: "What does a modular kitchen cost in Kolkata?",
    a: "There is no single rate, and we would rather explain what moves the number than quote one that turns out to be wrong. Cost follows running length first, then carcass specification, then shutters and hardware. A compact straight kitchen in laminate and a long U-shaped kitchen in acrylic with premium hardware are different projects entirely. Costing is discussed during consultation, once there is a real layout to cost.",
  },
  {
    q: "Is modular better than a carpenter-built kitchen?",
    a: "They are different trades rather than better and worse. Modular gives you factory-finished components, predictable hardware and a cleaner fit; a skilled carpenter can work around awkward site conditions that modules cannot. The honest answer depends on your kitchen's shape and how unusual it is.",
  },
  {
    q: "Can you work with my existing plumbing and electrical points?",
    a: "Usually yes, and designing around existing points is often the cheaper route. Where a layout genuinely needs a point moved, we would rather say so at the design stage than discover it during installation.",
  },
  {
    q: "What should I not economise on?",
    a: "The carcass and the hardware. Both are invisible in photographs and both determine whether the kitchen still works properly in five years. Shutters can be re-done later; a failed carcass means dismantling the run.",
  },
];

const faq = faqSchema(FAQS);

export default function ModularKitchenPage() {
  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Modular Kitchen Design", path: "/services/modular-kitchen" },
          ]}
        />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <figure className="order-2 overflow-hidden rounded-[2rem] bg-sage-100 shadow-lift lg:order-1">
              <img
                src="/gallery/renders/kitchen/kitchen-render-01.jpg"
                alt="A minimalist modular kitchen with clean lines and premium finishes"
                loading="eager"
                decoding="async"
                className="h-[24rem] w-full object-cover sm:h-[28rem]"
              />
            </figure>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Modular Kitchens</span>
              <h1 className="display mt-6 text-[2.5rem] leading-[1.06] text-ink sm:text-5xl">
                A kitchen is planned
                <br />
                <span className="accent text-sage-600">around how you cook.</span>
              </h1>
              <p className="mt-7 text-[1.04rem] leading-[1.85] text-ink-soft">
                Most kitchen disappointments are layout decisions, not finish decisions.
                A beautiful kitchen with the sink in the wrong place is a daily irritation;
                a plain one that is properly planned disappears into your routine. This page
                covers how the decisions are actually made — layouts, the materials that
                matter, and what genuinely moves the cost.
              </p>
              <div className="mt-9">
                <PageCTAButton triggerSource="modular_kitchen_cta">Book a Consultation</PageCTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Layouts</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              Five shapes, and <span className="accent text-sage-600">when each works.</span>
            </h2>
            <p className="mt-5 text-[0.98rem] leading-[1.8] text-ink-soft">
              The layout is decided by the room, not by preference. What follows is the
              honest case for and against each. On materials specifically, see{" "}
              <Link href="/insights/materials-for-kolkata-climate" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
                choosing materials that survive Kolkata&apos;s climate
              </Link>.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {LAYOUTS.map(({ name, fit, note }) => (
              <div key={name} className="rounded-[1.25rem] border border-line bg-canvas p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <Ruler size={15} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                  <h3 className="font-display text-[1.2rem] font-semibold text-ink">{name}</h3>
                </div>
                <p className="mt-3 text-[0.93rem] leading-[1.8] text-ink-soft"><strong className="font-semibold text-ink">Suits:</strong> {fit}</p>
                <p className="mt-2 text-[0.93rem] leading-[1.8] text-ink-muted">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Materials</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              What the kitchen is <span className="accent text-sage-600">actually made of.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {MATERIALS.map(({ part, options, reality }) => (
              <div key={part} className="rounded-[1.25rem] border border-line bg-white p-7 shadow-hair">
                <div className="flex items-center gap-3">
                  <Layers size={15} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                  <h3 className="font-display text-[1.16rem] font-semibold text-ink">{part}</h3>
                </div>
                <p className="mt-3 font-mono text-[0.76rem] uppercase tracking-wide text-ink-muted">{options}</p>
                <p className="mt-3.5 text-[0.93rem] leading-[1.8] text-ink-soft">{reality}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sage-900 !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow !text-gold-light">Cost</span>
            <h2 className="display mt-6 text-[2.1rem] text-white sm:text-4xl">
              What moves the number, <span className="accent text-gold-light">in order.</span>
            </h2>
            <p className="mt-5 text-[0.98rem] leading-[1.8] text-white/70">
              We do not publish a rate, because a rate quoted without a layout is a
              number that changes at the first site visit. These are the factors that
              decide it, roughly in order of impact.
            </p>
          </div>

          <ol className="mt-12 grid gap-x-10 gap-y-4 md:grid-cols-2">
            {COST_DRIVERS.map((driver, i) => (
              <li key={driver} className="flex gap-4 border-t border-white/10 pt-4">
                <span className="font-mono text-[0.72rem] font-semibold text-gold-light">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.94rem] leading-[1.75] text-white/80">{driver}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[1.1rem] font-semibold leading-snug text-ink group-hover:text-sage-700">{q}</h3>
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-600 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-2xl pb-7 pr-12 text-[0.94rem] leading-[1.85] text-ink-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-10 md:px-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={17} className="text-gold-deep" aria-hidden="true" />
                <span className="text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">35+ years in Kolkata interiors</span>
              </div>
              <h2 className="mt-4 font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                Bring us the room, not a brief.
              </h2>
              <p className="mt-3 text-[0.97rem] leading-[1.8] text-ink-soft">
                Measurements, layout options and material boards are worked through during
                consultation. A kitchen is easier to discuss in front of the actual space
                than in the abstract.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <PageCTAButton triggerSource="modular_kitchen_footer_cta">Book a Consultation</PageCTAButton>
                <div className="flex flex-wrap items-center gap-4 text-[0.88rem] font-medium text-sage-600">
                  <Link href="/services/residential-interior-design" className="transition-colors hover:text-sage-900">
                    Full-home interiors
                  </Link>
                  <span className="h-1 w-1 rounded-full bg-sage-300" aria-hidden="true" />
                  <SectionLink href="/#how-we-work" className="transition-colors hover:text-sage-900">
                    Our process
                  </SectionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
