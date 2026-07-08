import { test } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { translateCodon, translateFrame, sixFrameTranslation } from "../site/js/translate.js";

const acgtString = (opts) =>
  fc.array(fc.constantFrom("A", "C", "G", "T"), opts).map((bases) => bases.join(""));

test("translateCodon maps codons to amino acids", () => {
  assert.equal(translateCodon("ATG"), "M");
  assert.equal(translateCodon("TAA"), "*");
});

test("translateFrame translates from the given offset, dropping trailing partial codon", () => {
  assert.equal(translateFrame("ATGGCC", 0), "MA");
  assert.equal(translateFrame("AATGGCC", 1), "MA");
  assert.equal(translateFrame("ATGGC", 0), "M");
});

test("translateFrame always emits floor((length - offset) / 3) amino acids", () => {
  fc.assert(
    fc.property(
      acgtString({ minLength: 0, maxLength: 100 }),
      fc.constantFrom(0, 1, 2),
      (sequence, offset) => {
        const expected = Math.max(0, Math.floor((sequence.length - offset) / 3));
        assert.equal(translateFrame(sequence, offset).length, expected);
      },
    ),
  );
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
