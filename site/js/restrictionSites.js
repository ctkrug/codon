// A starter set of common Type II restriction enzymes and their recognition
// sequences. Build stories will expand this list; v1 covers the enzymes a
// hobbyist is most likely to recognize by name.
export const ENZYMES = [
  { name: "EcoRI", site: "GAATTC" },
  { name: "BamHI", site: "GGATCC" },
  { name: "HindIII", site: "AAGCTT" },
  { name: "NotI", site: "GCGGCCGC" },
  { name: "XhoI", site: "CTCGAG" },
  { name: "PstI", site: "CTGCAG" },
];

// Every occurrence of each enzyme's recognition site in the sequence,
// reported with its 0-based start position.
export function findRestrictionSites(sequence) {
  const hits = [];
  for (const enzyme of ENZYMES) {
    let index = sequence.indexOf(enzyme.site);
    while (index !== -1) {
      hits.push({ name: enzyme.name, site: enzyme.site, start: index });
      index = sequence.indexOf(enzyme.site, index + 1);
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}
