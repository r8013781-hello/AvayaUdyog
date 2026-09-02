import Link from "next/link";
import InsightArticle from "../../../../components/InsightArticle";
import { getInsight } from "../../../../lib/insights";
import { webPageSchema, articleSchema } from "../../../../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const insight = getInsight("false-ceiling-kolkata-humidity");
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
 * False ceilings in a hot, humid, monsoon climate.
 *
 * General material behaviour only. No prices, no brand rankings, no claims
 * about ceilings Avaya Udyog has installed, and no invented statistics about
 * failure rates or humidity levels. Everything here is behaviour a
 * practitioner would recognise, framed for a Kolkata reader.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <InsightArticle insight={insight}>
        <p>
          A false ceiling is unusual among interior elements: it is expensive to open
          up, impossible to inspect once closed, and it sits directly above everything
          you own. In a dry climate those facts are manageable. In Kolkata, where
          humidity is sustained for months and the monsoon keeps everything damp, they
          decide how the ceiling should be built in the first place.
        </p>
        <p>
          Most ceiling problems here are not manufacturing defects. They are the
          predictable consequence of specifying for a drier climate, or of building
          something that cannot be opened when it eventually needs to be.
        </p>

        <h2>What humidity actually does up there</h2>
        <p>
          The space above a false ceiling is warmer, stiller and often damper than the
          room below it. Air does not circulate through it. If moisture gets in — from
          a slab above, a bathroom, an air-conditioning line or simply humid air that
          never dries — it stays.
        </p>
        <p>
          Three consequences follow, and they arrive in roughly this order:
        </p>
        <ul>
          <li><strong>Staining.</strong> The first visible sign, usually a yellow-brown patch or a shadowed line following a joint. By the time it shows on the paint, the board has been wet for a while.</li>
          <li><strong>Sagging.</strong> Boards absorb moisture, gain weight and lose stiffness. Panels bow between supports, and joints open into visible lines.</li>
          <li><strong>Mould on the hidden face.</strong> The one nobody sees until the ceiling comes down. Warm, still, damp, dark — close to ideal conditions.</li>
        </ul>

        <h2>The materials, and how each behaves here</h2>

        <h3>Gypsum board</h3>
        <p>
          The default for good reasons: flat, fast to install, easy to detail, takes
          paint well. Standard gypsum is also the material most affected by moisture —
          it absorbs, softens and sags, and once a board has been wet it does not
          recover its stiffness even after it dries.
        </p>
        <p>
          <strong>Moisture-resistant gypsum</strong> exists and is what belongs in
          bathrooms, kitchens, utility areas, balconies and any room under a terrace
          slab. It is not waterproof — nothing stops a genuine leak — but it tolerates
          humid air far better. The specification difference is invisible once painted,
          which is exactly why it needs to be settled in writing rather than assumed.
        </p>

        <h3>POP (plaster of Paris)</h3>
        <p>
          Long-established here and genuinely good at curves, coves and free-form
          shapes that board struggles with. Its trade-offs are weight and repairability:
          it is heavier than gypsum board, more prone to hairline cracking as the
          structure moves, and messier to open up when something above needs attention.
          It also takes time to dry properly during monsoon, and rushing that stage
          causes problems later.
        </p>

        <h3>PVC and composite panels</h3>
        <p>
          Genuinely water-tolerant, which makes them a reasonable answer for a bathroom
          or a utility balcony. The honest limitation is that they look like what they
          are — the finish rarely sits comfortably in a living room or bedroom. Useful
          in the right room, out of place in the wrong one.
        </p>

        <h3>Grid and modular ceilings</h3>
        <p>
          More common in offices than homes, and underrated for one specific reason:
          every tile lifts out. Where there are services above that will eventually
          need attention, a ceiling you can open in seconds without breaking anything
          is worth more than a seamless one. For commercial spaces this often outweighs
          the aesthetic preference — a point worth raising during{" "}
          <Link href="/services/commercial-interior-design" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
            commercial fit-out planning
          </Link>.
        </p>

        <h3>Wood and veneered ceilings</h3>
        <p>
          Beautiful and demanding. Timber moves seasonally in this climate, so joints
          open and close and the substrate matters enormously. If it is used, it should
          be sealed on every face — including the one facing up into the void, which is
          the face that gets missed and the face the moisture reaches first.
        </p>

        <h2>Ventilation is part of the ceiling design</h2>
        <p>
          The most under-used defence against ceiling damage is air movement, and it is
          usually decided by accident rather than design.
        </p>
        <ul>
          <li><strong>Bathrooms need working extraction</strong> that vents outside, not into the ceiling void. An exhaust fan discharging into the plenum is simply relocating the moisture to somewhere you cannot see it.</li>
          <li><strong>Kitchens need adequate chimney extraction.</strong> Grease-laden humid air that reaches a ceiling void deposits a film that then holds moisture against the board.</li>
          <li><strong>Air-conditioning drain lines must fall correctly and terminate outside.</strong> A blocked or back-falling drain is one of the most common causes of a stained ceiling, and it is entirely preventable at installation.</li>
          <li><strong>Rooms under a terrace slab deserve extra caution</strong> — check the waterproofing above before closing anything below it.</li>
        </ul>

        <h2>Access: the decision people regret most</h2>
        <p>
          Everything hidden above a false ceiling will eventually need attention. AC
          units need servicing. Drain lines block. Wiring gets modified. Light drivers
          and transformers fail — and they usually fail before the fittings do.
        </p>
        <p>
          If there is no access panel, all of that becomes a demolition job followed by
          patching, repainting and a visible repair line. Access panels are cheap at
          construction and expensive to retrofit, and they should be placed at every
          serviceable item: indoor AC units, drain traps, junction boxes and driver
          locations.
        </p>
        <p>
          Well-detailed panels are barely visible. A ceiling that cannot be opened is
          not a cleaner design — it is a deferred cost.
        </p>

        <h2>Lighting, and what actually fails</h2>
        <p>
          Recessed lighting is the usual reason for a false ceiling in the first place,
          and the failure point is rarely the light. It is the driver or transformer
          sitting in the void above it, in warm still air, where heat shortens its life.
        </p>
        <p>
          Two practical consequences: give drivers room to breathe rather than burying
          them against insulation, and put them where they can be reached. Concealed
          cove lighting has the same issue in a less obvious way — the strip is usually
          replaceable, but only if the cove was built so a hand can get into it.
        </p>

        <h2>Common mistakes</h2>
        <ul>
          <li><strong>Standard gypsum in a bathroom or under a terrace.</strong> The most frequent and most preventable failure.</li>
          <li><strong>No access panels at all</strong>, on the basis that they spoil the look.</li>
          <li><strong>Bathroom exhaust venting into the ceiling void</strong> instead of outside.</li>
          <li><strong>Closing the ceiling before the AC drain has been tested</strong> with actual water.</li>
          <li><strong>Dropping the ceiling lower than the room can afford</strong>, because a deep drop plus a coved detail can leave a room feeling shorter than anyone intended.</li>
          <li><strong>Painting over a stain</strong> without finding what caused it. The stain returns, and by then the board is worse.</li>
          <li><strong>Rushing POP drying during monsoon</strong>, then sealing it in.</li>
        </ul>

        <h2>Maintenance worth doing</h2>
        <p>
          Very little, but it should actually happen. Service air-conditioning before
          each summer and have the drain line checked while the technician is there.
          Look up occasionally — a faint line or shadow along a joint is the early
          warning, and it is far cheaper to investigate at that stage than after a
          panel has bowed. If a stain appears, find the source before repainting.
        </p>

        <h2>The short version</h2>
        <p>
          Specify moisture-resistant board wherever water or humid air is likely,
          ventilate to the outside rather than into the void, and build the ceiling so
          it can be opened. Those three decisions cost very little during
          construction and account for most of the difference between a ceiling that
          still looks right in ten years and one that has to come down.
        </p>
      </InsightArticle>
    </>
  );
}
