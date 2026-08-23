/**
 * The location market map — architecture only. NO PAGES ARE PUBLISHED FROM THIS.
 *
 * This module exists so the site can eventually support 20-30+ location pages
 * without anyone having to re-derive the research, AND so that publishing one
 * is gated on evidence rather than on someone's enthusiasm. Nothing here is
 * rendered by any route today, and `publishableLocations()` returns an empty
 * array until real evidence is recorded below.
 *
 * ── Why the gate exists ────────────────────────────────────────────────────
 * Thirty near-identical pages that differ only by place name are a doorway
 * network, which is a manual-action risk rather than a grey area. A location
 * page earns publication only when all four gates below are satisfied:
 *
 *   1. coverage  — the business has confirmed it actually works there
 *   2. content   — there is something true and specific to say about the area
 *                  that is not true of every other area
 *   3. evidence  — at least one real, photographed, permitted local project
 *   4. cluster   — it is the designated owner of its search cluster, so it
 *                  cannot cannibalise a sibling page
 *
 * ── Layer 2: clusters ──────────────────────────────────────────────────────
 * Several markets deliberately consolidate rather than getting their own page.
 * `absorbs` records which searches a page is expected to serve, so that the
 * decision is written down instead of being rediscovered as a cannibalisation
 * problem after both pages exist.
 *
 * Demand ratings are qualitative reasoning from Kolkata's housing stock and
 * commercial density, NOT measured search volume. Validate in Search Console
 * before committing budget to any of them.
 */

/** Tier A: new-build corridors. Empty flats, full fit-out, highest project value. */
const NEW_BUILD = "new-build";
/** Tier B: established affluent. Renovation and luxury, lower volume, higher budget. */
const AFFLUENT = "affluent";
/** Tier C: commercial-dominant. Different buyer, different sales cycle. */
const COMMERCIAL = "commercial";
/** Tier D: mid-market volume. More leads, smaller projects. */
const MID_MARKET = "mid-market";
/** Tier E: separate municipality. */
const ACROSS_RIVER = "across-river";

export const TIERS = { NEW_BUILD, AFFLUENT, COMMERCIAL, MID_MARKET, ACROSS_RIVER };

/**
 * Every candidate market. `page: true` means it *could* eventually justify a
 * dedicated page — not that it may be published. Publication is decided
 * solely by `evidence`.
 */
