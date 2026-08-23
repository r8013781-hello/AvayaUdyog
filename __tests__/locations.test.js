import { describe, it, expect } from "vitest";
import {
  LOCATIONS,
  isPublishable,
  publishableLocations,
  candidateLocations,
  clusterFor,
  evidenceGates,
} from "../lib/locations";

/**
 * The location architecture must scale to 20-30+ markets while publishing
 * none of them without evidence. These tests are the enforcement.
 */

describe("market map", () => {
  it("covers a research universe of 25-35 markets", () => {
    expect(LOCATIONS.length).toBeGreaterThanOrEqual(25);
    expect(LOCATIONS.length).toBeLessThanOrEqual(40);
  });

  it("gives every location a unique slug", () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every location a rationale, primary keyword and doorway rating", () => {
    LOCATIONS.forEach((l) => {
      expect(l.rationale, `${l.slug} has no rationale`).toBeTruthy();
      expect(l.primary, `${l.slug} has no primary keyword`).toBeTruthy();
      expect(l.doorwayRisk, `${l.slug} has no doorway rating`).toBeTruthy();
    });
  });
});

describe("publication gate", () => {
  it("publishes NOTHING today", () => {
    // The single most important assertion in this file. If it ever fails
    // without a deliberate evidence entry, a doorway page is about to ship.
    expect(publishableLocations()).toEqual([]);
  });

  it("requires all four gates, not three", () => {
    const almost = {
      slug: "test", name: "Test", page: true, primary: "x", rationale: "y", doorwayRisk: "low",
      evidence: { coverageConfirmedBy: "owner", localContent: true },
    };
    // Missing project evidence.
    expect(isPublishable(almost)).toBe(false);
    expect(evidenceGates(almost).project).toBe(false);

    const complete = {
      ...almost,
      evidence: {
        ...almost.evidence,
        projectSlug: "some-project",
        photographyPermission: true,
      },
    };
    expect(isPublishable(complete)).toBe(true);
  });

  it("never publishes a location absorbed by another", () => {
    // Even with full evidence, an absorbed location must not get its own page
    // — that is the cannibalisation the clusters exist to prevent.
    const absorbed = {
      slug: "rajarhat", name: "Rajarhat", page: true, absorbedBy: "new-town",
      primary: "x", rationale: "y", doorwayRisk: "high",
      evidence: {
        coverageConfirmedBy: "owner", localContent: true,
        projectSlug: "p", photographyPermission: true,
      },
    };
    expect(isPublishable(absorbed)).toBe(false);
  });
});

describe("clusters", () => {
  it("keeps absorption consistent in both directions", () => {
    LOCATIONS.forEach((loc) => {
      (loc.absorbs || []).forEach((slug) => {
        const child = LOCATIONS.find((l) => l.slug === slug);
        if (child) {
          expect(child.absorbedBy, `${slug} is absorbed by ${loc.slug} but does not say so`).toBe(loc.slug);
        }
      });
      if (loc.absorbedBy) {
        const parent = LOCATIONS.find((l) => l.slug === loc.absorbedBy);
        expect(parent, `${loc.slug} names a parent that does not exist`).toBeTruthy();
      }
    });
  });

  it("never marks an absorbed location as its own page", () => {
    LOCATIONS.filter((l) => l.absorbedBy).forEach((l) => {
      expect(l.page, `${l.slug} is both absorbed and its own page`).toBe(false);
    });
  });

  it("resolves the New Town / Rajarhat conflict the roadmap identified", () => {
    expect(clusterFor("new-town").absorbs).toContain("rajarhat");
    expect(clusterFor("rajarhat").absorbedBy).toBe("new-town");
  });

  it("resolves Alipore / New Alipore", () => {
    expect(clusterFor("alipore").absorbs).toContain("new-alipore");
  });

  it("keeps Sector V separate from Salt Lake — different buyer entirely", () => {
    expect(clusterFor("sector-v").absorbedBy).toBeNull();
    expect(clusterFor("salt-lake").absorbs).not.toContain("sector-v");
  });
});

describe("candidates", () => {
  it("identifies a small set of eventual pages, not thirty", () => {
    const c = candidateLocations();
    expect(c.length).toBeGreaterThanOrEqual(5);
    // If this ever exceeds ~12 someone has started justifying doorway pages.
    expect(c.length).toBeLessThanOrEqual(12);
  });
});
