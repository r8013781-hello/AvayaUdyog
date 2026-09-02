import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";
import SectionLink from "../../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("apartment-society-rules-renovation-kolkata");
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
 * Apartment society constraints on renovation.
 *
 * Written as categories of rule to check, NOT as assertions about what any
 * particular society permits. Rules vary building to building, so stating
 * specific permitted hours or deposit amounts would be inventing facts about
 * buildings nobody here has read the bye-laws of. The article repeatedly tells
 * the reader to get their own building's rules in writing, which is both the
 * honest position and the genuinely useful advice.
 *
 * No claims about renovations Avaya Udyog has carried out in any named
 * building or area.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight}>
        <p>
          Most people planning an apartment renovation think about the work. Fewer think
          about the building — and in a Kolkata apartment block, the building often
          constrains the schedule more than the work itself does.
        </p>
        <p>
          None of these constraints is unreasonable. You are asking to make noise, dust
          and debris in a structure where dozens of other households are trying to live
          normally. But finding out about them after the schedule is written is how
          projects quietly slip by weeks, and how relationships with neighbours start
          badly and stay that way.
        </p>
        <p>
          Rules vary considerably from building to building. Everything below is a
          category to ask about, not a description of what your society permits — the
          only reliable source is your own management committee, in writing.
        </p>

        <h2>Get the rules in writing, first</h2>
        <p>
          Before any schedule is drawn up, ask the committee or facility manager for the
          renovation guidelines in writing. Most buildings have something, even if it is
          informal, and a verbal understanding tends to be remembered differently once
          there is a complaint.
        </p>
        <p>
          What to ask for specifically: permitted working days and hours, whether any
          noisy work is restricted further, what has to be submitted before starting,
          whether a deposit is required and what it covers, how debris must be removed,
          which lift may be used, and whether workers need to be registered.
        </p>

        <h2>Working hours</h2>
        <p>
          Almost every building restricts when work can happen, usually to weekday
          daytime hours, and often with tighter limits on genuinely noisy activity like
          breaking, drilling and cutting. Weekends and public holidays are frequently
          excluded entirely.
        </p>
        <p>
          The scheduling consequence is straightforward and often underestimated: a plan
          assuming six full working days a week in a building that permits five shorter
          ones is already late before anyone starts. Get the real working window, then
          build the programme from it — not the other way round.
        </p>

        <h2>Lift and service-lift coordination</h2>
        <p>
          This is the constraint that most often surprises people. In many buildings
          construction material may not travel in the passenger lift at all, and the
          service lift must be booked in advance, sometimes with restricted slots.
        </p>
        <p>
          It matters more than it sounds because material arrives in waves — plywood
          sheets, tiles, stone, cement bags, kitchen carcasses, glass. Each wave needs
          lift access, and a missed booking can idle a delivery or a whole trade for a
          day. Where a service lift is small or slow, sheet material may need cutting
          before it arrives, which changes how the joinery is planned.
        </p>
        <p>
          Buildings also commonly require lift interiors to be protected before use, and
          hold the flat owner responsible for any damage.
        </p>

        <h2>Material movement and storage</h2>
        <p>
          Corridors, lobbies and stairwells are shared, and are usually fire escape
          routes. Most buildings prohibit storing material in them for any length of
          time, which means deliveries have to be sized to what the flat itself can hold.
        </p>
        <p>
          Practical implications: stage deliveries rather than taking everything at once,
          protect common-area flooring on the route from lift to door, and agree where
          material can briefly stand while it is being moved in.
        </p>

        <h2>Noise</h2>
        <p>
          The most common source of complaints, and the one most likely to get work
          stopped. Breaking tiles, chasing walls for electrical conduit, core-cutting
          and drilling into structural concrete are all loud enough to carry through a
          building.
        </p>
        <p>
          Two things help disproportionately. First, front-load the noisy work: get
          demolition and chasing done early and in a concentrated block rather than
          spreading it across the whole project. Second, tell your immediate neighbours
          before it starts, with a rough idea of how long the loud phase lasts. A
          neighbour who has been warned is far more tolerant than one who has not, and
          the whole project is easier for it.
        </p>

        <h2>Debris removal</h2>
        <p>
          Renovation debris is heavy, dusty and awkward, and buildings are strict about
          it for good reason. Expect rules on how it is bagged, where it may be staged,
          which route and lift it leaves by, and what times removal may happen — often
          different from working hours.
        </p>
        <p>
          Debris also has a hidden cost: it must leave at roughly the rate it is
          generated, because it cannot accumulate in a flat someone still lives in. If
          removal is restricted to certain days, that paces the demolition, which paces
          everything after it. Worth establishing before the first wall comes down.
        </p>

        <h2>Permissions, NOCs and deposits</h2>
        <p>
          Many societies require written permission before work begins, and it is common
          for a refundable deposit to be held against damage to common areas. Some ask
          for a description of the work, particularly where anything structural,
          plumbing-related or affecting the façade is involved.
        </p>
        <p>
          A few things are prohibited outright in most buildings and worth checking
          early rather than designing around and then discovering: alterations to
          structural elements, changes to the external appearance including windows,
          grilles and balcony enclosures, relocating common plumbing stacks, and drilling
          into the slab beyond a permitted depth. If your plan touches any of these,
          establish it at the design stage — this is exactly the kind of constraint that
          should surface during{" "}
          <SectionLink href="/#how-we-work" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            the first consultation
          </SectionLink>
          , not during execution.
        </p>

        <h2>Contractor access and registration</h2>
        <p>
          Security requirements are increasingly common: worker lists submitted in
          advance, ID verification, gate passes, restrictions on who may stay overnight
          (usually nobody), and defined entry and exit points.
        </p>
        <p>
          This is administratively easier when one party is coordinating everything.
          Where design and execution sit with the same team, there is a single point of
          contact for the committee and a single list to keep current — rather than four
          trades each arranging their own access. It is a small advantage on paper and a
          noticeable one over several months.
        </p>

        <h2>Living in the flat while it happens</h2>
        <p>
          If you are staying, the building&apos;s constraints compound the household ones.
          Restricted hours stretch the schedule, which extends how long you live with it.
          Dust control matters more, because you cannot leave. And the noisy phase you
          scheduled considerately for your neighbours is happening to you too.
        </p>
        <p>
          Whether staying is realistic depends far more on scope than on the size of the
          flat — we have written about that separately in{" "}
          <Link href="/insights/living-at-home-during-renovation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            can you live at home during a renovation
          </Link>.
        </p>

        <h2>Building a schedule that survives the building</h2>
        <ol className="b">
          <li>Get the written rules before the programme is drafted.</li>
          <li>Calculate the real weekly working window in hours, not days.</li>
          <li>Front-load noisy and dusty work into one concentrated phase.</li>
          <li>Book lift slots for each delivery wave, in advance.</li>
          <li>Match debris removal to the demolition rate, not the other way round.</li>
          <li>Submit permissions and worker lists before day one, not on it.</li>
          <li>Tell your neighbours what is happening and roughly how long the loud part lasts.</li>
          <li>Leave contingency for the day the lift is unavailable — there will be one.</li>
        </ol>

        <h2>The short version</h2>
        <p>
          The building is a stakeholder in your renovation whether or not anyone plans
          for it. Getting its rules in writing before the schedule exists costs an
          afternoon and prevents most of the delays that make apartment renovations
          run long. It is also the difference between finishing on reasonable terms with
          your neighbours and finishing on bad ones.
        </p>
      </InsightArticle>
    </>
  );
}
