import { test } from "node:test";
import assert from "node:assert/strict";
import { findOrfs } from "../src/orf.js";

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
