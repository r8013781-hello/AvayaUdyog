/**
 * What the client decides, stage by stage — merged onto the homepage from the
 * standalone /process page, which no longer exists.
 *
 * HowWeWork above already describes the four stages the studio runs. This is
 * the half that page carried and the homepage did not: what is asked of the
 * client, and when. That is the question people actually have before
 * committing — how much of my time is this, and which decisions am I on the
 * hook for — and it is the most useful thing that can be said without
 * publishing commitments the business has not made.
 *
 * Note what is still deliberately absent: stage durations, revision counts,
 * deliverable lists, site-visit frequency, payment schedules and sign-off
 * gates. Every one is a specific commitment the business has not published,
 * and they are exactly what a client would hold the studio to. "The layout is
 * your decision and it gets expensive to change after design" is how interiors
 * work everywhere; it is not a durations claim.
 */
const YOUR_DECISIONS = [
  {
    stage: "Before consultation",
    yours: [
      "Who the decision-makers are, and whether they agree",
      "A rough sense of budget — even a wide band helps more than none",
      "What is not working about the current space, in specifics",
    ],
    cost: "Costs nothing to change. Changing it later is what makes projects drift.",
  },
  {
    stage: "During design",
    yours: [
      "The layout — where walls, doors and services go",
      "Material and finish direction, against boards rather than descriptions",
      "What is in scope and what waits for a later phase",
    ],
    cost: "Cheap to change on a drawing. This is the stage worth taking slowly.",
  },
  {
    stage: "Before execution",
    yours: [
      "Sign-off on the layout and the specification",
      "Whether you live or operate in the space during the work",
      "Anything you are supplying yourself, and when it arrives",
    ],
    cost: "The last point at which changes are inexpensive.",
  },
  {
    stage: "During execution",
    yours: [
      "Decisions on anything the site uncovers that the drawings could not",
      "Approval of variations as they arise, not at the end",
    ],
    cost: "Changes here mean undoing work already done. Kept to a minimum by the three stages above.",
  },
];

export default function YourPart() {
  return (
    <section id="your-part" className="section scroll-mt-24 bg-canvas !py-20 md:scroll-mt-28">
      <div className="shell relative">
        <div className="max-w-2xl">
          <span className="eyebrow">Your Part</span>
          <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-[2.4rem]">
            What you decide, <span className="accent text-sage-600">and when.</span>
          </h2>
          <p className="mt-6 text-[1rem] leading-[1.85] text-ink-soft">
            The four stages above are what we do. This is what is asked of you — worth
            knowing before you start, because the cost of a decision depends almost
            entirely on which stage it is made in. Nearly every interiors project that
            runs over does so because a decision that belonged in one column was
            actually made in the next one.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {YOUR_DECISIONS.map(({ stage, yours, cost }) => (
            <div
              key={stage}
              className="flex flex-col rounded-[1.5rem] border border-line bg-white p-7 shadow-hair"
            >
              <h3 className="font-display text-[1.15rem] font-semibold text-ink">{stage}</h3>
              <ul className="mt-4 space-y-2.5">
                {yours.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.92rem] leading-[1.75] text-ink-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-line pt-4 text-[0.84rem] leading-[1.7] text-ink-soft">
                <span className="font-semibold text-sage-700">Cost of changing it here:</span>{" "}
                {cost}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
