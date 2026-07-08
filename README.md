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

- **GC content** — live percentage as you type or paste, with a stacked
  per-base meter.
- **Six-frame translation** — all three forward and three reverse-complement
  reading frames, translated to protein live on every edit.
- **ORF detection** — every open reading frame found across all six frames,
  listed longest-first; the longest is highlighted directly on the sequence
  by default, and clicking any other one in the list highlights and scrolls
  to it instead.
- **Codon usage stats** — every codon present, with its count and share of
  the sequence, sorted by frequency.
- **Restriction site finder** — common restriction enzyme recognition sites
  located, listed by name and position, and marked inline on the sequence.
- **Load example** — two real coding sequences to try instantly, no pasting
  required.

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

Then serve `site/` with any static file server and open it in a browser —
no build step required:

```sh
cd site && python3 -m http.server 8080   # or `npx serve`, etc.
```

Opening `site/index.html` directly via a `file://` URL will not work: browsers
block cross-origin `<script type="module">` loads under the `file://` scheme.
The entire `site/` directory is the deployable app: relative asset paths only,
so it works unmodified from any subpath a static server serves it from.

## License

MIT — see [`LICENSE`](LICENSE).
