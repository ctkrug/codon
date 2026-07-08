import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSequence,
  isValidSequence,
  findInvalidCharacters,
  gcContent,
  reverseComplement,
  baseCounts,
  mapNormalizedRangeToRaw,
  mapNormalizedRangesToRaw,
  isSequenceTooLong,
  MAX_SEQUENCE_LENGTH,
} from "../site/js/sequence.js";

test("normalizeSequence strips whitespace and uppercases", () => {
  assert.equal(normalizeSequence(" acgt\nACGT "), "ACGTACGT");
});

test("isValidSequence accepts only ACGT", () => {
  assert.equal(isValidSequence("ACGT"), true);
  assert.equal(isValidSequence("ACGU"), false);
  assert.equal(isValidSequence(""), false);
});

test("findInvalidCharacters reports offending characters", () => {
  assert.deepEqual(findInvalidCharacters("ACGTXN"), ["X", "N"]);
});

test("gcContent computes percentage of G/C bases", () => {
  assert.equal(gcContent("GGCC"), 100);
  assert.equal(gcContent("AATT"), 0);
  assert.equal(gcContent("ACGT"), 50);
});

test("reverseComplement flips and complements the strand", () => {
  assert.equal(reverseComplement("ATGC"), "GCAT");
});

test("baseCounts tallies each base and reports zero for bases absent", () => {
  assert.deepEqual(baseCounts("AATTGGGGC"), { A: 2, C: 1, G: 4, T: 2 });
  assert.deepEqual(baseCounts(""), { A: 0, C: 0, G: 0, T: 0 });
});

test("mapNormalizedRangeToRaw is a passthrough when the raw text has no whitespace", () => {
  assert.deepEqual(mapNormalizedRangeToRaw("ACGTACGT", 2, 5), { start: 2, end: 5 });
});

test("mapNormalizedRangeToRaw skips over embedded whitespace", () => {
  const raw = "AC GT";
  assert.deepEqual(mapNormalizedRangeToRaw(raw, 1, 3), { start: 1, end: 4 });
  assert.equal(raw.slice(1, 4), "C G");
});

test("mapNormalizedRangeToRaw handles an empty range at the start", () => {
  assert.deepEqual(mapNormalizedRangeToRaw("ACGT", 0, 0), { start: 0, end: 0 });
});

test("mapNormalizedRangeToRaw handles a range reaching the end of the text", () => {
  assert.deepEqual(mapNormalizedRangeToRaw("ACGT", 2, 4), { start: 2, end: 4 });
});

test("isSequenceTooLong accepts a sequence at or under the cap", () => {
  assert.equal(isSequenceTooLong("A".repeat(MAX_SEQUENCE_LENGTH)), false);
});

test("isSequenceTooLong rejects a sequence over the cap", () => {
  assert.equal(isSequenceTooLong("A".repeat(MAX_SEQUENCE_LENGTH + 1)), true);
});

test("mapNormalizedRangesToRaw matches mapNormalizedRangeToRaw for each range", () => {
  const raw = "AC GT\nAC GT";
  const ranges = [
    { start: 0, end: 2 },
    { start: 1, end: 3 },
    { start: 4, end: 8 },
    { start: 0, end: 0 },
  ];
  const batched = mapNormalizedRangesToRaw(raw, ranges);
  const oneAtATime = ranges.map((r) => mapNormalizedRangeToRaw(raw, r.start, r.end));
  assert.deepEqual(batched, oneAtATime);
});

test("mapNormalizedRangesToRaw stays fast with thousands of ranges over a long text", () => {
  // Simulates a sequence with many restriction-site hits: mapping each hit
  // by independently rescanning the whole raw text (mapNormalizedRangeToRaw
  // in a loop) is O(hits * length) and can hang; the batched version builds
  // the index map once.
  const raw = "GAATTC".repeat(16667); // ~100,000 bases
  const ranges = [];
  for (let i = 0; i < raw.length; i += 6) ranges.push({ start: i, end: i + 6 });
  const started = Date.now();
  const mapped = mapNormalizedRangesToRaw(raw, ranges);
  const elapsed = Date.now() - started;
  assert.equal(mapped.length, ranges.length);
  assert.ok(elapsed < 1000, `expected mapNormalizedRangesToRaw to finish in under 1s, took ${elapsed}ms`);
});
