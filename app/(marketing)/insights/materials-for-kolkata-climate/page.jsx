import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("materials-for-kolkata-climate");
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
 * Domain knowledge only — how materials behave in a hot, humid, monsoon
 * climate. No prices, no brands ranked, no project claims, no test results the
 * studio has not run. Everything asserted here is general material behaviour a
 * practitioner would recognise, not a claim about Avaya Udyog's own work.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight}>
        <p>
          Kolkata is hard on interiors in a specific way. It is not the heat — most
          materials tolerate heat. It is sustained humidity, a monsoon that keeps
          everything damp for weeks, and in parts of the city air with enough salt in
          it to shorten the life of ordinary hardware. Specify as though for a dry
          climate and the failures arrive on a predictable schedule.
        </p>
        <p>
          None of this is exotic knowledge. It is simply the difference between
          choosing a material because it looks right and choosing it because it will
          still look right in five years.
        </p>

        <h2>Plywood and the parts nobody sees</h2>
        <p>
          The single most consequential material decision in a home is also the least
          visible: what the boxes are made of. Cabinet carcasses, wardrobe interiors and
          the substrate under every veneer live their whole lives out of sight, and they
          are where humidity does its damage first.
        </p>
        <p>
          <strong>Boiling Water Proof (BWP) or marine-grade plywood</strong> is
          specified in wet zones for a reason — kitchens, bathroom vanities, utility
          areas, and the bottom of anything standing on a floor that gets mopped. The
          glue line is what is being paid for, not the timber. <strong>MR-grade
          (moisture resistant) plywood</strong> is adequate for dry-zone furniture in a
          well-ventilated room and is not adequate under a sink, whatever the showroom
          says.
        </p>
        <p>
          Particle board and ordinary MDF have a place in low-cost work, but they
          behave badly once water reaches them: they swell irreversibly, and a swollen
          board cannot be dried out and reused. In a climate like this, the
          money-saving decision is often the one that has to be paid for twice.
        </p>
        <p>
          The uncomfortable part is that none of this is inspectable after
          installation. Once a kitchen is fitted you cannot tell what the carcass is by
          looking at it, which is exactly why it is worth being specific at the
          specification stage rather than trusting a general description.
        </p>

        <h2>Veneer, laminate and how surfaces age</h2>
        <p>
          Natural veneer is beautiful and it moves. In a humid climate it expands,
          contracts and — if the edge sealing is poor — lifts at the corners. Veneer
          used well is veneer that has been properly sealed on <em>both</em> faces, so
          that moisture cannot enter from behind and push it off the substrate. A
          single-sided seal is a common shortcut and a reliable source of delamination.
        </p>
        <p>
          Laminate is far more forgiving and correspondingly less characterful. Matte
          finishes hide the film of dust that settles on everything here; high-gloss
          acrylic looks superb in photographs and shows fingerprints, water spots and
          every wipe mark in a kitchen that is actually used. Neither is wrong — but
          choose knowing which problem you are choosing.
        </p>

        <h2>Paint, walls and the monsoon</h2>
        <p>
          Damp patches on internal walls are usually not a paint problem. They are a
          water-ingress problem that paint has been asked to solve, and repainting over
          them simply resets the clock. The sequence that actually works is finding
          where water is entering, dealing with it, letting the wall dry properly, and
          only then finishing.
        </p>
        <p>
          Where walls share a boundary with an external face or a bathroom, the
          finishing schedule matters more than the paint brand. Washable and
          anti-fungal finishes help in bathrooms and kitchens; they do not compensate
          for a wall that is wet from the other side.
        </p>

        <h2>Hardware, and why it fails first</h2>
        <p>
          Hinges, drawer channels, handles and the fixings holding everything to the
          wall are the components most often specified last and most often regretted
          first. Humid air with any salt content corrodes cheap plating quickly, and
          corroded channels do not glide — they stick, then they grind, then the drawer
          is never fully closed again.
        </p>
        <p>
          This is the clearest case in interiors where the cheaper option costs more.
          Good hardware in a modest kitchen outlasts poor hardware in an expensive one,
          because hardware is what you physically operate several thousand times a
          year. It is discussed in more detail on our{" "}
          <Link href="/services/modular-kitchen" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            modular kitchen page
          </Link>.
        </p>

        <h2>Flooring</h2>
        <ul>
          <li>
            <strong>Vitrified tile</strong> — the practical default. Effectively
            unbothered by humidity, easy to clean, and the joint grout is the only part
            that needs thought.
          </li>
          <li>
            <strong>Natural stone</strong> — durable and characterful; needs sealing
            and periodic re-sealing, and some stones stain more readily than clients
            expect.
          </li>
          <li>
            <strong>Engineered and laminate wood</strong> — achievable indoors with
            genuine care about moisture from below and at thresholds. The failure mode
            is edge swelling, and it is not repairable in place.
          </li>
          <li>
            <strong>Solid hardwood</strong> — moves seasonally here. Beautiful,
            demanding, and best specified with expansion properly allowed for rather
            than fitted tight.
          </li>
        </ul>

        <h2>Ventilation is a material decision</h2>
        <p>
          The most under-used tool against humidity damage is air movement. Wardrobes
          pushed flat against an external wall with no gap trap moisture behind them;
          bathrooms without working extraction push damp air into adjacent joinery;
          kitchens without adequate exhaust deposit grease that then holds moisture
          against surfaces.
        </p>
        <p>
          Much of what looks like a material failure is a ventilation failure that a
          material was blamed for. Designing in the gap behind a wardrobe or the
          extraction path in a kitchen costs nothing at the drawing stage and is
          expensive to add later.
        </p>

        <h2>The short version</h2>
        <p>
          Spend on what you cannot see and cannot replace — carcass material, edge
          sealing, hardware, and the ventilation that keeps everything dry. Economise,
          if you must, on the surfaces that can be redone in a weekend. That ordering
          holds in most climates and it holds more strongly in this one.
        </p>
      </InsightArticle>
    </>
  );
}
