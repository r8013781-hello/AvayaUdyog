import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("old-vs-new-build-kolkata-flats");
const PAGE_URL = `${SITE_URL}/insights/${insight.slug}`;
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;

export const metadata = {
  title: `${insight.title} | Avaya Udyog`,
  description: insight.description,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "article", siteName: "Avaya Udyog", title: insight.title, description: insight.description, url: PAGE_URL, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: insight.title, description: insight.description, images: [OG_IMAGE] },
};

const webPage = webPageSchema({ url: PAGE_URL, name: insight.title, description: insight.description });
const article = articleSchema({
  url: PAGE_URL,
  headline: insight.title,
  description: insight.description,
  datePublished: insight.published,
  image: OG_IMAGE,
});

/**
 * General condition types, not neighbourhoods. This article exists partly to
 * support a future locality architecture (lib/locations.js distinguishes
 * new-build corridors from older, established areas), but it must stand on
 * its own and never becomes a disguised locality page — no area names appear
 * anywhere in this file, on purpose. The distinction it draws is structural
 * (bare shell vs. occupied, older building) and applies wherever either
 * condition exists.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight}>
        <p>
          The same three-bedroom layout, drawn on the same size of paper, describes two
          different projects depending on one fact that has nothing to do with the
          design: whether the flat is a bare shell handed over for the first time, or a
          home someone has lived in for twenty years. Everything about how the brief is
          taken, and how the project is sequenced, follows from that one fact before a
          single finish is chosen.
        </p>

        <h2>What a new-build handover actually gives you</h2>
        <p>
          A bare-shell handover typically means plastered or unfinished walls, a screed
          or bare floor, stubbed-out plumbing points, and an electrical layout that is
          often minimal — enough for a builder&apos;s standard fittings, rarely enough for
          how a specific family actually wants to live. Nothing has to be undone, which
          is the entire advantage: every wall is available to reconsider, every point
          can move without demolishing something that already works.
        </p>
        <p>
          The brief that suits this condition starts from the layout itself — is the
          builder&apos;s room arrangement actually right for this household, or does the
          kitchen want to move, does a wall come down, does the entrance sequence
          change. Nothing here is constrained by furniture already in place or a family
          living around the work, which is what makes a bare shell the most
          straightforward condition to design for, even though &ldquo;straightforward&rdquo;
          still means real decisions, not fewer of them.
        </p>

        <h2>What an occupied older home actually gives you</h2>
        <p>
          An older, occupied flat starts from the opposite position: a working layout
          that has been lived in long enough to reveal what doesn&apos;t work, walls and
          services whose exact condition is unknown until something is opened, and a
          household that has to keep functioning somewhere while the work happens.
          The brief here starts from what is wrong with daily life in the current
          layout, not from a blank plan — the conversation covered in more detail in{" "}
          <Link href="/insights/what-happens-in-a-design-consultation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            what actually happens in a design consultation
          </Link>.
        </p>

        <h2>Electrical and plumbing realities</h2>
        <p>
          New-build wiring and plumbing are recent and documented, even where the
          builder&apos;s specification is minimal — the risk is insufficient capacity or
          points in the wrong place, both straightforward to add to before anything is
          closed up. An older building carries decades of wiring, sometimes several
          generations of it layered on top of each other, and the condition of anything
          behind a wall or under a floor is genuinely unknown until it is opened. An
          honest plan for older services budgets time and contingency for what is found,
          rather than assuming the existing wiring is fine because it currently works.
        </p>

        <h2>Wall and floor conditions</h2>
        <p>
          A bare shell&apos;s walls and floor are new and unmarked — the only real question
          is whether they are true (plumb and level) enough to finish directly, or need
          correction first. An older flat&apos;s walls carry their history: old paint
          layers, patched cracks, uneven prior renovations, and occasionally structural
          movement that has nothing to do with the current project but has to be
          understood before finishes go on top of it.
        </p>

        <h2>Moisture and humidity history</h2>
        <p>
          A new building has no moisture history yet — the job is specifying correctly
          from the start, covered in our note on{" "}
          <Link href="/insights/materials-for-kolkata-climate" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            materials that survive Kolkata&apos;s climate
          </Link>. An older building already has one, whether or not it is visible yet:
          past leaks, previous damp patches painted over, false ceilings that have seen
          one monsoon too many. Our note on{" "}
          <Link href="/insights/false-ceiling-kolkata-humidity" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            what humidity does to false ceilings
          </Link>{" "}
          covers what that history tends to leave behind. Investigating it before
          closing anything up again is the difference between solving a problem and
          simply repainting over it for a second time.
        </p>

        <h2>Access, logistics and neighbours</h2>
        <p>
          A new-build project usually shares the building with other units at a similar
          stage of fit-out, so service-lift bookings, material deliveries and working
          hours are often already an established routine the building expects. An
          occupied older building has settled residents with settled expectations —
          working hours, noise tolerance and debris removal are governed by rules that
          were not written with a renovation in mind, covered in more detail in our note
          on{" "}
          <Link href="/insights/apartment-society-rules-renovation-kolkata" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            apartment society rules that shape a renovation
          </Link>.
        </p>

        <h2>Preservation vs. replacement</h2>
        <p>
          A bare shell presents no such question — there is nothing yet to decide
          whether to keep. An older home almost always does: a genuinely good teak door,
          original flooring worth restoring rather than replacing, joinery that is dated
          in style but sound in construction. That decision is worth making deliberately,
          room by room, rather than defaulting to either &ldquo;keep everything&rdquo; or &ldquo;replace
          everything&rdquo; before the individual pieces have actually been assessed.
        </p>

        <h2>Why the brief changes before design starts</h2>
        <p>
          None of this is about one condition being harder than the other — a bare
          shell has its own real decisions, and an older home has its own real
          opportunities. What changes is the order of operations: a new-build project
          can move fairly directly from brief to layout to design, while an older,
          occupied home needs an investigation phase — opening up, testing, confirming
          what is actually behind the walls — before the design can be finalised with
          any confidence. Skipping that step doesn&apos;t remove the risk; it just moves the
          discovery to the middle of the project, which is the more expensive place for
          it to happen. For how that investigation and sequencing is actually handled,
          see our{" "}
          <Link href="/services/home-renovation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            home renovation
          </Link>{" "}
          page; for a bare-shell new-build project, the fuller picture is on{" "}
          <Link href="/services/residential-interior-design" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            residential interior design
          </Link>.
        </p>
      </InsightArticle>
    </>
  );
}
