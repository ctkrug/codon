import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_SEQUENCES } from "../site/js/examples.js";
import { isValidSequence } from "../site/js/sequence.js";
import { findOrfs } from "../site/js/orf.js";

test("every example sequence is a valid ACGT sequence", () => {
  assert.ok(EXAMPLE_SEQUENCES.length >= 2);
  for (const example of EXAMPLE_SEQUENCES) {
    assert.ok(isValidSequence(example.sequence), `${example.name} should be valid ACGT`);
  }
});

test("every example sequence contains at least one ORF", () => {
  for (const example of EXAMPLE_SEQUENCES) {
    assert.ok(findOrfs(example.sequence).length > 0, `${example.name} should contain an ORF`);
  }
});
