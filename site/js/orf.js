import { CODON_TABLE, START_CODON, STOP_SYMBOL } from "./codonTable.js";
import { reverseComplement } from "./sequence.js";

// Defensive cap on total ORFs returned across all six frames. Real
// sequences never approach this — it exists because every in-frame ATG
// before a shared distant stop counts as its own (nested) ORF, so a
// pathological input (thousands of ATGs all resolving to one trailing
// stop) would otherwise build thousands of full-length protein strings and
// exhaust the heap. Capping bounds both the memory and the work done.
const MAX_ORFS = 500;

// Scans one strand/offset for ATG...stop runs and returns each ORF with its
// coordinates on that strand, matching `translateFrame`'s codon boundaries.
//
// Every in-frame codon is sliced once up front. A backward pass over that
// list records, for each codon position, the end coordinate of the nearest
// stop codon at or after it (or null if the frame never hits one) so each
// start codon can look its stop up in one step instead of rescanning the
// rest of the strand. The whole frame is also translated once into
// `frameProtein`; a nested ORF's protein is then an O(1) slice of it rather
// than a from-scratch re-translation, which matters because many in-frame
// starts commonly share the same downstream stop.
function findOrfsInFrame(strand, offset, frameLabel, budget) {
  const codonCount = Math.floor((strand.length - offset) / 3);
  const codons = new Array(codonCount);
  for (let k = 0; k < codonCount; k += 1) {
    const pos = offset + k * 3;
    codons[k] = strand.slice(pos, pos + 3);
  }

  const nextStopEnd = new Array(codonCount);
  let running = null;
  for (let k = codonCount - 1; k >= 0; k -= 1) {
    if (CODON_TABLE[codons[k]] === STOP_SYMBOL) {
      running = offset + k * 3 + 3;
    }
    nextStopEnd[k] = running;
  }

  let frameProtein = "";
  for (let k = 0; k < codonCount; k += 1) {
    frameProtein += CODON_TABLE[codons[k]] ?? "X";
  }

  const orfs = [];
  for (let k = 0; k < codonCount && budget.remaining > 0; k += 1) {
    const end = nextStopEnd[k];
    if (end !== null && codons[k] === START_CODON) {
      const pos = offset + k * 3;
      const endCodonIndex = (end - offset) / 3;
      orfs.push({
        frame: frameLabel,
        start: pos,
        end,
        length: end - pos,
        protein: frameProtein.slice(k, endCodonIndex),
      });
      budget.remaining -= 1;
    }
  }
  return orfs;
}

// Every ORF (ATG to in-frame stop codon) across all six reading frames,
// longest first (capped at MAX_ORFS — see its comment above).
export function findOrfs(sequence) {
  const revComp = reverseComplement(sequence);
  const budget = { remaining: MAX_ORFS };
  const orfs = [
    ...findOrfsInFrame(sequence, 0, "+1", budget),
    ...findOrfsInFrame(sequence, 1, "+2", budget),
    ...findOrfsInFrame(sequence, 2, "+3", budget),
    ...findOrfsInFrame(revComp, 0, "-1", budget),
    ...findOrfsInFrame(revComp, 1, "-2", budget),
    ...findOrfsInFrame(revComp, 2, "-3", budget),
  ];
  return orfs.sort((a, b) => b.length - a.length);
}

// Maps an ORF's [start, end) coordinates back onto the original forward
// sequence. Forward-frame ORFs already use those coordinates; reverse-frame
// ORFs are indexed into the reverse complement, so the range is mirrored
// across the sequence length to find the matching forward-strand slice.
export function mapOrfToSequenceRange(orf, sequenceLength) {
  if (orf.frame.startsWith("+")) {
    return { start: orf.start, end: orf.end };
  }
  return { start: sequenceLength - orf.end, end: sequenceLength - orf.start };
}
