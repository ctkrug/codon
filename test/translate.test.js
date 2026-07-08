import { test } from "node:test";
import assert from "node:assert/strict";
import { translateCodon, translateFrame, sixFrameTranslation } from "../site/js/translate.js";

test("translateCodon maps codons to amino acids", () => {
  assert.equal(translateCodon("ATG"), "M");
  assert.equal(translateCodon("TAA"), "*");
});

test("translateFrame translates from the given offset, dropping trailing partial codon", () => {
  assert.equal(translateFrame("ATGGCC", 0), "MA");
  assert.equal(translateFrame("AATGGCC", 1), "MA");
  assert.equal(translateFrame("ATGGC", 0), "M");
});

test("sixFrameTranslation returns all three forward and three reverse frames", () => {
  const frames = sixFrameTranslation("ATGGCCTAA");
  assert.equal(frames.length, 6);
  assert.deepEqual(
    frames.map((f) => f.frame),
    ["+1", "+2", "+3", "-1", "-2", "-3"],
  );
  assert.equal(frames[0].protein, "MA*");
});
