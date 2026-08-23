import Link from "next/link";
import { breadcrumbSchema } from "../lib/schema";

const SITE_URL = "https://avayaudyog.com";

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD, built from one
 * `items` array (`{ name, path }`, Home first, current page last) so the
 * two can never drift apart. No client JS — plain Links, server-rendered.
 */
export default function Breadcrumbs({ items }) {
  // The last item is always the current page, so its URL is the one the
  // WebPage node references this list by.
  const pageUrl = `${SITE_URL}${items[items.length - 1].path}`;
  const schema = breadcrumbSchema(
    items.map((item) => ({ name: item.name, url: `${SITE_URL}${item.path}` })),
    pageUrl,
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="text-[0.8rem] text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span className="font-semibold text-ink">{item.name}</span>
                ) : (
                  <Link href={item.path} className="transition-colors hover:text-sage-700">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
