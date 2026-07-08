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
