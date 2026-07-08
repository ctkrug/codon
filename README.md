# Codon

A fast, beautiful bioinformatics scratchpad for the browser. Paste a raw DNA
sequence and instantly see its GC content, all six reading frames, every open
reading frame (ORF), and the translated protein — no server, no login, no lab
software required.

## Why

Real bioinformatics tools (Geneious, SnapGene, ExPASy) are built for
professionals and gatekept behind installs, accounts, or clunky UIs. Codon is
for the hobbyist, the student, and the curious: paste a sequence, see
everything about it, live, in one page.

## What it does

- **GC content** — live percentage as you type or paste, with a visual meter.
- **Six-frame translation** — all three forward and three reverse-complement
  reading frames, translated to protein, updated as you scroll a sequence of
  any length.
- **ORF detection** — every open reading frame highlighted directly on the
  sequence, start (ATG) to stop codon, sortable by length.
- **Codon usage stats** — a breakdown of codon frequency across the sequence.
- **Restriction site finder** — common restriction enzyme recognition sites
  located and marked inline.

## The wow moment

Paste a raw `ACGT...` sequence. The six reading frames light up immediately,
the longest ORF is highlighted, and its translated protein sequence renders
live as you scroll through the DNA — all client-side, all instant.

## Stack

Plain JavaScript (ES modules), no framework, no build step. Ships as a static
site — HTML, CSS, and JS only — so it runs anywhere a browser does. See
[`docs/VISION.md`](docs/VISION.md) for the design rationale,
[`docs/DESIGN.md`](docs/DESIGN.md) for the art direction, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```sh
npm test    # run the unit test suite (node:test)
```

Then open `site/index.html` in a browser — no build step required. The
entire `site/` directory is the deployable app: relative asset paths only,
so it works from any subpath.

## License

MIT — see [`LICENSE`](LICENSE).
