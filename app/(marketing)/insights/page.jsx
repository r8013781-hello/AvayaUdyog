import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { webPageSchema } from "../../../lib/schema";
import { listInsights } from "../../../lib/insights";
import PageCTAButton from "../../../components/PageCTAButton";
import SectionLink from "../../../components/SectionLink";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Interior Design Insights | Avaya Udyog, Kolkata";
const DESCRIPTION =
  "Practical guidance on interiors in Kolkata — materials, consultations and renovation — written from 35+ years of working on homes and commercial spaces in the city.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;
const PAGE_URL = `${SITE_URL}/insights`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", siteName: "Avaya Udyog", title: TITLE, description: DESCRIPTION, url: PAGE_URL, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const webPage = webPageSchema({ url: PAGE_URL, name: TITLE, description: DESCRIPTION });

export default function InsightsPage() {
  const insights = listInsights();

  return (
    <div className="bg-canvas">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />

      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }]} />
      </div>

      <section className="section !pt-10">
        <div className="shell relative">
          <div className="max-w-3xl">
            <span className="eyebrow">Insights</span>
            <h1 className="display mt-6 text-[2.5rem] leading-[1.06] text-ink sm:text-5xl">
              What we have learned
              <br />
              <span className="accent text-sage-600">worth writing down.</span>
            </h1>
            <p className="mt-7 text-[1.04rem] leading-[1.85] text-ink-soft">
              Practical guidance on the decisions that actually shape an interiors
              project — what materials do in this climate, what a consultation is for,
              and what renovation really involves. Written from what the studio has seen
              go right and wrong over 35 years in Kolkata.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-sage-50/50 !py-20">
        <div className="shell relative">
          <ul className="space-y-4">
            {insights.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/insights/${post.slug}`}
                  className="group flex flex-col gap-4 rounded-[1.5rem] border border-line bg-canvas p-7 transition-colors hover:border-sage-300 hover:bg-white md:p-9"
                >
                  <div className="flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">
                    <BookOpen size={14} strokeWidth={1.7} aria-hidden="true" />
                    <span>{post.readingMinutes} min read</span>
                  </div>
                  <h2 className="font-display text-[1.45rem] font-semibold leading-snug text-ink transition-colors group-hover:text-sage-700 sm:text-[1.7rem]">
                    {post.title}
                  </h2>
                  <p className="max-w-2xl text-[0.96rem] leading-[1.8] text-ink-muted">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-label text-sage-700">
                    Read
                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section !pt-0 !pb-24">
        <div className="shell relative">
          <div className="rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-10 md:px-12">
            <div className="max-w-xl">
              <h2 className="font-display text-[1.6rem] font-semibold text-ink sm:text-[1.9rem]">
                Rather ask us directly?
              </h2>
              <p className="mt-3 text-[0.97rem] leading-[1.8] text-ink-soft">
                Most questions are quicker to answer in front of the actual space. Full
                walkthroughs, drawings and material boards are shared during consultation.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <PageCTAButton triggerSource="insights_hub_cta">Book a Consultation</PageCTAButton>
                <SectionLink href="/#services" className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900">
                  See what we do
                </SectionLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
