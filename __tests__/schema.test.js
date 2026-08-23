import { describe, it, expect } from "vitest";
import {
  BUSINESS_ID,
  WEBSITE_ID,
  localBusinessSchema,
  websiteSchema,
  breadcrumbSchema,
  serviceSchema,
  webPageSchema,
} from "../lib/schema";

const URL = "https://avayaudyog.com/residential-interior-designer-kolkata";

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
  it("declares only the service area the business has established", () => {
    // Salt Lake, New Town, Ballygunge, Alipore and Howrah were declared here
    // with no evidence anywhere in the repository. An unverified service area
    // invites local queries the business may not be able to serve.
    expect(localBusinessSchema.areaServed).toEqual([
      { "@type": "City", name: "Kolkata" },
    ]);
  });

  it("declares no rating, review count or sameAs it cannot support", () => {
    const json = JSON.stringify(localBusinessSchema);
    expect(json).not.toMatch(/aggregateRating|ratingValue|reviewCount/);
    // sameAs may return once real profile URLs exist — not before.
    expect(localBusinessSchema.sameAs).toBeUndefined();
  });
});
