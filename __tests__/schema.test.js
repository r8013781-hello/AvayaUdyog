import { describe, it, expect } from "vitest";
import {
  BUSINESS_ID,
  WEBSITE_ID,
  localBusinessSchema,
  websiteSchema,
  breadcrumbSchema,
  serviceSchema,
  webPageSchema,
  articleSchema,
} from "../lib/schema";
import { INSIGHTS } from "../lib/insights";

const URL = "https://avayaudyog.com/services/residential-interior-design";

/** Collect every bare {"@id": ...} reference in a node. */
function references(node, acc = []) {
  if (Array.isArray(node)) node.forEach((n) => references(n, acc));
  else if (node && typeof node === "object") {
    const keys = Object.keys(node);
    if (keys.length === 1 && keys[0] === "@id") acc.push(node["@id"]);
    else keys.forEach((k) => k !== "@id" && references(node[k], acc));
  }
  return acc;
}

describe("entity graph", () => {
  it("gives the business and site stable identifiers", () => {
    expect(localBusinessSchema["@id"]).toBe(BUSINESS_ID);
    expect(websiteSchema["@id"]).toBe(WEBSITE_ID);
  });

  it("points the site at the business instead of duplicating it", () => {
    expect(websiteSchema.publisher).toEqual({ "@id": BUSINESS_ID });
    // A second copy of the business details would create a competing node.
    expect(websiteSchema.publisher.name).toBeUndefined();
  });

  it("references the business from a Service rather than restating it", () => {
    const svc = serviceSchema({ name: "X", description: "Y", url: URL });
    expect(svc.provider).toEqual({ "@id": BUSINESS_ID });
    expect(svc["@id"]).toBe(`${URL}#service`);
  });

  it("resolves every WebPage reference against nodes that exist on the page", () => {
    const page = webPageSchema({
      url: URL,
      name: "Title",
      description: "Desc",
      about: `${URL}#service`,
    });
    const crumbs = breadcrumbSchema([{ name: "Home", url: "https://avayaudyog.com/" }], URL);
    const svc = serviceSchema({ name: "X", description: "Y", url: URL });

    const available = new Set(
      [localBusinessSchema, websiteSchema, page, crumbs, svc].map((n) => n["@id"]),
    );
    references(page).forEach((ref) => expect(available).toContain(ref));
  });

  it("omits `about` when a page maps to no single service", () => {
    const hub = webPageSchema({ url: URL, name: "Hub", description: "D" });
    expect(hub.about).toBeUndefined();
  });

  it("makes a breadcrumb list addressable only when given a page url", () => {
    expect(breadcrumbSchema([], URL)["@id"]).toBe(`${URL}#breadcrumb`);
    expect(breadcrumbSchema([])["@id"]).toBeUndefined();
  });
});

describe("claims embedded in schema", () => {
  it("declares the confirmed pan-India coverage and the Kolkata base", () => {
    // Coverage is PAN-INDIA (owner-confirmed). Kolkata is the base and the
    // strongest local market, so both are stated: the Country node is the
    // true extent of the service, the City node is the established local
    // presence that `address` corroborates.
    expect(localBusinessSchema.areaServed).toEqual([
      { "@type": "Country", name: "India" },
      { "@type": "City", name: "Kolkata" },
    ]);
  });

  it("names no city the business has not established", () => {
    // Salt Lake, New Town, Ballygunge, Alipore and Howrah were once declared
    // here with no evidence anywhere in the repository. Widening coverage to
    // India must not become licence to re-introduce a per-locality list: an
    // unevidenced city is a claim, and thirty of them is a doorway network.
    const cities = localBusinessSchema.areaServed
      .filter((area) => area["@type"] === "City")
      .map((area) => area.name);
    expect(cities).toEqual(["Kolkata"]);
  });

  it("keeps exactly one business node with one real address", () => {
    // Pan-India coverage is expressed by areaServed, never by cloning the
    // LocalBusiness per city — each clone would claim a staffed premises.
    const json = JSON.stringify(localBusinessSchema);
    expect(json.match(/"@id":/g)).toHaveLength(1);
    expect(json.match(/PostalAddress/g)).toHaveLength(1);
    expect(localBusinessSchema.address.addressLocality).toBe("Kolkata");
    expect(localBusinessSchema.address.addressCountry).toBe("IN");
  });

  it("does not restate coverage on every page's Service node", () => {
    // The organization-level declaration is the single source; repeating it
    // per page is the duplication this graph was built to avoid.
    const svc = serviceSchema({ name: "X", description: "Y", url: URL });
    expect(svc.areaServed).toBeUndefined();
  });

  it("declares no rating, review count or sameAs it cannot support", () => {
    const json = JSON.stringify(localBusinessSchema);
    expect(json).not.toMatch(/aggregateRating|ratingValue|reviewCount/);
    // sameAs may return once real profile URLs exist — not before.
    expect(localBusinessSchema.sameAs).toBeUndefined();
  });
});

describe("articleSchema", () => {
  const ARTICLE_URL = "https://avayaudyog.com/insights/materials-for-kolkata-climate";

  it("attributes authorship and publishing to the business, not an invented person", () => {
    const article = articleSchema({
      url: ARTICLE_URL,
      headline: "Title",
      description: "Desc",
      datePublished: "2026-08-23",
    });
    expect(article.author).toEqual({ "@id": BUSINESS_ID });
    expect(article.publisher).toEqual({ "@id": BUSINESS_ID });
    // No Person node, no byline string — nothing here claims a named writer.
    expect(JSON.stringify(article)).not.toMatch(/"@type":"Person"/);
  });

  it("ties the article to its own WebPage node by @id rather than duplicating it", () => {
    const article = articleSchema({ url: ARTICLE_URL, headline: "T", description: "D", datePublished: "2026-08-23" });
    expect(article.mainEntityOfPage).toEqual({ "@id": `${ARTICLE_URL}#webpage` });
    expect(article["@id"]).toBe(`${ARTICLE_URL}#article`);
  });

  it("omits dateModified when the article has no genuinely tracked edit date", () => {
    const article = articleSchema({ url: ARTICLE_URL, headline: "T", description: "D", datePublished: "2026-08-23" });
    expect(article.dateModified).toBeUndefined();
  });

  it("includes dateModified only when one is explicitly and truthfully supplied", () => {
    const article = articleSchema({
      url: ARTICLE_URL,
      headline: "T",
      description: "D",
      datePublished: "2026-08-23",
      dateModified: "2026-08-24",
    });
    expect(article.dateModified).toBe("2026-08-24");
  });

  it("every insight has a real, non-empty published date to build datePublished from", () => {
    // Guards the one fact this schema depends on entirely: lib/insights.js
    // must keep providing a truthful `published` date for every article, or
    // the Article schema would have to fabricate one.
    INSIGHTS.forEach((insight) => {
      expect(insight.published, `${insight.slug} has no published date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("never claims a dateModified for an insight that has no tracked `updated` field", () => {
    // Only interior-design-cost-kolkata currently has a genuine `updated`
    // date. Every other insight must keep resolving to no dateModified at
    // all in the pages that build their own articleSchema() call.
    INSIGHTS.filter((i) => i.slug !== "interior-design-cost-kolkata").forEach((insight) => {
      expect(insight.updated, `${insight.slug} unexpectedly has an 'updated' field`).toBeUndefined();
    });
  });
});
