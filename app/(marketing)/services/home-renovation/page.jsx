import Link from "next/link";
import { Hammer, CalendarClock, AlertTriangle, ShieldCheck } from "lucide-react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { serviceSchema, webPageSchema, faqSchema } from "../../../../lib/schema";
import PageCTAButton from "../../../../components/PageCTAButton";
import SectionLink from "../../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Home Renovation in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Renovating a home you already live in is a different job from fitting out an empty flat. How sequencing, older-building constraints and living through the work are handled — from a Kolkata studio with 35+ years in interiors.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/services/home-renovation`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website", siteName: "Avaya Udyog", title: TITLE,
    description: DESCRIPTION, url: PAGE_URL, images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

/**
 * Renovation.
 *
 * Evidenced, not invented: "Renovation" is a project type in the CRM's own
 * project registration form (components/crm/CustomerProjectPipeline.jsx).
 *
 * Image-free for the same reason as the modular kitchen page — every
 * photograph in this repository is stock, and a renovation page illustrated
 * with stock "before and after" imagery would be fabricating project evidence.
 * Before-and-after is the natural illustration here and it is exactly the thing
 * that cannot be faked, so the page carries none.
 *
 * The differentiator written here is genuine and checkable against the site's
 * own published copy: design and execution under one roof, which matters far
 * more in renovation than in a new fit-out because the unknowns appear mid-job.
 */

const service = serviceSchema({
  name: "Home Renovation",
  description: "Renovation of occupied homes — sequencing, structural and cosmetic work, and turnkey execution.",
  url: PAGE_URL,
});
const webPage = webPageSchema({ url: PAGE_URL, name: TITLE, description: DESCRIPTION, about: `${PAGE_URL}#service` });

const DIFFERENCES = [
  {
    title: "The space is not empty",
    text: "A fit-out starts with bare rooms. A renovation starts with your furniture, your belongings and often you still living there. That single fact drives the sequencing, the dust control, and which rooms can be worked on at once.",
  },
  {
    title: "You cannot see everything up front",
    text: "Behind old tiles and false ceilings there is wiring, plumbing and occasionally damp that nobody knew about. An honest renovation plan carries room for what is found on opening up — a plan that pretends otherwise simply moves the conversation to later, when it is more expensive.",
  },
  {
    title: "Older buildings have their own rules",
    text: "Beam positions, load-bearing walls, existing electrical loads and the age of the plumbing all constrain what is possible. Some of what a client wants will be straightforward, some will need rerouting, and occasionally something is genuinely not worth doing.",
  },
  {
    title: "The building has neighbours",
    text: "Lift access, permitted working hours, service-lift bookings and society rules shape the schedule in a way they never do on an empty site. Better to know the building's constraints before the schedule is written than after.",
  },
];

const SCOPE = [
  { label: "Cosmetic", text: "Finishes, paint, flooring, lighting, joinery and styling. No structural change, shortest disruption." },
  { label: "Full-room", text: "A kitchen or bathroom taken back and rebuilt, including plumbing and electrical points that move." },
  { label: "Full-home", text: "Layout reconsidered across the whole flat — often the point at which moving out for a period becomes the sensible choice." },
  { label: "Structural", text: "Anything affecting walls, beams or loads. Requires proper assessment and sometimes the answer is no." },
];

const FAQS = [
  {
    q: "Can we stay in the house during the renovation?",
    a: "Sometimes, and it depends far more on scope than on size. Cosmetic work room-by-room is usually livable. A full-home renovation with plumbing and electrical work rarely is, and pretending otherwise leads to families living in one room for far longer than anyone intended. We would rather have that conversation honestly at the planning stage.",
  },
  {
    q: "How is renovation different from interior design?",
    a: "Design decides what the space should become; renovation is the work of getting an existing space there, around everything already in it. Most renovation projects need both, which is the case for design and execution sitting with the same team — when something unexpected is found on site, the person who has to solve it is the person who designed it.",
  },
  {
    q: "What does a renovation cost?",
    a: "There is no single rate, because the range is wider here than in any other kind of interiors work. Repainting and re-flooring a flat and rebuilding its kitchens and bathrooms are different orders of magnitude. What genuinely drives it: how much is being taken back to the shell, whether plumbing and electrical points move, and what is found once work opens up. Costing is discussed during consultation, once the scope is real.",
  },
  {
    q: "What if you find a problem after starting?",
    a: "It happens on older buildings and it is the single most common reason renovations run over. Our preference is to open up and inspect the known risk areas as early as possible rather than late, so that any bad news arrives while the plan can still absorb it.",
  },
  {
    q: "Do you handle the work, or only the drawings?",
    a: "Both. Turnkey execution is part of what the studio does, so the same team that designs the renovation coordinates the site through to handover rather than passing it to a separate contractor midway.",
  },
];
const faq = faqSchema(FAQS);