export const LOCATIONS = [
  // ── Tier A ──────────────────────────────────────────────────────────────
  {
    slug: "new-town", name: "New Town", tier: NEW_BUILD, page: true, priority: "P2",
    demand: "very-high", mix: { residential: 90, commercial: 10 },
    primary: "interior designer in new town kolkata",
    secondary: ["new town flat interior design", "3bhk interior design new town", "modular kitchen new town"],
    services: ["residential", "modular-kitchen"],
    // Owns Rajarhat searches: the two overlap so heavily that separate pages
    // would compete with each other for the same intent.
    absorbs: ["rajarhat"],
    doorwayRisk: "low",
    rationale: "Largest concentration of newly handed-over towers in the region. New flats convert to interiors work far more often than existing homes.",
    evidence: {},
  },
  {
    slug: "rajarhat", name: "Rajarhat", tier: NEW_BUILD, page: false, priority: "P2",
    demand: "very-high", mix: { residential: 90, commercial: 10 },
    primary: "interior designer in rajarhat",
    secondary: [], services: ["residential"],
    absorbedBy: "new-town", doorwayRisk: "high",
    rationale: "Very high demand, but overlaps New Town so heavily that two pages cannibalise each other. Revisit only if Search Console shows genuinely separate queries.",
    evidence: {},
  },
  { slug: "mukundapur", name: "Mukundapur", tier: NEW_BUILD, page: true, priority: "P3", demand: "high", mix: { residential: 85, commercial: 15 }, primary: "interior designer in mukundapur", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "EM Bypass south; new towers and the hospital belt.", evidence: {} },
  { slug: "em-bypass", name: "EM Bypass", tier: NEW_BUILD, page: false, priority: "P3", demand: "high", mix: { residential: 80, commercial: 20 }, primary: "interior designer em bypass kolkata", secondary: [], services: ["residential"], doorwayRisk: "high", rationale: "A road, not a community — no coherent local identity to write about honestly.", evidence: {} },
  { slug: "garia", name: "Garia", tier: NEW_BUILD, page: false, priority: "P3", demand: "medium", mix: { residential: 90, commercial: 10 }, primary: "interior designer in garia", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "Southern expansion, metro-served, mid-market.", evidence: {} },
  { slug: "joka", name: "Joka", tier: NEW_BUILD, page: false, priority: "P3", demand: "medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer in joka", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "Metro-driven newer supply, budget-led.", evidence: {} },
  { slug: "behala", name: "Behala", tier: NEW_BUILD, page: true, priority: "P3", demand: "medium-high", mix: { residential: 90, commercial: 10 }, primary: "interior designer in behala", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "Large south-west belt with real volume; lower project value, so build after the affluent pages earn.", evidence: {} },
  { slug: "kestopur", name: "Kestopur", tier: NEW_BUILD, page: false, priority: "P3", demand: "medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer in kestopur", secondary: [], services: ["residential"], absorbedBy: "salt-lake", doorwayRisk: "high", rationale: "Salt Lake fringe; nothing distinct to say that is not also true of Baguiati.", evidence: {} },
  { slug: "baguiati", name: "Baguiati", tier: NEW_BUILD, page: false, priority: "P3", demand: "medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer in baguiati", secondary: [], services: ["residential"], absorbedBy: "salt-lake", doorwayRisk: "high", rationale: "Mid-market volume with no distinct brief.", evidence: {} },

  // ── Tier B ──────────────────────────────────────────────────────────────
  {
    slug: "ballygunge", name: "Ballygunge", tier: AFFLUENT, page: true, priority: "P2",
    demand: "high", mix: { residential: 85, commercial: 15 },
    primary: "interior designer in ballygunge",
    secondary: ["luxury interior designer ballygunge", "ballygunge flat renovation"],
    services: ["residential", "home-renovation"],
    // Both are too small to sustain their own page and share this brief.
    absorbs: ["hindustan-park", "southern-avenue"],
    doorwayRisk: "low",
    rationale: "Old-money south Kolkata; large ageing stock means renovation budgets well above city average.",
    evidence: {},
  },
  {
    slug: "alipore", name: "Alipore", tier: AFFLUENT, page: true, priority: "P2",
    demand: "medium-volume-top-value", mix: { residential: 85, commercial: 15 },
    primary: "luxury interior designer in alipore",
    secondary: ["bungalow interior design kolkata"], services: ["residential"],
    absorbs: ["new-alipore"], doorwayRisk: "low",
    rationale: "The city's most affluent address. Few searches; a single conversion can outweigh a year of mid-market leads.",
    // Real photography is close to mandatory here — a luxury page carrying
    // stock imagery actively loses this buyer.
    evidence: {},
  },
  { slug: "new-alipore", name: "New Alipore", tier: AFFLUENT, page: false, priority: "P3", demand: "medium-high", mix: { residential: 90, commercial: 10 }, primary: "interior designer in new alipore", secondary: [], services: ["residential"], absorbedBy: "alipore", doorwayRisk: "medium", rationale: "Genuine demand, but must read distinctly from Alipore or both go thin. Fold in unless that can be done honestly.", evidence: {} },
  { slug: "bhowanipore", name: "Bhowanipore", tier: AFFLUENT, page: false, priority: "P3", demand: "medium-high", mix: { residential: 80, commercial: 20 }, primary: "interior designer in bhowanipore", secondary: [], services: ["home-renovation"], doorwayRisk: "medium", rationale: "Traditional business community; strong renovation demand.", evidence: {} },
  { slug: "southern-avenue", name: "Southern Avenue", tier: AFFLUENT, page: false, priority: "P3", demand: "medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer southern avenue kolkata", secondary: [], services: ["residential"], absorbedBy: "ballygunge", doorwayRisk: "high", rationale: "Affluent but too small to sustain a page alone.", evidence: {} },
  { slug: "hindustan-park", name: "Hindustan Park", tier: AFFLUENT, page: false, priority: "P3", demand: "low-volume-high-value", mix: { residential: 95, commercial: 5 }, primary: "interior designer hindustan park", secondary: [], services: ["residential"], absorbedBy: "ballygunge", doorwayRisk: "very-high", rationale: "Small boutique pocket; a page here would be thin by construction.", evidence: {} },
  {
    slug: "salt-lake", name: "Salt Lake", tier: AFFLUENT, page: true, priority: "P2",
    demand: "high", mix: { residential: 85, commercial: 15 },
    primary: "interior designer in salt lake kolkata",
    secondary: ["bidhannagar interior designer", "salt lake home renovation"],
    services: ["residential", "home-renovation", "modular-kitchen"],
    absorbs: ["kestopur", "baguiati"], doorwayRisk: "low",
    // Must be written as a renovation page. Keep strictly separate from
    // Sector V, which is an entirely different buyer.
    rationale: "Affluent self-contained township with ageing but valuable stock — a renovation market, not a fit-out market.",
    evidence: {},
  },
  { slug: "lake-town", name: "Lake Town", tier: AFFLUENT, page: false, priority: "P3", demand: "medium", mix: { residential: 92, commercial: 8 }, primary: "interior designer in lake town", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "North, upper-middle, stable renovation demand.", evidence: {} },
  { slug: "tollygunge", name: "Tollygunge", tier: AFFLUENT, page: false, priority: "P3", demand: "medium", mix: { residential: 88, commercial: 12 }, primary: "interior designer in tollygunge", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "Mixed affluence, older stock.", evidence: {} },
  { slug: "golf-green", name: "Golf Green / Lake Gardens", tier: AFFLUENT, page: false, priority: "P3", demand: "medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer golf green kolkata", secondary: [], services: ["residential"], doorwayRisk: "high", rationale: "Planned upper-middle south; little to distinguish in copy.", evidence: {} },

  // ── Tier C ──────────────────────────────────────────────────────────────
  {
    slug: "sector-v", name: "Sector V", tier: COMMERCIAL, page: true, priority: "P2",
    demand: "very-high-office", mix: { residential: 5, commercial: 95 },
    primary: "office interior designer sector v kolkata",
    secondary: ["office interior design salt lake sector 5", "office renovation sector v"],
    services: ["commercial"], doorwayRisk: "low",
    rationale: "Densest commercial office cluster in the region. Buyer, brief and objections all genuinely different from every other page — do not dilute with residential content.",
    evidence: {},
  },
  { slug: "camac-street", name: "Camac Street", tier: COMMERCIAL, page: false, priority: "P3", demand: "high-office", mix: { residential: 5, commercial: 95 }, primary: "office interior designer camac street", secondary: [], services: ["commercial"], absorbedBy: "sector-v", doorwayRisk: "medium", rationale: "Premium corporate address; fold into a CBD page rather than standing alone.", evidence: {} },
  { slug: "park-street", name: "Park Street", tier: COMMERCIAL, page: false, priority: "P3", demand: "high-hospitality", mix: { residential: 10, commercial: 90 }, primary: "restaurant interior designer park street", secondary: [], services: ["commercial"], doorwayRisk: "medium", rationale: "Hospitality and retail. NOTE: no hospitality evidence exists anywhere in the repository — do not claim restaurant capability without confirmation.", evidence: {} },
  { slug: "shakespeare-sarani", name: "Shakespeare Sarani", tier: COMMERCIAL, page: false, priority: "P3", demand: "medium-office", mix: { residential: 10, commercial: 90 }, primary: "office interior designer shakespeare sarani", secondary: [], services: ["commercial"], absorbedBy: "camac-street", doorwayRisk: "high", rationale: "Corporate offices; too close to Camac Street to justify separation.", evidence: {} },
  { slug: "bbd-bagh", name: "BBD Bagh / Dalhousie", tier: COMMERCIAL, page: false, priority: "P3", demand: "low-medium", mix: { residential: 2, commercial: 98 }, primary: "office interior designer bbd bagh", secondary: [], services: ["commercial"], absorbedBy: "camac-street", doorwayRisk: "high", rationale: "Old CBD; government and legacy corporate.", evidence: {} },
  { slug: "gariahat", name: "Gariahat", tier: COMMERCIAL, page: false, priority: "P3", demand: "medium-high", mix: { residential: 55, commercial: 45 }, primary: "interior designer in gariahat", secondary: [], services: ["residential", "commercial"], doorwayRisk: "medium", rationale: "Split residential/retail intent muddies a single page.", evidence: {} },
  { slug: "park-circus", name: "Park Circus", tier: COMMERCIAL, page: false, priority: "P3", demand: "medium", mix: { residential: 60, commercial: 40 }, primary: "interior designer park circus kolkata", secondary: [], services: ["residential"], doorwayRisk: "high", rationale: "Central mixed-use with no distinct brief.", evidence: {} },

  // ── Tier D ──────────────────────────────────────────────────────────────
  { slug: "jadavpur", name: "Jadavpur", tier: MID_MARKET, page: false, priority: "P3", demand: "medium", mix: { residential: 92, commercial: 8 }, primary: "interior designer in jadavpur", secondary: [], services: ["residential"], doorwayRisk: "medium", rationale: "University belt, older flats, middle-market.", evidence: {} },
  { slug: "kasba", name: "Kasba", tier: MID_MARKET, page: false, priority: "P3", demand: "medium", mix: { residential: 92, commercial: 8 }, primary: "interior designer in kasba", secondary: [], services: ["residential"], doorwayRisk: "high", rationale: "Growing middle-market; nothing distinct from neighbouring pockets.", evidence: {} },
  { slug: "dum-dum", name: "Dum Dum", tier: MID_MARKET, page: false, priority: "P3", demand: "medium", mix: { residential: 92, commercial: 8 }, primary: "interior designer in dum dum", secondary: [], services: ["residential"], doorwayRisk: "high", rationale: "Airport-adjacent mid-market.", evidence: {} },
  { slug: "santoshpur", name: "Santoshpur", tier: MID_MARKET, page: false, priority: "P3", demand: "low-medium", mix: { residential: 95, commercial: 5 }, primary: "interior designer in santoshpur", secondary: [], services: ["residential"], doorwayRisk: "very-high", rationale: "Cannot be meaningfully distinguished from Kasba or Jadavpur in copy.", evidence: {} },
  { slug: "north-kolkata", name: "North Kolkata", tier: MID_MARKET, page: false, priority: "P3", demand: "medium", mix: { residential: 85, commercial: 15 }, primary: "interior designer north kolkata", secondary: [], services: ["home-renovation"], absorbs: ["shyambazar", "hatibagan", "bagbazar"], doorwayRisk: "medium", rationale: "Traditional north; old houses give a genuine heritage-renovation niche. Cluster page, not individual pockets.", evidence: {} },

  // ── Tier E ──────────────────────────────────────────────────────────────
  { slug: "howrah", name: "Howrah", tier: ACROSS_RIVER, page: true, priority: "P2", demand: "medium-high", mix: { residential: 85, commercial: 15 }, primary: "interior designer in howrah", secondary: [], services: ["residential"], absorbs: ["bally"], doorwayRisk: "low", rationale: "A separate municipal corporation with its own search behaviour — legitimately a distinct page. Proximity is not coverage: needs explicit confirmation the studio crosses the river.", evidence: {} },
  { slug: "bally", name: "Bally", tier: ACROSS_RIVER, page: false, priority: "P3", demand: "low-medium", mix: { residential: 90, commercial: 10 }, primary: "interior designer in bally howrah", secondary: [], services: ["residential"], absorbedBy: "howrah", doorwayRisk: "high", rationale: "Howrah district; industrial plus residential.", evidence: {} },
];

