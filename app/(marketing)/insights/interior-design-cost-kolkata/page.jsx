import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("interior-design-cost-kolkata");
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

/**
 * Cost — deliberately with NO figures.
 *
 * This is the highest-intent query the site can answer and also the one where
 * a wrong number does the most damage, so the article explains the *structure*
 * of a cost rather than asserting any amount. Nothing here states a rate, a
 * range, a percentage, a per-square-foot figure or what Avaya Udyog charges.
 *
 * What IS stated is how the industry builds a number up — that fee models
 * exist, that materials and execution are separate from design, what moves
 * each line. That is general domain knowledge a practitioner would recognise,
 * not a claim about this studio's pricing.
 *
 * If the business supplies a real, defensible band, the natural place for it
 * is the "What a number actually needs" section near the end — it would make
 * this the strongest commercial page on the site. Until then, an honest
 * explanation of the drivers outperforms both silence and an invented figure.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <InsightArticle insight={insight}>
        <p>
          Ask three studios what it costs to do up the same three-bedroom flat and
          you can get three very different answers, all of them given in good faith.
          The gap is rarely the rate anyone is charging. It is that each answer has
          quietly assumed a different amount of work.
        </p>
        <p>
          We are not going to publish a per-square-foot number here, because a number
          quoted without a scope is a number that changes at the first site visit —
          and being told a figure that later moves is worse than being told none. What
          follows instead is how the figure is actually built, so you can read any
          quotation you receive and understand what is in it.
        </p>

        <h2>Three different things, usually presented as one</h2>
        <p>
          Most confusion about interiors pricing comes from collapsing three separate
          costs into a single number.
        </p>
        <ul>
          <li>
            <strong>Design fees</strong> pay for the thinking: layouts, drawings,
            material selection, and the coordination that keeps the site building the
            right thing. Studios structure this differently — some charge a percentage
            of project value, some a flat fee for a defined scope, some by area. What
            matters is knowing which model you are being quoted under, because they
            behave very differently when the scope grows.
          </li>
          <li>
            <strong>Materials</strong> are what physically goes into the space —
            plywood, laminate, hardware, tiles, stone, paint, light fittings. This is
            usually the largest line and the one with the widest possible range,
            because the same cabinet can be built at several different specifications.
          </li>
          <li>
            <strong>Execution</strong> is labour, site supervision, wastage and the
            cost of coordinating trades in the right order. It is the line clients
            most often forget when comparing quotes, and the one most affected by how
            difficult the site is to work in.
          </li>
        </ul>
        <p>
          A quotation that presents only a single total is not necessarily hiding
          anything, but you cannot compare it to anything else. Ask for it split.
        </p>

        <h2>What actually moves the number</h2>

        <h3>Scope — by far the largest factor</h3>
        <p>
          How much of the home is being touched, and how deeply. Painting and
          re-flooring a flat and taking it back to the shell are different projects by
          an order of magnitude, not by a percentage. Within a single home, the
          difference between refreshing a kitchen and rebuilding it is larger than
          almost any material decision you will make.
        </p>

        <h3>Size — but less than people expect</h3>
        <p>
          Area matters, but it is a weaker driver than most people assume, because
          cost concentrates in specific rooms. Kitchens and bathrooms carry
          disproportionate cost per square foot — they contain plumbing, waterproofing,
          appliances, dense joinery and hard finishes. A large flat with one bathroom
          can cost less to do than a smaller one with three.
        </p>

        <h3>Civil work</h3>
        <p>
          Anything that changes the structure or the fabric of the building:
          demolishing or building walls, moving door openings, waterproofing,
          re-screeding floors, correcting levels. Civil work also drives cost
          indirectly, because it creates debris, extends the schedule and delays every
          trade that follows it.
        </p>

        <h3>Electrical and plumbing changes</h3>
        <p>
          Working with existing points is far cheaper than moving them. Once a socket,
          a light point or a water line has to relocate, you are into chasing walls,
          re-plastering and repainting — three trades triggered by one decision. This
          is why layout is worth settling early: a plan that respects existing services
          costs meaningfully less than one that fights them, and the difference is
          invisible until someone prices it.
        </p>

        <h3>Modular kitchen</h3>
        <p>
          Usually the single largest concentrated cost in a home. Running length drives
          it first, then carcass specification, then shutters and hardware. The same
          kitchen footprint can vary enormously depending on those choices — which is
          covered in more detail on our{" "}
          <Link href="/services/modular-kitchen" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            modular kitchen page
          </Link>.
        </p>

        <h3>Wardrobes and fixed joinery</h3>
        <p>
          The second large joinery line. Cost follows running length and height —
          wardrobes taken to the ceiling cost more than ones that stop short, and
          lofts add a whole band of material and labour. Internal fittings, drawers
          and pull-outs add up faster than the shutters everyone focuses on.
        </p>

        <h3>False ceiling</h3>
        <p>
          Priced by area, but the real variable is complexity: a flat ceiling with
          recessed lights is straightforward, while coves, drops, curves and
          concealed lighting multiply both material and labour. In Kolkata there is a
          durability dimension too — the specification that survives the humidity is
          not always the cheapest one, and we have written separately about{" "}
          <Link href="/insights/false-ceiling-kolkata-humidity" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            what humidity does to false ceilings
          </Link>.
        </p>

        <h3>Loose furniture and furnishings</h3>
        <p>
          Sofas, beds, dining sets, rugs, curtains and lighting. This line is unusual
          because it is almost infinitely elastic — the same room can be furnished at
          wildly different levels — and because it is often excluded from an interiors
          quotation entirely. Always check whether it is in or out.
        </p>

        <h3>Design complexity</h3>
        <p>
          Bespoke details cost more than standard ones, and not only in materials.
          Custom joinery, unusual finishes, curves, and anything requiring a mock-up
          before it is built all consume design and supervision time. None of this is
          wasteful — it is often exactly what makes a space feel considered — but it
          should be a deliberate choice rather than a surprise.
        </p>

        <h3>Site condition and access</h3>
        <p>
          A frequently ignored driver. An occupied home costs more to work in than an
          empty one, because work must be sealed, sequenced around the household and
          often paused. In an apartment, the building itself adds cost through
          restricted working hours, service-lift booking and debris-removal rules —
          all of which stretch the schedule. That is covered in{" "}
          <Link href="/insights/apartment-society-rules-renovation-kolkata" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            apartment society rules that shape a Kolkata renovation
          </Link>.
        </p>

        <h2>Why two quotes are so hard to compare</h2>
        <p>
          When quotations differ sharply, the cause is almost always one of these:
        </p>
        <ul>
          <li><strong>Different carcass material</strong> — invisible after installation, and the largest driver of how long joinery lasts.</li>
          <li><strong>Different hardware tier</strong> — hinges and channels are rarely itemised and vary widely.</li>
          <li><strong>Loose furniture in or out.</strong></li>
          <li><strong>Civil work in or out</strong>, and who is responsible for making good afterwards.</li>
          <li><strong>Electrical and plumbing</strong> assumed to stay put versus assumed to move.</li>
          <li><strong>Wastage and supervision</strong> priced explicitly or absorbed silently.</li>
          <li><strong>Appliances and fittings</strong> — sometimes provided, sometimes a client scope.</li>
        </ul>
        <p>
          A lower number is not automatically a better deal, and a higher one is not
          automatically thorough. The only way to know is to compare the same scope.
        </p>

        <h2>What a number actually needs before it means anything</h2>
        <p>
          A quotation becomes reliable once four things are settled: the layout,
          the material specification, what is included and excluded, and the condition
          of the site. Until then, any figure is a placeholder — and the honest thing
          for a studio to say is that it is a placeholder.
        </p>
        <p>
          This is why costing is discussed during consultation rather than published as
          a rate. Seeing the actual rooms, the existing services and the building is
          what turns a guess into something you can plan around. Full walkthroughs,
          drawings and material boards are shared at that stage.
        </p>

        <h2>Practical ways to control cost without gutting the design</h2>
        <ul>
          <li><strong>Settle the layout early.</strong> Changes are nearly free on a drawing and expensive on site.</li>
          <li><strong>Design around existing services</strong> wherever the plan allows.</li>
          <li><strong>Spend on what cannot be replaced later</strong> — carcass, hardware, waterproofing — and economise on surfaces that can be redone in a weekend.</li>
          <li><strong>Phase the work</strong> if the budget is tight. A well-executed first phase beats a stretched-thin whole-home job.</li>
          <li><strong>Decide loose furniture early</strong>, so it is budgeted rather than discovered.</li>
          <li><strong>Do not compress the schedule.</strong> Rushed sequencing causes rework, and rework is the most expensive line of all.</li>
        </ul>

        <h2>The short version</h2>
        <p>
          Cost follows scope first, then the invisible specifications, then complexity.
          Anyone quoting you a firm number before seeing the space is guessing, and
          anyone quoting a single undifferentiated total is giving you something you
          cannot compare. Ask for the split, ask what is excluded, and settle the
          layout before you ask what it costs.
        </p>
      </InsightArticle>
    </>
  );
}
