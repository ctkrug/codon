# Vision — Codon

## The problem

Looking at a DNA sequence and understanding what it encodes requires either
professional software (Geneious, SnapGene, CLC Genomics Workbench — paid,
installed, built for a lab workflow) or free-but-clunky web tools (ExPASy
Translate, NCBI ORFfinder) that solve one narrow task each, require multiple
tabs, and look like they haven't been touched since 2005. There's no single
page where a curious person can paste a sequence and *see* it — structure,
translation, and features — at a glance.

## Who it's for

The hobbyist and the student, not the lab. Someone doing a genetics course
problem set, checking a plasmid map from a kit, curious what a sequence from
a genealogy report actually encodes, or just playing with synthetic biology
as a hobby. They know what GC content and an ORF are; they don't want to
install anything or make an account to check.

## The core idea

One page, one textarea, six frames. Paste a raw ACGT sequence and every
useful view of it — GC content, all six reading frames, every open reading
frame, codon usage, restriction sites — renders immediately, client-side, no
server round-trip. Scrolling the sequence keeps the frame viewer and the
highlighted ORF's live translation in sync, so the sequence and its meaning
are never more than a glance apart.

## Key design decisions

- **No backend.** Everything is a pure function over a string — GC content,
  translation, ORF detection are all deterministic and fast enough to run
  on every keystroke for realistic sequence lengths. A server adds latency,
  cost, and a reason to distrust what happens to pasted data; none of that
  is needed.
- **No build step for the shipped site.** Native ES modules, one `<script
  type="module">`, deployable as flat static files to any subpath (see
  `README.md`). Keeps the project inspectable and easy to keep alive for
  years without a toolchain going stale.
- **Bases are colored, consistently, everywhere.** A, C, G, T each get one
  color (see `docs/DESIGN.md`) used in the sequence view, the frame viewer,
  and the GC meter, so the eye learns the mapping once instead of
  re-reading labels in every panel.
- **The wow moment ships first.** Six-frame translation with the longest ORF
  highlighted and translated live is the first story in the backlog — the
  demo has to work before codon usage or restriction sites are built.
- **Correctness over enzyme-catalog breadth.** v1 ships a small, well-known
  set of restriction enzymes and the standard genetic code rather than a
  configurable/exhaustive catalog — depth on the core flow beats breadth of
  options nobody asked for.

## What "v1 done" looks like

- Paste (or type) a DNA sequence and see, live and without a submit button:
  GC content, all six reading frames translated, every ORF found and
  sortable by length, codon usage stats, and restriction site hits.
  Invalid characters are called out inline, not silently dropped.
- The longest ORF is highlighted on the sequence and its protein
  translation is visible without scrolling away from the sequence itself.
- The page matches `docs/DESIGN.md`: composed and legible at 390px and
  1440px, every control themed and keyboard-accessible, a designed empty
  state before any sequence is pasted.
- `npm test` is green in CI on every push.
