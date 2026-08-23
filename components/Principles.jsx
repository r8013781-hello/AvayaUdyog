import { Award, HeartHandshake, Layers } from "lucide-react";

/**
 * Why the studio is worth trusting — merged onto the homepage from the
 * standalone /about page, which no longer exists.
 *
 * The homepage already had two "about" blocks: About (the studio, with a
 * photograph) and AboutCompany (the founder). What the separate page carried
 * that neither of those did was the reasoning — three claims that each say
 * something specific and checkable rather than "quality and passion". That is
 * the part worth keeping, so it is the part that moved.
 *
 * Sits between About and Gallery: the studio, why it works the way it does,
 * then the work itself.
 */
const PRINCIPLES = [
  {
    icon: Award,
    title: "A legacy of craft",
    text: "Three and a half decades of design leadership, built on trust, taste and timeless execution. Experience of that length mostly shows up in the unglamorous places — knowing which materials fail early, which layouts people stop using after a month, and what actually goes wrong on site.",
  },
  {
    icon: Layers,
    title: "Design and execution together",
    text: "The studio designs and executes. That matters most when something unexpected appears mid-project, because the person who has to solve it is the person who designed it — there is no handover to a separate contractor where responsibility quietly changes hands.",
  },
  {
    icon: HeartHandshake,
    title: "Home-like service",
    text: "Warmth, care and a personal commitment to every project. Interiors work is disruptive by nature and clients live with the disruption — how a studio behaves during that period is as much a part of the work as the drawings.",
  },
];

export default function Principles() {
  return (
    <section id="principles" className="section scroll-mt-24 bg-canvas md:scroll-mt-28">
      <div className="shell relative">
        <div className="max-w-2xl">
          <span className="eyebrow">How We Think</span>
          <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
            Three things that shape{" "}
            <span className="accent text-sage-600">every project.</span>
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-[1.5rem] border border-line bg-white p-7 shadow-hair">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line-strong bg-sage-50 text-sage-600">
                <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[0.92rem] leading-[1.8] text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
