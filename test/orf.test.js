import { test } from "node:test";
import assert from "node:assert/strict";
import { findOrfs, mapOrfToSequenceRange } from "../site/js/orf.js";
import { reverseComplement } from "../site/js/sequence.js";

test("findOrfs locates an ATG-to-stop run on the forward strand", () => {
  const orfs = findOrfs("CCATGGCCTAACC");
  const forward = orfs.filter((o) => o.frame === "+1" || o.frame === "+2" || o.frame === "+3");
  assert.ok(forward.length >= 1);
  const longest = forward[0];
  assert.equal(longest.protein, "MA*");
});

test("findOrfs returns results sorted longest first", () => {
  const orfs = findOrfs("ATGAAATAAATGTAA");
  for (let i = 1; i < orfs.length; i += 1) {
    assert.ok(orfs[i - 1].length >= orfs[i].length);
  }
});

test("findOrfs returns no ORFs when there is no start codon", () => {
  const orfs = findOrfs("CCCCCCCCC");
  assert.equal(orfs.length, 0);
});

test("mapOrfToSequenceRange passes forward-frame coordinates through unchanged", () => {
  const orf = { frame: "+2", start: 3, end: 12 };
  assert.deepEqual(mapOrfToSequenceRange(orf, 20), { start: 3, end: 12 });
});

test("mapOrfToSequenceRange maps a reverse-frame ORF back onto the matching forward slice", () => {
  const known = "ATGAAATAA";
  const sequence = reverseComplement(known);
  const orfs = findOrfs(sequence).filter((o) => o.frame === "-1");
  assert.equal(orfs.length, 1);
  const { start, end } = mapOrfToSequenceRange(orfs[0], sequence.length);
  assert.equal(reverseComplement(sequence.slice(start, end)), known);
});

test("findOrfs stays roughly linear on a long run of in-frame starts with no stop", () => {
  // A repeating ATG with no in-frame stop codon anywhere is the worst case
  // for a naive scan-from-every-start implementation (O(n^2)). This should
  // stay fast even at a size a real user could plausibly paste.
  const sequence = "ATG".repeat(12000); // 36,000 bases
  const started = Date.now();
  const orfs = findOrfs(sequence);
  const elapsed = Date.now() - started;
  assert.equal(orfs.length, 0);
  assert.ok(elapsed < 1000, `expected findOrfs to finish in under 1s, took ${elapsed}ms`);
});

test("findOrfs bounds total ORFs when thousands of starts share one distant stop", () => {
  // Every ATG here is a nested in-frame start ending at the same trailing
  // stop codon, so a naive implementation builds one full-length protein
  // string per start — thousands of them, which is enough to exhaust the
  // heap. findOrfs must stay bounded and fast instead of crashing.
  const sequence = "ATG".repeat(10000) + "TAA";
  const started = Date.now();
  const orfs = findOrfs(sequence);
  const elapsed = Date.now() - started;
  assert.ok(orfs.length < 10000, `expected findOrfs to cap runaway ORF counts, got ${orfs.length}`);
  assert.ok(elapsed < 2000, `expected findOrfs to finish in under 2s, took ${elapsed}ms`);
});
