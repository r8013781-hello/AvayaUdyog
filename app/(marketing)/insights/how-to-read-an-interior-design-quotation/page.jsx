import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("how-to-read-an-interior-design-quotation");
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
  { id: "why-quotes-differ", label: "Why two honest quotations can differ so much" },
  { id: "scope-and-drawings", label: "Scope and drawings" },
  { id: "materials-and-specification", label: "Materials and specification" },
  { id: "quantities", label: "Quantities" },
  { id: "labour-and-site-work", label: "Labour and site work" },
  { id: "exclusions", label: "Exclusions and assumptions" },
  { id: "taxes-and-charges", label: "Taxes and other charges" },
  { id: "changes-and-payment", label: "Change handling and payment stages" },
  { id: "the-cheap-quote", label: "What a suspiciously low quotation usually omits" },
];

/**
 * Companion to /insights/interior-design-cost-kolkata, deliberately answering
 * a different question. That article explains what drives a number up or
 * down; this one explains how to read a number you already have in hand and
 * compare it against another.
 *
 * No invented commercial terms. This does not describe Avaya Udyog's own
 * payment schedule, warranty period or tax treatment — none of that is
 * published anywhere in this repository, so none of it is stated here as
 * fact. Where a business practice is mentioned, it is framed as something to
 * ask any firm, including this one, not as something Avaya Udyog does.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight} contents={CONTENTS}>
        <p>
          A quotation is not a price. It is a claim about a specific amount of work,
          in specific materials, done in a specific way — and the number at the
          bottom only means anything once you know what that claim actually covers.
          Our{" "}
          <Link href="/insights/interior-design-cost-kolkata" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            note on what drives interior design cost in Kolkata
          </Link>{" "}
          covers why the number moves. This one is about the document itself — how to
          read it, and what to ask when it doesn&apos;t say enough.
        </p>

        <h2 id="why-quotes-differ">Why two honest quotations can differ so much</h2>
        <p>
          Two firms can walk the same flat, act in complete good faith, and hand back
          quotations that look nothing alike — not because one is dishonest, but
          because each has silently assumed a different amount of work. One may have
          priced only the joinery and finishes; the other may have included electrical
          points, false ceiling and painting as part of the same number. Neither
          quotation is lying. Only one of them is telling you everything.
        </p>

        <h2 id="scope-and-drawings">Scope and drawings</h2>
        <p>
          The first thing to check is whether the quotation is priced against a drawing
          or against a description. &ldquo;Modular kitchen, L-shaped, with tall units&rdquo; can
          mean several different layouts; a plan with dimensions cannot. A quotation
          tied to an approved drawing is one you can hold a firm to later — one tied to
          a verbal brief has room to drift in either direction once work starts.
        </p>

        <h2 id="materials-and-specification">Materials and specification</h2>
        <p>
          &ldquo;Plywood&rdquo; is not a specification; &ldquo;19mm BWP plywood, [brand], with a
          specified laminate finish&rdquo; is. The gap between those two sentences is exactly
          where cost hides on both ends — a vague materials line can mean a genuinely
          fair price using a mid-grade board, or it can mean room to substitute a
          cheaper one after the contract is signed, with no way to prove which was
          promised. Ask for the grade, and ideally the brand, of anything structural:
          carcass board, plywood grade, laminate or veneer type, and hardware brand and
          model. Our note on{" "}
          <Link href="/insights/materials-for-kolkata-climate" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            materials that survive Kolkata&apos;s climate
          </Link>{" "}
          sets out what each grade actually means in practice.
        </p>

        <h2 id="quantities">Quantities</h2>
        <p>
          A rate without a quantity is not a total. A laminate rate quoted by area only
          becomes a real number once multiplied by an agreed area, and that area should
          be stated in the document, not estimated later from the finished work. Running
          length of cabinetry, area of false ceiling, and count of electrical points are
          the three quantities most often left vague, and the three most often disputed
          once the site work is underway.
        </p>

        <h2 id="labour-and-site-work">Labour and site work</h2>
        <p>
          Design and material cost are only two of the three components in most
          quotations — the third is the labour to actually install everything, which is
          sometimes itemised and sometimes folded silently into the material rate. Ask
          directly whether fitting, civil work, electrical and plumbing labour are
          included or charged separately, and if separately, on what basis — a fixed
          sum, or time and material. A quotation that is silent on labour is not
          necessarily hiding it, but you should know before you sign, not after.
        </p>

        <h2 id="exclusions">Exclusions and assumptions</h2>
        <p>
          The exclusions section is arguably more informative than the inclusions —
          it tells you what the firm assumed was someone else&apos;s responsibility.
          Common exclusions worth confirming either way: structural or civil work
          beyond a stated scope, main electrical panel or wiring upgrades, painting
          outside the rooms listed, false ceiling in rooms not named, curtains and
          soft furnishings, and appliances. None of these being excluded is unusual or
          dishonest — the problem is only ever a quotation that doesn&apos;t say.
        </p>

        <h2 id="taxes-and-charges">Taxes and other charges</h2>
        <p>
          Confirm plainly whether the quoted figure is inclusive or exclusive of GST,
          and whether any delivery, transport or site-access charges sit outside the
          headline number. A quotation that reads lower only because tax and logistics
          are added afterward is not actually the lower quotation.
        </p>

        <h2 id="changes-and-payment">Change handling and payment stages</h2>
        <p>
          Two questions are worth asking of any firm, including this one, before work
          begins: how is a change to the agreed scope priced and approved once work has
          started, and what are the payment stages tied to — a calendar, or actual
          milestones reached? A quotation silent on either is not automatically a
          problem, but it is a conversation worth having in writing before the first
          payment, not after the first disagreement.
        </p>

        <h2 id="the-cheap-quote">What a suspiciously low quotation usually omits</h2>
        <p>
          When one quotation for the same brief comes in well below the others, the
          honest possibilities are limited: a genuinely leaner design, a lower
          material or hardware grade than the others assumed, labour or civil work
          excluded and to be arranged separately, or a smaller scope than it appears
          to be — fewer running feet of cabinetry, less false ceiling, fewer electrical
          points, described in language similar enough to the higher quotations that
          the difference isn&apos;t obvious on a first read. The number itself never tells
          you which. Reading every quotation against the same checklist above does.
        </p>
        <p>
          The point of all of this is not suspicion — it is comparability. A firm that
          answers these questions plainly, in writing, before work starts, is behaving
          exactly as it should. For how this fits into a real project from first
          conversation onward, see our{" "}
          <Link href="/insights/what-happens-in-a-design-consultation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            note on what happens in a design consultation
          </Link>, or start one directly from{" "}
          <Link href="/services/residential-interior-design" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            residential interior design
          </Link>{" "}
          if the project is a home, or{" "}
          <Link href="/services/commercial-interior-design" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            commercial interior design
          </Link>{" "}
          if it&apos;s a workplace.
        </p>
      </InsightArticle>
    </>
  );
}
