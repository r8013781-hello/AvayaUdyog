"use client";

import { MessagesSquare, Ruler, HardHat, Sparkles, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { useContactModal } from "./ContactModalProvider";

/**
 * The four stages of a project, told as a drafting sequence rather than a
 * photo essay.
 *
 * Deliberately image-free. Every photograph under public/ is stock (see
 * commit 054f46d), and a process section illustrated with stock site photos
 * would be claiming to show work that isn't the studio's. Type, rules and
 * numbering carry it instead — which is also how a drawing set reads, so it
 * suits the subject.
 *
 * Every stage description is traceable to copy already published elsewhere on
 * the site (Services.jsx service descriptions, Marquee.jsx capabilities, the
 * founder's promise in AboutCompany.jsx). Nothing about durations, revision
 * counts, deliverable lists or site-visit frequency is asserted, because the
 * repository does not establish any of it. Those are the details to add once
 * the business confirms them.
 *
 * When real project photography exists, each stage has a natural slot for one
 * image without changing this structure.
 */

const STAGES = [
  {
    icon: MessagesSquare,
    tag: "Consultation",
    title: "We start with how you actually live",
    // Source: Services.jsx — "Design Consultation" service description.
    text: "Concept development, material guidance and clear design direction — the conversation that turns rough ideas into a refined, buildable vision for the space.",
  },
  {
    icon: Ruler,
    tag: "Design",
    title: "Layouts, finishes and detail",
    // Source: Services.jsx residential copy + Marquee.jsx capability list
    // ("Material Curation", "Bespoke Furniture").
    text: "Thoughtful layouts, curated finishes and elevated details are developed together — including material curation and any bespoke furniture — so the palette is settled before building begins.",
  },
  {
    icon: HardHat,
    tag: "Execution",
    title: "We manage every detail on site",
    // Source: Services.jsx — "Turnkey Execution" service description.
    text: "Turnkey execution from first sketch onward. We coordinate the work so the project feels effortless from start to finish, rather than becoming something you have to manage.",
  },
  {
    icon: Sparkles,
    tag: "Finishing",
    title: "Final styling, then it's yours",
    // Source: Services.jsx "final styling" + the founder's published promise
    // in AboutCompany.jsx.
    text: "The last layer — styling, detailing and the finish that carries the promise every project is held to: it should feel like home the moment you step in.",
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

        {/* The stage rail. On desktop a single hairline runs behind the numbered
            nodes; on mobile the same line runs vertically down the left edge, so
            the sequence reads identically at any width. */}
        <ol className="relative mt-16 grid gap-10 md:mt-20 md:grid-cols-4 md:gap-7">
          <span
            className="absolute left-[1.35rem] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-gold/50 via-gold/25 to-transparent md:left-0 md:top-[1.35rem] md:h-px md:w-full md:bg-gradient-to-r md:from-gold/50 md:via-gold/30 md:to-transparent"
            aria-hidden="true"
          />

          {STAGES.map(({ icon: Icon, tag, title, text }, index) => (
            <li
              key={tag}
              className="reveal relative grid grid-cols-[auto_1fr] gap-5 md:block"
              data-reveal-delay={`${index * 0.09}s`}
            >
              {/* Numbered node — sits on the rail. */}
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-display text-[0.82rem] font-semibold text-sage-700 shadow-hair">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="md:mt-7">
                <div className="flex items-center gap-2.5">
                  <Icon size={15} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                  <span className="text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">
                    {tag}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-[1.28rem] font-semibold leading-snug text-ink">
                  {title}
                </h3>
                <p className="mt-2.5 text-[0.93rem] leading-[1.8] text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>

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
