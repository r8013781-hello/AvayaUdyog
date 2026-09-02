import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("modular-vs-carpenter-kitchen-kolkata");
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

const CONTENTS = [
  { id: "construction-control", label: "Construction control" },
  { id: "materials-and-hardware", label: "Materials and hardware" },
  { id: "edge-finishing", label: "Edge finishing — the detail that ages worst" },
  { id: "site-conditions", label: "Site conditions that decide the answer" },
  { id: "timelines", label: "Timelines" },
  { id: "repairability", label: "Maintenance and repairability" },
];

/**
 * Modular vs. carpenter-built — deliberately no verdict.
 *
 * Expands the existing FAQ answer on /services/modular-kitchen ("they are
 * different trades rather than better and worse") into a full decision-support
 * article. Every trade-off here is general trade knowledge a practitioner
 * would recognise — no prices, no named suppliers, no claim about which
 * method Avaya Udyog uses more often, because that isn't a fact this
 * repository has established.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight} contents={CONTENTS}>
        <p>
          The question arrives in almost every kitchen consultation, usually as
          &ldquo;which is actually better?&rdquo; It is the wrong question, because modular and
          carpenter-built are not two grades of the same thing — they are two different
          ways of making cabinetry, with different failure modes and different things
          they are good at. The right question is which set of trade-offs suits your
          kitchen, your site, and how long you plan to live with the decision.
        </p>

        <h2 id="construction-control">Construction control</h2>
        <p>
          A modular kitchen is built from factory-made carcasses and shutters,
          manufactured to a specification and assembled on site. The controlled
          environment is the entire advantage: panels are cut to size on machinery, edge
          banding is applied under consistent pressure and heat, and hardware is
          pre-drilled to a jig rather than marked out by hand. Two identical cabinets
          from the same order really are identical.
        </p>
        <p>
          A carpenter-built kitchen is made on site, or in a local workshop, to
          measurements taken from your actual walls. Nothing about it is standardised,
          which is precisely its strength: a carpenter can work around a wall that is
          not quite plumb, a column in the wrong place, or a ceiling that steps down
          exactly where a cabinet was meant to go. A module cannot be argued with; a
          carpenter can be asked to make one more cut.
        </p>

        <h2 id="materials-and-hardware">Materials and hardware</h2>
        <p>
          Both methods can be specified in marine-grade or BWP plywood, in MDF, or in
          particle board — the method of construction and the material are separate
          decisions, and a modular kitchen built in a poor board is not automatically
          better than a carpenter-built one in a good board. What genuinely differs is
          traceability: a modular order comes with a written specification for the
          board grade and the shutter finish, which is easy to hold a supplier to later.
          A carpenter&apos;s materials are only as documented as you insist on making them
          — worth asking for in writing rather than assuming.
        </p>
        <p>
          Hardware — hinges, channels, lift-ups — is where the gap is usually widest.
          Modular systems are built around a named hardware brand and a defined tier,
          quoted as a line item. A carpenter can fit the same branded hardware, but it
          has to be specified explicitly; left unstated, it is the line most likely to
          be substituted for something cheaper without you noticing until it wears out.
        </p>

        <h2 id="edge-finishing">Edge finishing — the detail that ages worst</h2>
        <p>
          Edge banding is the strip sealing the raw board underneath a laminate or
          veneer face. Machine-applied banding, the modular default, bonds under
          consistent heat and pressure and rarely lifts. Hand-applied edging, more
          common in carpenter-built work, depends entirely on the individual carpenter&apos;s
          skill that day — done well it is indistinguishable, done poorly it is the
          first thing that peels, usually within a humid Kolkata monsoon or two.
        </p>
        <p>
          This is worth inspecting in person rather than taking on trust, in either
          method: run a fingernail along an edge in a showroom sample or a carpenter&apos;s
          previous work before committing to either.
        </p>

        <h2 id="site-conditions">Site conditions that decide the answer</h2>
        <p>
          A genuinely rectangular kitchen with standard wall heights suits modular
          construction well — there is nothing irregular for a module to fight. An
          older Kolkata flat with an out-of-square corner, an odd services duct, or a
          non-standard ceiling height is where carpenter-built work earns its cost:
          a module forced into an irregular space either leaves a gap that has to be
          filled with a filler panel, or requires costly custom modules that erode the
          price advantage modular construction is chosen for in the first place.
        </p>

        <h2 id="timelines">Timelines</h2>
        <p>
          Modular manufacturing happens off-site while other work continues, so the
          kitchen effectively arrives ready to fit once final measurements are locked —
          but only once they are locked, since a module manufactured against a
          measurement that later moves cannot be adjusted on site. Carpenter-built work
          is made against the actual site as it stands, which removes that risk but
          moves more of the timeline on-site, where it is more exposed to the sequencing
          of every other trade working around it.
        </p>

        <h2 id="repairability">Maintenance and repairability</h2>
        <p>
          A damaged modular shutter or a worn hinge is, in principle, a swap-out — order
          the same part from the same system and fit it. In practice this depends on
          the system remaining available years later, which is not guaranteed for every
          brand or every model run. A carpenter-built cabinet can usually be repaired or
          adjusted by any competent carpenter later, not only the one who built it,
          because there is no proprietary system to match.
        </p>
        <p>
          Customisation follows the same logic in reverse: adding a spice pull-out or a
          corner unit to an existing modular kitchen means matching an existing system,
          which narrows your options to whatever that system still offers. A
          carpenter-built kitchen can usually be extended by describing what you want.
        </p>

        <h2>Where this leaves the decision</h2>
        <p>
          Neither method is the safe default. A rectangular kitchen, a firm layout
          already agreed, and a preference for documented, swap-out hardware points
          toward modular. An irregular room, a strong preference for one-off detailing,
          or a kitchen that will likely be adjusted piece by piece over the years points
          toward carpenter-built. Most of what actually goes wrong with either — a poor
          carcass board, unsealed edges, unspecified hardware — is a specification
          failure, not a failure of the method itself. For how the kitchen is designed
          and specified either way, see our{" "}
          <Link href="/services/modular-kitchen" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            modular kitchen design
          </Link>{" "}
          page, and for how carcass and hardware choices hold up in Kolkata&apos;s climate
          specifically, see{" "}
          <Link href="/insights/materials-for-kolkata-climate" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            choosing interior materials that survive Kolkata&apos;s climate
          </Link>.
        </p>
      </InsightArticle>
    </>
  );
}
