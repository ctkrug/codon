const VALID_BASES = new Set(["A", "C", "G", "T"]);

const COMPLEMENT = { A: "T", T: "A", C: "G", G: "C" };

// The live overlay renders one DOM element per character, so its cost scales
// linearly with input length with no natural ceiling — comfortably fast for
// any single gene, operon, or plasmid, but a genome-scale paste (megabases)
// would freeze the tab. Codon is a scratchpad for fragments, not a genome
// browser, so pastes over this size are rejected with a clear message
// instead of degrading silently.
export const MAX_SEQUENCE_LENGTH = 100_000;

export function isSequenceTooLong(sequence) {
  return sequence.length > MAX_SEQUENCE_LENGTH;
}

// Strips whitespace/newlines a user might paste from FASTA-style sources and
// uppercases the result; does not touch non-ACGT characters so callers can
// surface a validation error instead of silently discarding data.
export function normalizeSequence(raw) {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function isValidSequence(sequence) {
  if (sequence.length === 0) return false;
  for (const base of sequence) {
    if (!VALID_BASES.has(base)) return false;
  }
  return true;
}

export function findInvalidCharacters(sequence) {
  const invalid = new Set();
  for (const base of sequence) {
    if (!VALID_BASES.has(base)) invalid.add(base);
  }
  return [...invalid];
}

export function gcContent(sequence) {
  if (sequence.length === 0) return 0;
  let gcCount = 0;
  for (const base of sequence) {
    if (base === "G" || base === "C") gcCount += 1;
  }
  return (gcCount / sequence.length) * 100;
}

export function reverseComplement(sequence) {
  let result = "";
  for (let i = sequence.length - 1; i >= 0; i -= 1) {
    result += COMPLEMENT[sequence[i]];
  }
  return result;
}

// Per-base tallies for the GC meter's stacked bar, always reporting all
// four bases (even at zero) so the caller doesn't need to guard missing keys.
export function baseCounts(sequence) {
  const counts = { A: 0, C: 0, G: 0, T: 0 };
  for (const base of sequence) {
    if (base in counts) counts[base] += 1;
  }
  return counts;
}

// Maps a [start, end) range over the whitespace-stripped, upper-cased
// sequence (as produced by normalizeSequence) back onto the matching range
// in the raw text the user actually typed, so a highlight computed from
// normalized coordinates can be drawn on the textarea overlay without the
// two texts needing to be identical.
export function mapNormalizedRangeToRaw(raw, start, end) {
  let normalizedIndex = 0;
  let rawStart = null;
  let rawEnd = raw.length;
  for (let i = 0; i < raw.length; i += 1) {
    if (/\s/.test(raw[i])) continue;
    if (normalizedIndex === start && rawStart === null) rawStart = i;
    if (normalizedIndex === end) {
      rawEnd = i;
      break;
    }
    normalizedIndex += 1;
  }
  if (rawStart === null) rawStart = raw.length;
  return { start: rawStart, end: rawEnd };
}
