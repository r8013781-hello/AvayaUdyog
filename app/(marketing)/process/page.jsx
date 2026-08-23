import Link from "next/link";
import { MessagesSquare, Ruler, HardHat, Sparkles, ArrowUpRight, Info } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { webPageSchema, faqSchema } from "../../../lib/schema";
import PageCTAButton from "../../../components/PageCTAButton";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Our Process | Avaya Udyog Interior Design, Kolkata";
const DESCRIPTION =
  "How an Avaya Udyog project runs — consultation, design, execution and finishing, with one team from the first conversation to handover.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/process`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", siteName: "Avaya Udyog", title: TITLE, description: DESCRIPTION, url: PAGE_URL, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const webPage = webPageSchema({ url: PAGE_URL, name: TITLE, description: DESCRIPTION });

/**
 * Process.
 *
 * The four stages match components/HowWeWork.jsx exactly, so the homepage
 * section and this page can never describe different processes. The added
 * depth here is about WHAT KIND of decision each stage makes and why the order
 * matters — reasoning that is true of the studio's stated way of working.
 *
 * Deliberately absent, and the reason this page is not longer: stage
 * durations, revision counts, deliverable lists, site-visit frequency, payment
 * schedules and sign-off gates. Every one of those is a specific commitment
 * the business has not published, and they are exactly what a client would
 * hold the studio to. The page says so openly rather than filling the gap.
 */

const STAGES = [
  {
    icon: MessagesSquare,
    tag: "Consultation",
    title: "We start with how you actually live",
    text: "Concept development, material guidance and clear design direction — the conversation that turns rough ideas into a refined, buildable vision for the space.",
    detail:
      "The useful part of a first conversation is rarely the style discussion. It is finding out how the space gets used: who cooks, where people actually sit, what storage is permanently overflowing, what about the current home irritates you daily. Those answers constrain the design far more than a preference for one look over another.",
  },
  {
    icon: Ruler,
    tag: "Design",
    title: "Layouts, finishes and detail",
    text: "Thoughtful layouts, curated finishes and elevated details are developed together — including material curation and any bespoke furniture — so the palette is settled before building begins.",
    detail:
      "Layout and material are decided together rather than in sequence, because each limits the other. This is also the stage where the expensive decisions are cheap to change: moving a wall on a drawing costs nothing, and moving it on site costs a great deal.",
  },
  {
    icon: HardHat,
    tag: "Execution",
    title: "We manage every detail on site",
    text: "Turnkey execution from first sketch onward. We coordinate the work so the project feels effortless from start to finish, rather than becoming something you have to manage.",
    detail:
      "Most of what goes wrong in interiors is sequencing rather than craftsmanship — work done in an order that has to be undone. Because the studio executes what it designs, a problem found behind a wall is a design decision and a site decision made at the same moment, by the same people.",
  },
  {
    icon: Sparkles,
    tag: "Finishing",
    title: "Final styling, then it's yours",
    text: "The last layer — styling, detailing and the finish that carries the promise every project is held to: it should feel like home the moment you step in.",
    detail:
      "The final stage is the one clients remember, and it is almost entirely detail work: alignment, edges, how switches and handles sit, whether light falls where it was meant to. None of it is structural and all of it is what makes a finished room feel resolved rather than merely complete.",
  },
];

const FAQS = [
  {
    q: "Who do I deal with during the project?",
    a: "The same team throughout. Because the studio both designs and executes, the project is not handed to a separate contractor partway through — which is the point at which responsibility most often becomes unclear on interiors work.",
  },
  {
    q: "What is shared during consultation?",
    a: "Full walkthroughs, drawings and material boards are shared during consultation, so decisions are made against something you can actually see rather than a description.",
  },
  {
    q: "How long does each stage take?",
    a: "We have not published stage durations, and we would rather say that plainly than give you a number that is not grounded in your specific project. Scope, site condition and how quickly material decisions are settled all move the schedule substantially. Ask during consultation, where it can be answered against a real space.",
  },
  {
    q: "Can I make changes once the design is agreed?",
    a: "Changes are normal, and the stage they arrive at decides what they cost. A layout change during design is inexpensive; the same change during execution means undoing work already done. This is why the design stage is worth taking slowly.",
  },
  {
    q: "Do you work on both homes and commercial spaces?",
    a: "Both. Residential covers full-home interiors for flats and houses; commercial covers offices and retail environments. The four stages are the same, but commercial projects are usually phased around a business that has to keep operating.",
  },
];
const faq = faqSchema(FAQS);

export default function ProcessPage() {
  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Our Process", path: "/process" }]} />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="max-w-3xl">
            <span className="eyebrow">How We Work</span>
            <h1 className="display mt-6 text-[2.5rem] leading-[1.06] text-ink sm:text-5xl">
              From first conversation
              <br />
              <span className="accent text-sage-600">to final handover.</span>
            </h1>
            <p className="mt-7 text-[1.04rem] leading-[1.85] text-ink-soft">
              Four stages, one team throughout. You deal with the same people from the
              first sketch to the day the space is handed over — nothing is passed to a
              separate contractor midway. What follows is what each stage is actually
              for, and why the order matters more than the speed. If you are preparing
              for a first meeting, read{" "}
              <Link href="/insights/what-happens-in-a-design-consultation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
                what actually happens in a consultation
              </Link>.
            </p>
            <div className="mt-9">
              <PageCTAButton triggerSource="process_page_cta">Book a Consultation</PageCTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <ol className="space-y-4">
            {STAGES.map(({ icon: Icon, tag, title, text, detail }, index) => (
              <li key={tag} className="grid grid-cols-[auto_1fr] gap-5 rounded-[1.5rem] border border-line bg-canvas p-7 md:gap-8 md:p-9">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-white font-display text-[0.9rem] font-semibold text-sage-700 shadow-hair">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                    <span className="text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">{tag}</span>
                  </div>
                  <h2 className="mt-3 font-display text-[1.42rem] font-semibold leading-snug text-ink sm:text-[1.6rem]">{title}</h2>
                  <p className="mt-3 text-[0.97rem] leading-[1.85] text-ink-soft">{text}</p>
                  <p className="mt-3.5 text-[0.94rem] leading-[1.85] text-ink-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex gap-4 rounded-[1.25rem] border border-line bg-white p-6 shadow-hair">
            <Info size={17} className="mt-0.5 shrink-0 text-sage-600" aria-hidden="true" />
            <p className="text-[0.92rem] leading-[1.8] text-ink-muted">
              <strong className="font-semibold text-ink">What this page does not claim.</strong>{" "}
              We have not published stage durations, revision counts or a fixed
              deliverable list, because those depend on the project and we would rather
              not commit you to numbers that were not written for your space. They are
              answered during consultation, against the actual site.
            </p>
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-[2.4rem]">
                About working <span className="accent text-sage-600">together.</span>
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
              <h2 className="font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                Start at stage one.
              </h2>
              <p className="mt-3 text-[0.97rem] leading-[1.8] text-ink-soft">
                Most projects begin as a conversation rather than a brief. Tell us about
                the space and we will tell you plainly what it needs.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <PageCTAButton triggerSource="process_page_footer_cta">Book a Consultation</PageCTAButton>
                <Link href="/services" className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900">
                  See what we do
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
