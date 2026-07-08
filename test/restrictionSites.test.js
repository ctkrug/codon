import { test } from "node:test";
import assert from "node:assert/strict";
import { findRestrictionSites } from "../src/restrictionSites.js";

test("findRestrictionSites locates a known recognition site", () => {
  const hits = findRestrictionSites("AAAGAATTCAAA");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].name, "EcoRI");
  assert.equal(hits[0].start, 3);
});

test("findRestrictionSites returns multiple hits sorted by position", () => {
  const hits = findRestrictionSites("GGATCC000GAATTC".replace(/0/g, "A"));
  assert.deepEqual(
    hits.map((h) => h.name),
    ["BamHI", "EcoRI"],
  );
});

test("findRestrictionSites returns an empty array when nothing matches", () => {
  assert.deepEqual(findRestrictionSites("AAAAAA"), []);
});
