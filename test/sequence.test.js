import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSequence,
  isValidSequence,
  findInvalidCharacters,
  gcContent,
  reverseComplement,
} from "../src/sequence.js";

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
