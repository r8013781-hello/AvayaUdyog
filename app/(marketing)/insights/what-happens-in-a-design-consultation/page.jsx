import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema } from "../../../../lib/schema";
import SectionLink from "../../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("what-happens-in-a-design-consultation");
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
 * What a consultation covers. Grounded in the studio's own published copy —
 * "concept development, material guidance and clear design direction", and
 * "full walkthroughs, drawings and material boards are shared during
 * consultation".
 *
 * Deliberately NOT stated: whether the consultation is free, how long it
 * lasts, how many are included, or what it costs. None is published, and this
 * is the article a reader would most reasonably treat as a commitment.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <InsightArticle insight={insight}>
        <p>
          People arrive at a first consultation braced to talk about style — colours,
          references, a folder of saved images. Style comes up, but it is rarely what
          decides the project. The conversation that matters is about how the space is
          used, because that is what constrains everything drawn afterwards.
        </p>

        <h2>What gets asked</h2>
        <p>
          Useful questions are unglamorous and specific. Who cooks, and do they cook
          alone or with someone. Where does the family actually sit in the evening, as
          opposed to where the sofa currently is. What is permanently overflowing —
          shoes, books, linen, cables. Which room does everybody avoid. What about the
          current home irritates you every single day.
        </p>
        <p>
          The answers tend to be more decisive than any brief. A household that eats in
          front of the television needs a different living room from one that eats at a
          table, no matter how similar the two flats look on a plan.
        </p>

        <h2>What is worth bringing</h2>
        <ul>
          <li>
            <strong>The floor plan</strong>, if you have one — even a builder&apos;s
            handover drawing. It removes an entire round of guesswork.
          </li>
          <li>
            <strong>Photographs of the space as it is now</strong>, including the parts
            you dislike. Those are more informative than photographs of finished rooms
            you admire.
          </li>
          <li>
            <strong>Whatever references you have collected</strong> — but as evidence
            of what you respond to, not as a specification.
          </li>
          <li>
            <strong>A sense of your budget range.</strong> Not a precise figure. Enough
            that the conversation stays inside what is actually possible.
          </li>
          <li>
            <strong>Anyone who will have a veto.</strong> The most expensive delays
            come from a decision-maker who was not in the first conversation.
          </li>
        </ul>

        <h2>What you should get out of it</h2>
        <p>
          A consultation should leave you with concept development, material guidance
          and a clear design direction — a view of what the space could become and what
          getting there involves. Full walkthroughs, drawings and material boards are
          shared during consultation, so decisions are made against something you can
          see rather than a description.
        </p>
        <p>
          It should also leave you with some honest negatives. A designer who agrees
          with everything is not being useful. Some of what you want will be
          straightforward, some will need rerouting around a beam or a service, and
          occasionally something is genuinely not worth doing.
        </p>

        <h2>What does not get settled</h2>
        <p>
          A first meeting will not produce a final cost, and any number offered before
          the scope is real is a number that will change. It will not settle every
          material either — that happens through the design stage, where choices are
          made against each other rather than in isolation.
        </p>
        <p>
          What it can settle is direction: broadly what the space wants to be, roughly
          what scale of work that implies, and whether you and the studio are going to
          work well together over several months. That last one matters more than
          clients expect.
        </p>

        <h2>Questions worth asking back</h2>
        <ul>
          <li>Who will actually be on site, and who do I call when something is wrong?</li>
          <li>Does the same team handle execution, or does it pass to a contractor?</li>
          <li>What is the sequence of work, and what depends on what?</li>
          <li>What have you seen go wrong in a project like this one?</li>
          <li>What would you not do here, and why?</li>
        </ul>
        <p>
          The last two are the most revealing. Anyone who has genuinely run projects has
          a ready answer, and it usually explains more about how they work than a
          portfolio does.
        </p>

        <h2>After the consultation</h2>
        <p>
          What follows is the design stage, then execution, then finishing. The
          sequence and what each stage decides is set out on our{" "}
          <SectionLink href="/#how-we-work" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            process page
          </SectionLink>{" "}
          — worth reading before the first meeting, because it makes the conversation
          shorter and more specific.
        </p>
      </InsightArticle>
    </>
  );
}
