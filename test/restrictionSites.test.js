import { test } from "node:test";
import assert from "node:assert/strict";
import { findRestrictionSites } from "../site/js/restrictionSites.js";

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

test("findRestrictionSites finds a site at the very start of the sequence", () => {
  const hits = findRestrictionSites("GAATTCAAA");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].start, 0);
});

test("findRestrictionSites finds a site ending exactly at the sequence's end", () => {
  const sequence = "AAAGAATTC";
  const hits = findRestrictionSites(sequence);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].start + hits[0].site.length, sequence.length);
});

test("findRestrictionSites finds back-to-back non-overlapping copies of the same site", () => {
  const hits = findRestrictionSites("GAATTCGAATTC");
  assert.deepEqual(hits.map((h) => h.start), [0, 6]);
});
