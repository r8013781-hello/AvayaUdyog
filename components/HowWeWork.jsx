"use client";

import { MessagesSquare, Ruler, HardHat, Sparkles, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { useContactModal } from "./ContactModalProvider";

/**
 * The four stages of a project, illustrated with one image per stage in an
 * alternating editorial layout.
 *
 * (This section was image-free at one point in this project's history — see
 * older commits — on the reasoning that a process section illustrated with
 * stock photos would claim work that isn't the studio's. That reasoning still
 * matters, but the constraint it led to has since been superseded: two of the
 * four images below (tv-panel-veneer-fitting, feature-wall-craftsmen-at-work)
 * are real Avaya Udyog site-work photography, not stock. The other two are
 * renders, used because no real photography exists yet for those specific
 * stages. None of the four is presented as documentation of one specific,
 * continuous project — the copy for every stage (tag/title/text below) stays
 * general-process language, never "this project" or a named site, precisely
 * so that pairing a real photo with a render two stages later cannot be read
 * as claiming they're from the same job.)
 *
 * Every stage description is traceable to copy already published elsewhere on
 * the site (Services.jsx service descriptions, Marquee.jsx capabilities, the
 * founder's promise in AboutCompany.jsx). Nothing about durations, revision
 * counts, deliverable lists or site-visit frequency is asserted, because the
 * repository does not establish any of it. Those are the details to add once
 * the business confirms them.
 */

const STAGES = [
  {
    icon: MessagesSquare,
    tag: "Consultation",
    title: "We start with how you actually live",
    text: "Concept development, material guidance and clear design direction — the conversation that turns rough ideas into a refined, buildable vision for the space.",
    src: "/gallery/renders/living-room/living-room-render-01.jpg",
    alt: "A refined 3D render representing the vision agreed upon during consultation",
  },
  {
    icon: Ruler,
    tag: "Design",
    title: "Finishes, furnishings, and decorative detail",
    text: "Curated finishes, styling selections, and elevated decorative details are developed together — including material curation and any bespoke furniture — so the palette is settled before building begins.",
    src: "/gallery/site-work/tv-panel-veneer-fitting.jpg",
    alt: "Raw finishes and details coming together on a wall panel",
  },
  {
    icon: HardHat,
    tag: "Execution",
    title: "We manage every detail on site",
    text: "Turnkey execution from first sketch onward. We coordinate the work so the project feels effortless from start to finish, rather than becoming something you have to manage.",
    src: "/gallery/site-work/feature-wall-craftsmen-at-work.jpg",
    alt: "Craftsmen actively installing a feature mandala panel on site",
  },
  {
    icon: Sparkles,
    tag: "Finishing",
    title: "Final decoration, styling, and handover",
    text: "The last layer — bespoke furnishings, beautiful decoration, and the styling that carries the promise every project is held to: it should feel like home the moment you step in.",
    src: "/gallery/renders/bedroom/bedroom-render-01.jpg",
    alt: "A fully designed and immaculately styled primary bedroom",
  },
];

export default function HowWeWork() {
  const ref = useReveal();
  const openContactModal = useContactModal();

  return (
    <section id="how-we-work" className="section bg-sage-50/50">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-paper absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_70%)]" />
        <div className="absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-gold/[0.06] blur-[130px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal max-w-2xl">
          <span className="eyebrow">How We Work</span>
          <h2 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
            From first conversation
            <br />
            <span className="accent text-sage-600">to final handover.</span>
          </h2>
          <p className="mt-6 text-[1.02rem] leading-[1.85] text-ink-soft">
            Four stages, one team throughout. You deal with the same people from the
            first sketch to the day the space is handed over — nothing is passed to a
            separate contractor midway.
          </p>
        </div>

        {/* Editorial, alternating staggered layout for maximum image impact */}
        <div className="mt-20 space-y-20 md:mt-28 md:space-y-32">
          {STAGES.map(({ icon: Icon, tag, title, text, src, alt }, index) => {
            const isEven = index % 2 === 1;
            return (
              <div
                key={tag}
                className="reveal flex flex-col gap-10 md:flex-row md:items-center md:gap-16 lg:gap-24"
              >
                <figure
                  className={`w-full overflow-hidden rounded-[2rem] bg-sage-100 shadow-lift md:w-1/2 ${
                    isEven ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover sm:aspect-[4/3] md:aspect-[5/4] transition-transform duration-700 hover:scale-105"
                  />
                </figure>

                <div
                  className={`w-full md:w-1/2 ${
                    isEven ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-display text-[0.85rem] font-semibold text-sage-700 shadow-hair">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                      <span className="text-[0.65rem] font-bold uppercase tracking-label text-gold-deep">
                        {tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-6 font-display text-[1.8rem] font-semibold leading-tight text-ink sm:text-[2.2rem]">
                    {title}
                  </h3>
                  <p className="mt-5 max-w-lg text-[1.05rem] leading-[1.8] text-ink-muted">
                    {text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing band — restates the one genuinely verifiable differentiator
            (single team, end to end) and routes to the consultation. */}
        <div
          className="reveal mt-16 flex flex-col gap-6 rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-8 md:mt-20 md:flex-row md:items-center md:justify-between md:px-10"
          data-reveal-delay="0.4s"
        >
          <div>
            <h3 className="font-display text-[1.35rem] font-semibold text-ink sm:text-[1.5rem]">
              Not sure which stage you&apos;re at?
            </h3>
            <p className="mt-2 max-w-lg text-[0.93rem] leading-[1.8] text-ink-soft">
              Most projects start with a conversation, not a drawing. Full walkthroughs,
              drawings and material boards are shared during consultation.
            </p>
          </div>

          <button
            onClick={() => openContactModal("how_we_work_cta")}
            className="btn-primary group shrink-0"
          >
            Book a Consultation
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
