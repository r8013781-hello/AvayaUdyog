import Link from "next/link";
import { ArrowUpRight, Home, Building2, CookingPot, Hammer, MessagesSquare, Layers } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { webPageSchema } from "../../../lib/schema";
import PageCTAButton from "../../../components/PageCTAButton";
import StatStrip from "../../../components/StatStrip";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Interior Design Services in Kolkata | Avaya Udyog";
const DESCRIPTION =
  "Residential and commercial interior design, modular kitchens, renovation and turnkey execution in Kolkata — the full range of work Avaya Udyog takes on, and how each is delivered.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/services`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    siteName: "Avaya Udyog",
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const webPage = webPageSchema({
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
});

/**
 * The services hub.
 *
 * Its job is structural: distribute homepage authority into the individual
 * service pages, which previously had a single inbound internal link each and
 * were effectively orphaned.
 *
 * Note the mixed URL shapes below. Residential and commercial still live at
 * their original flat keyword URLs because moving them requires 301 redirects,
 * and the deployment host for this static export is not identified anywhere in
 * the repository (see the execution report). New service pages are created
 * under /services/* so that when the redirects become possible, the two older
 * pages join a structure that already exists rather than one built around them.
 *
 * Every service listed here is one the business actually operates — the four
 * on the homepage, plus modular kitchens and renovation, both of which appear
 * as project types in the CRM's own registration form and in the published
 * residential copy. Nothing here is an invented service line.
 */

const SERVICES = [
  {
    icon: Home,
    title: "Residential Interiors",
    href: "/residential-interior-designer-kolkata",
    text: "Full-home interiors for flats and houses — layouts, finishes and the detail work that decides whether a home feels considered or merely furnished.",
    scope: ["Living rooms", "Bedrooms", "Kitchens", "Dining"],
  },
  {
    icon: Building2,
    title: "Commercial Spaces",
    href: "/commercial-interior-designer-kolkata",
    text: "Offices and retail environments designed to hold up to daily use and to say something accurate about the business occupying them.",
    scope: ["Offices", "Retail", "Workspaces"],
  },
  {
    icon: CookingPot,
    title: "Modular Kitchens",
    href: "/services/modular-kitchen",
    text: "Kitchens planned around how you actually cook and host, then built with cabinetry and hardware chosen to survive that use for years.",
    scope: ["Layout planning", "Cabinetry", "Hardware", "Finishes"],
  },
  {
    icon: Hammer,
    title: "Renovation",
    href: "/services/home-renovation",
    text: "Reworking a space you already live in — a different problem from fitting out an empty flat, and one that has to be sequenced around your life.",
    scope: ["Full-home", "Room-level", "Sequencing"],
  },
  {
    icon: MessagesSquare,
    title: "Design Consultation",
    href: null,
    text: "Concept development, material guidance and clear design direction that turn rough ideas into a refined, buildable vision.",
    scope: ["Concepts", "Material guidance", "Direction"],
  },
  {
    icon: Layers,
    title: "Turnkey Execution",
    href: null,
    text: "From first sketch to final styling, we manage every detail so the project feels effortless from start to finish rather than becoming something you coordinate.",
    scope: ["Site coordination", "Finishing", "Handover"],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]}
        />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="max-w-3xl">
            <span className="eyebrow">What We Do</span>
            <h1 className="display mt-6 text-[2.6rem] leading-[1.05] text-ink sm:text-5xl">
              Interior design services
              <br />
              <span className="accent text-sage-600">in Kolkata.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-[1.05rem] leading-[1.85] text-ink-soft">
              Avaya Udyog has worked on interiors in Kolkata for over 35 years, led by
              Mr. Biswanath Adhikari. The range below is deliberately narrow: design and
              execution under one roof, for homes and for the places people work. We take
              a project from the first conversation to the day it is handed over, so
              nothing is passed to a separate contractor midway.
            </p>

            <div className="mt-9">
              <PageCTAButton triggerSource="services_hub_cta">
                Book a Consultation
              </PageCTAButton>
            </div>

            <StatStrip className="mt-12" />
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">The Work</span>
            <h2 className="display mt-6 text-[2.2rem] text-ink sm:text-4xl">
              Six ways a project <span className="accent text-sage-600">takes shape.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, href, text, scope }) => {
              const inner = (
                <>
                  <div className="flex items-center gap-3">
                    <Icon size={17} strokeWidth={1.7} className="text-gold-deep" aria-hidden="true" />
                    <h3 className="font-display text-[1.3rem] font-semibold text-ink">{title}</h3>
                  </div>
                  <p className="mt-3.5 text-[0.94rem] leading-[1.8] text-ink-muted">{text}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {scope.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line-strong px-3 py-1 text-[0.68rem] font-semibold text-ink-soft"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  {href && (
                    <span className="mt-6 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-label text-sage-700">
                      Read more
                      <ArrowUpRight size={14} />
                    </span>
                  )}
                </>
              );

              return href ? (
                <Link
                  key={title}
                  href={href}
                  className="group flex flex-col rounded-[1.5rem] border border-line bg-canvas p-7 transition-colors hover:border-sage-300 hover:bg-white"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={title}
                  className="flex flex-col rounded-[1.5rem] border border-line bg-canvas p-7"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-10 md:px-12 md:py-12">
            <div className="max-w-xl">
              <h2 className="font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                Not sure which of these you need?
              </h2>
              <p className="mt-3 text-[0.98rem] leading-[1.8] text-ink-soft">
                Most projects start as a conversation rather than a brief. Tell us about
                the space and we will say plainly what it needs — and what it does not.
                Full walkthroughs, drawings and material boards are shared during
                consultation.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <PageCTAButton triggerSource="services_hub_footer_cta">
                  Book a Consultation
                </PageCTAButton>
                <Link
                  href="/process"
                  className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
                >
                  See how we work
                </Link>
                <Link
                  href="/about"
                  className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
                >
                  About the studio
                </Link>
                <Link
                  href="/insights"
                  className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
                >
                  Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