/**
 * The four gates. A location is publishable only when every one is satisfied.
 *
 * `evidence` is intentionally empty for every location today, which is why
 * `publishableLocations()` returns nothing. Filling one in is a deliberate act
 * that should record WHO confirmed it and WHEN, exactly as the confirmed
 * figures are recorded in __tests__/claims.test.js.
 */
export function evidenceGates(location) {
  const e = location.evidence || {};
  return {
    coverage: Boolean(e.coverageConfirmedBy),
    content: Boolean(e.localContent),
    project: Boolean(e.projectSlug && e.photographyPermission),
    cluster: location.page === true && !location.absorbedBy,
  };
}

/** True only when all four gates pass. */
export function isPublishable(location) {
  return Object.values(evidenceGates(location)).every(Boolean);
}

/**
 * The ONLY function a route should ever use to decide what to render.
 * Returns [] today, by design — no location page has its evidence recorded.
 */
export function publishableLocations() {
  return LOCATIONS.filter(isPublishable);
}

/** Locations that would be publishable if evidence were supplied — for reporting. */
export function candidateLocations() {
  return LOCATIONS.filter((l) => l.page === true && !l.absorbedBy);
}

/** Which searches a given page is expected to serve, including absorbed ones. */
export function clusterFor(slug) {
  const loc = LOCATIONS.find((l) => l.slug === slug);
  if (!loc) return null;
  return {
    owner: loc.slug,
    absorbs: loc.absorbs || [],
    absorbedBy: loc.absorbedBy || null,
  };
}
