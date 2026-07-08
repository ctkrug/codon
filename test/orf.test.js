import { test } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { findOrfs, mapOrfToSequenceRange } from "../site/js/orf.js";
import { reverseComplement } from "../site/js/sequence.js";

const acgtString = (opts) =>
  fc.array(fc.constantFrom("A", "C", "G", "T"), opts).map((bases) => bases.join(""));

test("findOrfs locates an ATG-to-stop run on the forward strand", () => {
  const orfs = findOrfs("CCATGGCCTAACC");
  const forward = orfs.filter((o) => o.frame === "+1" || o.frame === "+2" || o.frame === "+3");
  assert.ok(forward.length >= 1);
  const longest = forward[0];
  assert.equal(longest.protein, "MA*");
});

test("findOrfs reports an ambiguous in-frame codon as X in the protein", () => {
  // The ORF scanner doesn't itself enforce ACGT-only input (that's the
  // caller's job), so an ambiguity code like N must translate through the
  // same X fallback as translateCodon rather than crashing or dropping it.
  const orfs = findOrfs("ATGNNNTAA");
  assert.equal(orfs.length, 1);
  assert.equal(orfs[0].protein, "MX*");
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

test("findOrfs doesn't crash on sequences shorter than a frame's offset", () => {
  // A 1-base sequence in frame +3/-3 (offset 2) makes strand.length - offset
  // negative; a naive `new Array(negative)` throws RangeError instead of
  // reporting no ORFs for this perfectly valid, if minimal, sequence.
  assert.deepEqual(findOrfs(""), []);
  assert.deepEqual(findOrfs("A"), []);
  assert.deepEqual(findOrfs("AC"), []);
});

test("every ORF findOrfs returns is internally consistent", () => {
  fc.assert(
    fc.property(acgtString({ minLength: 0, maxLength: 150 }), (sequence) => {
      for (const orf of findOrfs(sequence)) {
        assert.ok(orf.start < orf.end, "start must precede end");
        assert.equal((orf.end - orf.start) % 3, 0, "span must be a whole number of codons");
        assert.equal(orf.end - orf.start, orf.length);
        assert.equal(orf.protein.length, orf.length / 3);
        assert.equal(orf.protein.at(-1), "*", "an ORF always ends on a stop codon");
        assert.match(orf.frame, /^[+-][1-3]$/);
      }
    }),
  );
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

test("findOrfs's output cap never hides a genuinely longer ORF in a later-scanned frame", () => {
  // A dense +1-frame region alone produces 600 nested ORFs — more than the
  // output cap. A cap applied *during* scanning (frame by frame, in +1/+2/
  // +3/-1/-2/-3 order) would exhaust its budget on these short/medium
  // nested ORFs before frame +3 (scanned later) is even examined, silently
  // dropping a real, much longer ORF placed there. The cap must only ever
  // trim the shortest entries after every frame has been scanned and
  // sorted, so the true longest ORF always survives regardless of frame.
  const denseRegion = "ATG".repeat(600) + "TAA"; // 600 nested ORFs in frame +1
  const filler = "CC"; // shifts alignment so the next ATG lands in frame +3
  const longOrf = "ATG" + "AAA".repeat(1000) + "TAA"; // 3006 bases, longer than any nested ORF above
  const sequence = denseRegion + filler + longOrf;

  const orfs = findOrfs(sequence);
  assert.equal(orfs[0].length, 3006);
  assert.equal(orfs[0].frame, "+3");
});
