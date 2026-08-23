import Link from "next/link";
import { ArrowUpRight, CookingPot, Hammer } from "lucide-react";

/**
 * The rest of the service range, plus routing by situation — merged onto the
 * homepage from the standalone /services hub, which no longer exists.
 *
 * Two things came across, and only two, because the homepage already carries
 * the hub's main job:
 *
 *   1. The two services the editorial Services section above does not show.
 *      That section covers Residential, Commercial, Design Consultation and
 *      Turnkey Execution with photography. Modular Kitchens and Renovation
 *      have their own pages and had no route in from the homepage at all —
 *      without these two cards, merging the hub away would have orphaned them.
 *
 *   2. The decision-routing list. This was the most useful thing on the hub
 *      and it is not duplicated anywhere: it maps what a visitor actually
 *      arrives thinking ("only the kitchen is the problem") onto what the
 *      studio calls it. A capability list makes people guess; this does not.
 *
 * The hub's six-card grid and its three PRINCIPLES were NOT merged. The grid
 * restated services already shown editorially above, and the principles were a
 * near-duplicate of the /about ones now in Principles.jsx. Carrying both across
 * would have made the homepage longer without telling anyone anything new,
 * which is the opposite of the point of merging.
 */
const MORE_SERVICES = [
  {
    icon: CookingPot,
    title: "Modular Kitchens",
    href: "/services/modular-kitchen",
    text: "Kitchens planned around how you actually cook and host, then built with cabinetry and hardware chosen to survive that use for years.",
    scope: ["Layout planning", "Cabinetry", "Hardware", "Finishes"],
  },
  {
    icon: Hammer,
    title: "Renovation",
    href: "/services/home-renovation",
    text: "Reworking a space you already live in — a different problem from fitting out an empty flat, and one that has to be sequenced around your life.",
    scope: ["Full-home", "Room-level", "Sequencing"],
  },
];

/**
 * Routing by situation rather than by service name.
 *
 * Every destination is a page or a section that exists. The first four go to
 * the four service pages that remain standalone; the next two are sections of
 * this same homepage; the last is the cost article's worksheet.
 */
const DECISION_PATHS = [
  {
    situation: "We have just been handed an empty flat.",
    answer:
      "A full residential fit-out: layout, joinery, finishes and services from a bare shell. This is the most straightforward case to plan, because nothing has to be worked around and every decision is still open.",
    href: "/services/residential-interior-design",
    linkLabel: "Residential interiors",
  },
  {
    situation: "We are living here and something has to change.",
    answer:
      "Renovation. A different discipline from fitting out an empty flat — the work has to be sequenced around the household, sealed off, and often paused, and that sequencing decides both cost and how bearable it is.",
    href: "/services/home-renovation",
    linkLabel: "Renovation",
  },
  {
    situation: "Only the kitchen is the problem.",
    answer:
      "A modular kitchen on its own is a legitimate standalone project, and usually the single largest concentrated cost in a home. Worth doing properly even if the rest of the house waits.",
    href: "/services/modular-kitchen",
    linkLabel: "Modular kitchens",
  },
  {
    situation: "We are moving into or reworking a workplace.",
    answer:
      "Commercial. The design overlaps with residential; the constraints do not — a lease, a landlord, building services, multiple approvers and a date that costs money if it slips.",
    href: "/services/commercial-interior-design",
    linkLabel: "Commercial interiors",
  },
  {
    situation: "We have ideas but no plan, and we are not ready to build.",
    answer:
      "Design consultation. Concept, material direction and a buildable plan, without committing to execution in the same breath. It is also the right starting point when two people want different things and the brief has to be settled first.",
    href: "/#design-consultation",
    linkLabel: "Design consultation",
  },
  {
    situation: "We do not want to coordinate contractors ourselves.",
    answer:
      "Turnkey execution. One studio holds design and build together, so nothing is handed off midway and re-interpreted — which is where most of the cost and most of the delay in an interiors project actually comes from.",
    href: "/#turnkey-execution",
    linkLabel: "Turnkey execution",
  },
  {
    situation: "We are trying to compare quotations we already have.",
    answer:
      "Nothing to buy here yet — the cost article sets out what each line in a quotation means, why two honest quotes for the same flat differ, and an eight-question worksheet for making them comparable.",
    href: "/insights/interior-design-cost-kolkata#normalising-quotes",
    linkLabel: "Comparing quotations",
  },
];

export default function ServicesMore() {
  return (
    <section id="which-service" className="section scroll-mt-24 bg-sage-50/50 !py-20 md:scroll-mt-28">
      <div className="shell relative">
        <div className="max-w-2xl">
          <span className="eyebrow">Also In Scope</span>
          <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
            Two more ways a project{" "}
            <span className="accent text-sage-600">takes shape.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {MORE_SERVICES.map(({ icon: Icon, title, href, text, scope }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-[1.5rem] border border-line bg-canvas p-7 transition-colors hover:border-sage-300 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <Icon size={17} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                <h3 className="font-display text-[1.3rem] font-semibold text-ink">{title}</h3>
              </div>
              <p className="mt-3.5 text-[0.94rem] leading-[1.8] text-ink-muted">{text}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {scope.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line-strong px-3 py-1 text-[0.68rem] font-semibold text-ink-soft"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-label text-sage-700">
                Read more
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>

        {/* ---------- Routing by situation ---------- */}
        <div className="mt-20 max-w-2xl">
          <span className="eyebrow">Choosing</span>
          <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
            Start from the problem,{" "}
            <span className="accent text-sage-600">not the service name.</span>
          </h2>
          <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
            Most people arrive knowing what is wrong with their space and not which
            service fixes it. These are the situations we are asked about most, and
            where each one leads. If yours is not here, it is a conversation rather than
            a category.
          </p>
        </div>

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {DECISION_PATHS.map(({ situation, answer, href, linkLabel }) => (
            <li key={situation} className="grid gap-3 py-6 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
              <p className="font-display text-[1.05rem] font-semibold leading-snug text-ink">
                {situation}
              </p>
              <div>
                <p className="text-[0.94rem] leading-[1.8] text-ink-muted">{answer}</p>
                <Link
                  href={href}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900"
                >
                  {linkLabel}
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
