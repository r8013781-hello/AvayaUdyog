import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import { listInsights } from "../lib/insights";
import PageCTAButton from "./PageCTAButton";

/**
 * Shared shell for an insights article.
 *
 * Server component — articles are static prose, so none of this needs to ship
 * JavaScript. The body is passed as children so each article owns its own
 * content while the chrome, breadcrumbs, service cross-link and CTA stay
 * identical across all of them.
 *
 * Every article MUST link back to its owning service page; that link is
 * rendered here rather than left to each article to remember, because an
 * article that sends research traffic nowhere commercial is decoration.
 *
 * No images. Every photograph in this repository is stock, and an article
 * about materials or renovation is precisely where a stock photo would read
 * as "here is our work".
 */
export default function InsightArticle({ insight, children }) {
  // Every other article. Real related reading rather than link padding — with
  // three articles this is genuinely "the rest of the series", and it keeps
  // each one reachable from more than just the hub.
  const others = listInsights().filter((i) => i.slug !== insight.slug);

  return (
    <div className="bg-canvas">
      <div className="shell pt-32 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: insight.title, path: `/insights/${insight.slug}` },
          ]}
        />
      </div>

      <article className="section !pt-10">
        <div className="shell relative">
          <header className="max-w-3xl">
            <div className="flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">
              <BookOpen size={14} strokeWidth={1.7} aria-hidden="true" />
              <span>{insight.readingMinutes} min read</span>
            </div>
            <h1 className="display mt-6 text-[2.3rem] leading-[1.1] text-ink sm:text-[3rem]">
              {insight.title}
            </h1>
            <p className="mt-6 text-[1.06rem] leading-[1.85] text-ink-soft">{insight.excerpt}</p>
          </header>

          <div className="hair-gold my-12 max-w-3xl" />

          {/* Article body. `prose-insight` styling lives here rather than in
              each article so every one reads identically. */}
          <div className="max-w-[42rem] space-y-6 text-[1rem] leading-[1.9] text-ink-soft [&>h2]:mt-14 [&>h2]:font-display [&>h2]:text-[1.55rem] [&>h2]:font-semibold [&>h2]:leading-snug [&>h2]:text-ink [&>h3]:mt-10 [&>h3]:font-display [&>h3]:text-[1.2rem] [&>h3]:font-semibold [&>h3]:text-ink [&>ul]:space-y-2.5 [&>ul]:pl-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-ink">
            {children}
          </div>

          <div className="mt-16 max-w-[42rem] rounded-[1.5rem] border border-line bg-white p-7 shadow-hair">
            <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">
              Related service
            </p>
            <Link
              href={insight.owningService.href}
              className="group mt-3 inline-flex items-center gap-2 font-display text-[1.25rem] font-semibold text-ink transition-colors hover:text-sage-700"
            >
              {insight.owningService.label}
              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="section !pt-4 !pb-0">
          <div className="shell relative">
            <div className="max-w-[42rem]">
              <p className="text-[0.62rem] font-bold uppercase tracking-label text-sage-600">
                More insights
              </p>
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {others.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/insights/${post.slug}`}
                      className="group flex items-start justify-between gap-6 py-5"
                    >
                      <span className="font-display text-[1.1rem] font-semibold leading-snug text-ink transition-colors group-hover:text-sage-700">
                        {post.title}
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="mt-1 shrink-0 text-sage-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="section !pt-4 !pb-24">
        <div className="shell relative">
          <div className="max-w-[42rem] rounded-[1.75rem] border border-line-gold bg-gold-soft/45 px-7 py-9 md:px-10">
            <h2 className="font-display text-[1.45rem] font-semibold text-ink">
              Questions about your own space?
            </h2>
            <p className="mt-2.5 text-[0.95rem] leading-[1.8] text-ink-soft">
              General guidance only goes so far. Full walkthroughs, drawings and material
              boards are shared during consultation, against your actual rooms.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <PageCTAButton triggerSource={`insight_${insight.slug}_cta`}>
                Book a Consultation
              </PageCTAButton>
              <Link
                href="/insights"
                className="text-[0.78rem] font-bold uppercase tracking-label text-sage-700 underline underline-offset-4 hover:text-sage-900"
              >
                More insights
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