export default function HomeRenovationPage() {
  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs items={[
          { name: "Home", path: "/" },
          { name: "Home Renovation", path: "/services/home-renovation" },
        ]} />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="max-w-3xl">
            <span className="eyebrow">Renovation</span>
            <h1 className="display mt-6 text-[2.5rem] leading-[1.06] text-ink sm:text-5xl">
              Reworking a home
              <br /><span className="accent text-sage-600">you already live in.</span>
            </h1>
            <p className="mt-7 text-[1.04rem] leading-[1.85] text-ink-soft">
              Renovation is not a fit-out with furniture in the way. It is a different job
              with different risks — unknowns behind the walls, a building with its own
              rules, and a family who has to keep living somewhere while it happens. This
              page is about how those parts are handled, because they are what actually
              decides whether a renovation goes well.
            </p>
            <div className="mt-9">
              <PageCTAButton triggerSource="renovation_cta">Book a Consultation</PageCTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Why It Differs</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              Four things that change <span className="accent text-sage-600">everything.</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {DIFFERENCES.map(({ title, text }) => (
              <div key={title} className="rounded-[1.25rem] border border-line bg-canvas p-7">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={15} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                  <h3 className="font-display text-[1.16rem] font-semibold text-ink">{title}</h3>
                </div>
                <p className="mt-3.5 text-[0.93rem] leading-[1.8] text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">Scope</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              How far back <span className="accent text-sage-600">you go.</span>
            </h2>
            <p className="mt-5 text-[0.98rem] leading-[1.8] text-ink-soft">
              Deciding this early is what keeps a renovation predictable. Most projects
              sit in one band and drift upward only when something is found. On whether
              you can stay in the house while it happens, see{" "}
              <Link href="/insights/living-at-home-during-renovation" className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900">
                living at home during a renovation
              </Link>.
            </p>
          </div>
          <ol className="mt-12 space-y-3">
            {SCOPE.map(({ label, text }, i) => (
              <li key={label} className="grid grid-cols-[auto_1fr] gap-5 rounded-[1.25rem] border border-line bg-white p-6 shadow-hair">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-display text-[0.8rem] font-semibold text-sage-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-[1.14rem] font-semibold text-ink">{label}</h3>
                  <p className="mt-1.5 text-[0.93rem] leading-[1.8] text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-sage-900 !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <CalendarClock size={17} className="text-gold-light" aria-hidden="true" />
              <span className="eyebrow !text-gold-light !mb-0">Sequencing</span>
            </div>
            <h2 className="display mt-6 text-[2.1rem] text-white sm:text-4xl">
              The order matters more <span className="accent text-gold-light">than the speed.</span>
            </h2>
            <p className="mt-6 text-[0.99rem] leading-[1.85] text-white/75">
              Renovations rarely fail because a trade was slow. They fail because work was
              done in the wrong order and had to be undone — flooring laid before the
              plumbing was proven, painting finished before the electrical was signed off.
              Sequencing is the least visible part of the job and the part that most
              determines whether it stays on schedule.
            </p>
            <p className="mt-4 text-[0.99rem] leading-[1.85] text-white/75">
              It is also the strongest argument for design and execution sitting with the
              same team. When something unexpected turns up behind a wall, the decision
              about what to do next is a design decision and a site decision at the same
              moment.
            </p>
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-[2.4rem]">
                What people ask <span className="accent text-sage-600">first.</span>
              </h2>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[1.1rem] font-semibold leading-snug text-ink group-hover:text-sage-700">{q}</h3>
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-600 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-2xl pb-7 pr-12 text-[0.94rem] leading-[1.85] text-ink-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-10 md:px-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={17} className="text-gold-deep" aria-hidden="true" />
                <span className="text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">Design and execution, one team</span>
              </div>
              <h2 className="mt-4 font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                Start with a walk through the space.
              </h2>
              <p className="mt-3 text-[0.97rem] leading-[1.8] text-ink-soft">
                Renovation is difficult to scope in the abstract. Seeing the rooms, the
                building and the existing services is what turns a vague idea into a plan
                anyone can cost.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <PageCTAButton triggerSource="renovation_footer_cta">Book a Consultation</PageCTAButton>
                <Link href="/services/modular-kitchen" className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900">
                  Modular kitchens
                </Link>
                <SectionLink href="/#how-we-work" className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900">
                  Our process
                </SectionLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
