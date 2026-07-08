# Architecture — Codon

## Shape

Static site, no build step, no backend. Native ES modules loaded directly by
the browser via `<script type="module" src="main.js">`.

```
site/
  index.html          # markup shell: input panel, frame viewer, ORF
                       # highlight panel, four side "sticky note" panels
  styles.css           # all styling; DESIGN.md tokens as CSS custom properties
  main.js               # DOM wiring only — reads the textarea, calls the
                       # pure logic modules below, writes results into the DOM
  favicon.svg
  js/
    sequence.js         # normalize/validate a raw string, GC%, base counts,
                       # reverse complement, and the two coordinate-mapping
                       # helpers (normalized <-> raw text, used by the overlay)
    codonTable.js       # the standard genetic code (NCBI table 1)
    translate.js         # per-frame and six-frame translation
    orf.js               # ORF detection across all six frames + the
                       # ORF-coordinate <-> forward-sequence mapping
    codonUsage.js        # codon frequency table
    restrictionSites.js  # enzyme recognition-site search
    overlay.js           # pure HTML-string renderer for the textarea overlay
                       # (base coloring + ORF/site highlight marks)
    examples.js          # sample sequences for the "Load example" button
test/
  *.test.js             # one file per site/js/ module, run with `node --test`
```

## Data flow

Everything is a pure function over a string; `main.js` is the only file that
touches the DOM. On every `input` event on the sequence textarea:

1. `sequence.normalizeSequence` strips whitespace and upper-cases the raw
   value; `findInvalidCharacters`/`isValidSequence` gate everything else.
2. If valid, the normalized sequence feeds `translate.sixFrameTranslation`,
   `orf.findOrfs`, `sequence.gcContent`/`baseCounts`, `codonUsage.codonUsage`,
   and `restrictionSites.findRestrictionSites` — each renders its own panel.
3. The longest ORF (or whichever the user picked from the ORF list) is mapped
   back from frame-local coordinates to the raw textarea text via
   `orf.mapOrfToSequenceRange` (strand mirroring for reverse frames) then
   `sequence.mapNormalizedRangeToRaw` (skips whitespace introduced by
   pasting). Restriction site hits go through the same second step.
4. `overlay.renderOverlayHtml` turns the raw text plus those ranges into the
   HTML painted into `#sequence-overlay`, which sits positioned exactly under
   the transparent-text textarea — see "The overlay trick" below.

State that needs to survive between a full re-render and a lightweight ORF
re-selection (clicking an entry in the ORF list) lives in the single `state`
object at the top of `main.js`.

## The overlay trick

The textarea's own text and background are transparent; a sibling
`<div id="sequence-overlay">` sits absolutely positioned underneath it with
identical font/padding/line-height, showing the colored, mark-wrapped HTML
`renderOverlayHtml` produces. The two are kept in scroll sync on the
textarea's `scroll` event. This is what makes live per-base coloring and the
ORF/restriction-site highlight marks possible in a plain `<textarea>` without
a rich-text editor dependency.

## Testing

`npm test` runs `node --test test/` — no browser, no DOM. Every `site/js/*`
module is pure and unit-tested directly; `main.js` (DOM wiring) is exercised
manually in a real browser instead, since it has no logic of its own to unit
test.

## Running / deploying

Any static file server works locally, e.g. `python3 -m http.server` from
`site/`. Deployment is a straight copy of `site/` to
`apps.charliekrug.com/codon/` — every asset reference is relative, so the
subpath works unmodified (see README).
