import Link from "next/link";
import { Award, HeartHandshake, Layers, ArrowUpRight } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { webPageSchema } from "../../../lib/schema";
import PageCTAButton from "../../../components/PageCTAButton";
import StatStrip from "../../../components/StatStrip";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "About Avaya Udyog | Interior Design Studio in Kolkata";
const DESCRIPTION =
  "Avaya Udyog is a Kolkata interior design studio led by Mr. Biswanath Adhikari, with over 35 years of experience across residential and commercial interiors.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/about`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "profile", siteName: "Avaya Udyog", title: TITLE, description: DESCRIPTION, url: PAGE_URL, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const webPage = webPageSchema({ url: PAGE_URL, name: TITLE, description: DESCRIPTION });

/**
 * About.
 *
 * Every fact here is already published on this site: the founder's name and
 * 35+ years (AboutCompany.jsx), the three confirmed figures (pinned in
 * __tests__/claims.test.js, confirmed by the owner on 2026-08-23), the studio's
 * promise, and the four service lines.
 *
 * Deliberately NOT here: founding year, team size, qualifications,
 * certifications, awards, office address, named clients or named projects.
 * None of them appears anywhere in the repository, and this is the page where
 * an invented credential would do the most damage — it is the page people read
 * specifically to decide whether to trust the business.
 *
 * The only photograph is the founder's own portrait, which is genuine. No
 * interior photography: it is all stock, and an About page is where "here is
 * our work" is most strongly implied.
 */

const PRINCIPLES = [
  {
    icon: Award,
    title: "A legacy of craft",
    text: "Three and a half decades of design leadership, built on trust, taste and timeless execution. Experience of that length mostly shows up in the unglamorous places — knowing which materials fail early, which layouts people stop using after a month, and what actually goes wrong on site.",
  },
  {
    icon: Layers,
    title: "Design and execution together",
    text: "The studio designs and executes. That matters most when something unexpected appears mid-project, because the person who has to solve it is the person who designed it — there is no handover to a separate contractor where responsibility quietly changes hands.",
  },
  {
    icon: HeartHandshake,
    title: "Home-like service",
    text: "Warmth, care and a personal commitment to every project. Interiors work is disruptive by nature and clients live with the disruption — how a studio behaves during that period is as much a part of the work as the drawings.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="max-w-3xl">
            <span className="eyebrow">The Studio</span>
            <h1 className="display mt-6 text-[2.5rem] leading-[1.06] text-ink sm:text-5xl">
              Thirty-five years
              <br />
              <span className="accent text-sage-600">of Kolkata interiors.</span>
            </h1>
            <p className="mt-7 text-[1.04rem] leading-[1.85] text-ink-soft">
              Avaya Udyog is an interior design studio in Kolkata, West Bengal, led by
              Mr. Biswanath Adhikari. The studio works across residential and commercial
              interiors, and takes projects from the first conversation through to
              handover rather than stopping at the drawings.
            </p>
            <StatStrip className="mt-12" />
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:items-start">
            <figure className="overflow-hidden rounded-[1.5rem] border border-line bg-sage-100 shadow-soft">
              <img
                src="/BISWANATH.jpeg"
                alt="Mr. Biswanath Adhikari, Founder and Director of Avaya Udyog"
                loading="lazy"
                decoding="async"
                className="h-[24rem] w-full object-cover object-top sm:h-[30rem]"
              />
              <figcaption className="border-t border-line bg-canvas px-6 py-5">
                <p className="font-display text-[1.15rem] font-semibold text-ink">Mr. Biswanath Adhikari</p>
                <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-label text-sage-600">
                  Founder &amp; Director
                </p>
              </figcaption>
            </figure>

            <div>
              <span className="eyebrow">The Founder</span>
              <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
                The person the studio <span className="accent text-sage-600">is built around.</span>
              </h2>
              <blockquote className="mt-8 border-l-2 border-gold/50 pl-6">
                <p className="font-display text-[1.35rem] font-medium italic leading-[1.55] text-ink sm:text-[1.5rem]">
                  Every space we design carries a simple promise — it should feel like
                  home the moment you step in, and feel like heirloom for years to come.
                </p>
              </blockquote>
              <p className="mt-8 text-[1rem] leading-[1.85] text-ink-soft">
                With over 35 years of industry experience, Mr. Biswanath Adhikari has
                built Avaya Udyog on thoughtful design, reliable craftsmanship and a
                deeply personal approach to every project. His guidance shapes every home
                and commercial space into something warm, functional and luxurious in
                equal measure.
              </p>
              <p className="mt-4 text-[1rem] leading-[1.85] text-ink-soft">
                That length of practice is the studio&apos;s most useful asset. Interiors
                is a field where the same mistakes repeat, and where knowing in advance
                what will not work saves more money than any single clever idea.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section !py-20">
        <div className="shell relative">
          <div className="max-w-2xl">
            <span className="eyebrow">How We Think</span>
            <h2 className="display mt-6 text-[2.1rem] text-ink sm:text-4xl">
              Three things that shape <span className="accent text-sage-600">every project.</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.5rem] border border-line bg-white p-7 shadow-hair">
                <Icon size={19} strokeWidth={1.6} className="text-gold-deep" aria-hidden="true" />
                <h3 className="mt-5 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-[0.93rem] leading-[1.8] text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-10 md:px-12">
            <div className="max-w-xl">
              <h2 className="font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                See how a project actually runs.
              </h2>
              <p className="mt-3 text-[0.97rem] leading-[1.8] text-ink-soft">
                The four stages every Avaya Udyog project moves through, from the first
                conversation to the day the space is handed over.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <Link href="/process" className="btn-primary group">
                  Our process
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <PageCTAButton triggerSource="about_cta">Book a Consultation</PageCTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
