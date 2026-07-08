// Counts each in-frame codon (offset 0, forward strand) and returns them
// sorted by frequency, descending. Later work adds coverage for arbitrary
// frames/strands; v1 covers the common case of an already-oriented CDS.
export function codonUsage(sequence) {
  const counts = new Map();
  for (let i = 0; i + 3 <= sequence.length; i += 3) {
    const codon = sequence.slice(i, i + 3);
    counts.set(codon, (counts.get(codon) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  return [...counts.entries()]
    .map(([codon, count]) => ({ codon, count, fraction: count / total }))
    .sort((a, b) => b.count - a.count);
}
