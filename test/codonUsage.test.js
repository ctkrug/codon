import { test } from "node:test";
import assert from "node:assert/strict";
import { codonUsage } from "../site/js/codonUsage.js";

test("codonUsage counts and ranks codons by frequency", () => {
  const usage = codonUsage("ATGATGGCC");
  assert.equal(usage[0].codon, "ATG");
  assert.equal(usage[0].count, 2);
  assert.equal(usage[0].fraction, 2 / 3);
});

test("codonUsage ignores a trailing partial codon", () => {
  const usage = codonUsage("ATGAT");
  const total = usage.reduce((sum, u) => sum + u.count, 0);
  assert.equal(total, 1);
});

test("codonUsage returns an empty list, not NaN fractions, for sequences under one codon", () => {
  assert.deepEqual(codonUsage(""), []);
  assert.deepEqual(codonUsage("A"), []);
  assert.deepEqual(codonUsage("AC"), []);
});
