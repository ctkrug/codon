const VALID_BASES = new Set(["A", "C", "G", "T"]);

const COMPLEMENT = { A: "T", T: "A", C: "G", G: "C" };

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
