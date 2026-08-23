import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("living-at-home-during-renovation");
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
 * Renovation logistics. General practitioner knowledge — no durations claimed
 * for Avaya Udyog projects specifically, no costs, no project examples.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <InsightArticle insight={insight}>
        <p>
          It is the first question most renovation clients ask, and the honest answer
          is that it depends far more on scope than on the size of the home. A large
          flat having its surfaces refreshed is easier to live in than a small one
          having its plumbing rerouted.
        </p>
        <p>
          Getting the answer wrong is expensive in a way that does not show up in a
          quotation. Families who decide to stay in a project they should have moved
          out of tend to spend months living in one room, cooking on a hotplate,
          negotiating daily with a site that cannot work efficiently around them.
        </p>

        <h2>Where staying usually works</h2>
        <ul>
          <li>
            <strong>Cosmetic work, room by room.</strong> Painting, flooring, joinery
            and lighting done in sequence, with one room sealed off at a time.
          </li>
          <li>
            <strong>Single-room projects</strong> where the room is not the kitchen or
            the only bathroom.
          </li>
          <li>
            <strong>Work confined to one zone</strong> of a home large enough to have
            zones — a study, a guest bedroom, a balcony enclosure.
          </li>
        </ul>

        <h2>Where staying usually does not</h2>
        <ul>
          <li>
            <strong>The only kitchen being rebuilt.</strong> Cooking is disrupted for
            the whole duration, not the few days of installation people imagine.
          </li>
          <li>
            <strong>The only bathroom being rebuilt.</strong> The one genuinely
            non-negotiable room.
          </li>
          <li>
            <strong>Electrical rewiring or plumbing reroutes</strong> across the home,
            which mean power and water are intermittently off.
          </li>
          <li>
            <strong>Full-home layout changes.</strong> Once walls move, there is no
            clean part of the house to retreat into.
          </li>
          <li>
            <strong>Anything involving significant dust generation</strong> where
            someone in the household has a respiratory condition. This one is worth
            deciding on medical grounds rather than logistical ones.
          </li>
        </ul>

        <h2>What actually makes staying tolerable</h2>
        <p>
          Three things, in order of impact. <strong>Sealing</strong> — proper dust
          barriers at doorways rather than a sheet taped across a frame, because fine
          dust travels through a flat astonishingly well and settles in every wardrobe
          you own. <strong>Sequencing</strong> — work ordered so that the rooms you
          depend on are finished first or touched last, never in the middle.{" "}
          <strong>A working kitchen of some kind</strong>, even a temporary one, because
          eating out for three months is both expensive and quietly demoralising.
        </p>
        <p>
          Pack away and remove more than feels necessary before work begins. Anything
          left in the home will be moved repeatedly, will accumulate dust, and will slow
          the site down every time it has to be shifted.
        </p>

        <h2>The building has a say</h2>
        <p>
          In an apartment, the building constrains the schedule as much as the work
          does. Permitted working hours, service-lift bookings, restrictions on when
          debris can be removed and rules about weekend work all shape what is possible.
          Neighbours are living through the noise without any of the benefit, and the
          goodwill matters over a multi-month project.
        </p>
        <p>
          Worth establishing the building&apos;s rules before the schedule is written
          rather than after — a plan that assumes six working days a week in a building
          that permits five is a plan that is already late.
        </p>

        <h2>Plan for what is found</h2>
        <p>
          Older buildings hide things: wiring that is not what the drawings say, damp
          behind a tiled wall, plumbing that has been modified by three previous owners.
          A renovation plan with no room for discovery is a plan that will be revised
          under pressure.
        </p>
        <p>
          The practical response is to open up the known risk areas early rather than
          late, so any bad news arrives while the schedule can still absorb it. More on
          how that sequencing works on our{" "}
          <Link href="/services/home-renovation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            renovation page
          </Link>.
        </p>

        <h2>Decide honestly, early</h2>
        <p>
          The decision is worth making at the planning stage, with the scope in front of
          you, rather than three weeks in when the kitchen is gone. Ask directly whether
          the work you are planning is livable, and treat a confident yes with some
          scepticism unless it comes with a specific explanation of how.
        </p>
      </InsightArticle>
    </>
  );
}
