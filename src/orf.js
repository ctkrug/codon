import { CODON_TABLE, START_CODON, STOP_SYMBOL } from "./codonTable.js";
import { reverseComplement } from "./sequence.js";

// Scans one strand/offset for ATG...stop runs and returns each ORF with its
// coordinates on that strand, matching `translateFrame`'s codon boundaries.
function findOrfsInFrame(strand, offset, frameLabel) {
  const orfs = [];
  let i = offset;
  while (i + 3 <= strand.length) {
    if (strand.slice(i, i + 3) === START_CODON) {
      let j = i;
      while (j + 3 <= strand.length) {
        const codon = strand.slice(j, j + 3);
        const amino = CODON_TABLE[codon];
        j += 3;
        if (amino === STOP_SYMBOL) {
          orfs.push({
            frame: frameLabel,
            start: i,
            end: j,
            length: j - i,
            protein: translateRange(strand, i, j),
          });
          break;
        }
      }
    }
    i += 3;
  }
  return orfs;
}

function translateRange(strand, start, end) {
  let protein = "";
  for (let i = start; i + 3 <= end; i += 3) {
    protein += CODON_TABLE[strand.slice(i, i + 3)] ?? "X";
  }
  return protein;
}

// Every ORF (ATG to in-frame stop codon) across all six reading frames,
// longest first.
export function findOrfs(sequence) {
  const revComp = reverseComplement(sequence);
  const orfs = [
    ...findOrfsInFrame(sequence, 0, "+1"),
    ...findOrfsInFrame(sequence, 1, "+2"),
    ...findOrfsInFrame(sequence, 2, "+3"),
    ...findOrfsInFrame(revComp, 0, "-1"),
    ...findOrfsInFrame(revComp, 1, "-2"),
    ...findOrfsInFrame(revComp, 2, "-3"),
  ];
  return orfs.sort((a, b) => b.length - a.length);
}
