import { CODON_TABLE } from "./codonTable.js";
import { reverseComplement } from "./sequence.js";

export function translateCodon(codon) {
  return CODON_TABLE[codon] ?? "X";
}

// Translates one reading frame starting at `offset` (0, 1, or 2) into the
// forward strand, stopping short of any trailing partial codon.
export function translateFrame(sequence, offset) {
  let protein = "";
  for (let i = offset; i + 3 <= sequence.length; i += 3) {
    protein += translateCodon(sequence.slice(i, i + 3));
  }
  return protein;
}

// All six reading frames: +1/+2/+3 on the forward strand, -1/-2/-3 on the
// reverse complement, each reported with its protein translation.
export function sixFrameTranslation(sequence) {
  const revComp = reverseComplement(sequence);
  return [
    { frame: "+1", offset: 0, protein: translateFrame(sequence, 0) },
    { frame: "+2", offset: 1, protein: translateFrame(sequence, 1) },
    { frame: "+3", offset: 2, protein: translateFrame(sequence, 2) },
    { frame: "-1", offset: 0, protein: translateFrame(revComp, 0) },
    { frame: "-2", offset: 1, protein: translateFrame(revComp, 1) },
    { frame: "-3", offset: 2, protein: translateFrame(revComp, 2) },
  ];
}
