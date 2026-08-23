const { migrationFiles, baselineTargets } = require("../scripts/migrate");

/**
 * This runner gets pointed at a production database, so the parts that decide
 * WHAT runs and in WHAT ORDER are worth testing even though the parts that
 * talk to Postgres cannot be (there is no local Postgres on this machine).
 */

describe("migrationFiles", () => {
  const files = migrationFiles();

  it("finds the migrations", () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
    files.forEach((f) => expect(f).toMatch(/\.sql$/));
  });

  it("orders them by their numeric prefix", () => {
    const numbers = files.map((f) => Number(f.slice(0, 3)));
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });

  it("puts the reviews table before the seed that fills it", () => {
    // Running the seed first would fail on a missing table.
    const table = files.indexOf("011_create_reviews.sql");
    const seed = files.indexOf("012_seed_initial_reviews.sql");
    expect(table).toBeGreaterThanOrEqual(0);
    expect(seed).toBeGreaterThan(table);
  });
});

describe("baselineTargets", () => {
  const files = [
    "001_a.sql",
    "008_b.sql",
    "011_create_reviews.sql",
    "012_seed_initial_reviews.sql",
  ];

  it("stops at the file given, inclusive", () => {
    expect(baselineTargets(files, "008_b.sql")).toEqual(["001_a.sql", "008_b.sql"]);
  });

  it("never baselines a seed when no limit is given", () => {
    // Marking a seed applied without running it would silently skip the rows
    // it exists to insert — the testimonials would never appear.
    expect(baselineTargets(files)).not.toContain("012_seed_initial_reviews.sql");
  });

  it("marks nothing beyond the limit", () => {
    expect(baselineTargets(files, "001_a.sql")).toEqual(["001_a.sql"]);
  });
});
