# Backlog — Codon

Three epics, ordered so the wow moment ships first. Every story has
verifiable acceptance criteria a later QA pass can check true/false.

## Epic 1 — Core workspace & the wow moment

### [x] 1. Paste a sequence, see live six-frame translation with the longest ORF highlighted
*This is the wow moment — it ships before anything else.*
- Pasting a valid ACGT sequence renders all six reading frames within
  100ms for sequences up to 10kb.
- The longest ORF across all six frames is visually highlighted on the
  sequence and its protein translation is visible without scrolling away
  from the sequence.
- Editing or appending to the sequence updates the frames and the ORF
  highlight live, with no submit button.

### [x] 2. Sequence input validation and inline errors
- Pasting text containing non-ACGT characters shows an inline error
  naming the specific offending characters, not a crash or a silent
  strip.
- An empty input shows a designed empty state (not a blank page).

### [x] 3. GC content meter
- GC% updates live as the sequence changes and matches a manually
  computed value for a known test sequence.
- The meter is a visual bar rendered with the base color tokens from
  `docs/DESIGN.md`, not a bare number.

### [x] 4. Design polish: workspace layout
- Layout matches `docs/DESIGN.md`'s layout intent at 390px, 768px, and
  1440px widths with no horizontal scroll and no dead empty margins.
- Every interactive control (textarea, buttons) has a visibly themed
  hover, focus-visible, and active state.

## Epic 2 — Sequence intelligence

### [x] 5. ORF list panel
- All detected ORFs are listed sorted longest-first, each showing frame,
  start/end position, and length.
- Selecting an ORF in the list highlights it on the sequence view and
  scrolls it into view.

### [x] 6. Codon usage stats panel
- The codon usage table shows every codon present in the sequence with
  its count and percentage, sorted by frequency.
- The table updates live when the sequence changes.

### [x] 7. Restriction site finder panel
- Every recognition site from the enzyme list (`site/js/restrictionSites.js`)
  present in the sequence is located and listed with enzyme name and
  position.
- Sites are marked inline on the sequence view with a marker visually
  distinct from the ORF highlight.

### [ ] 8. Frame viewer scroll sync
- Scrolling the sequence view keeps the six-frame viewer and the
  highlighted ORF's translation in sync.
- Verified smooth (no dropped-frame stutter noted in manual QA) on a
  sequence of at least 5kb.

### [x] 9. Design polish: data panels
- The ORF list, codon usage, and restriction site panels use the
  "sticky note" card treatment and base color tokens from
  `docs/DESIGN.md`.
- Panels are keyboard-navigable (sane tab order, focus-visible) and
  screen-reader labeled.

## Epic 3 — Polish, accessibility & shareability

### [x] 10. Mobile layout
- At 390px width, all panels stack vertically with no horizontal scroll
  and no clipped content.
- Touch targets are at least 44px.

### [x] 11. Sample sequence loader
- A "load example" control populates the input with a real short coding
  sequence so a first-time visitor sees the wow moment without pasting
  anything themselves.
- At least two distinct example sequences are available.

### [ ] 12. Copy/export results
- A control copies the selected ORF's protein translation to the
  clipboard and shows a visible confirmation state.
- The copy control is operable via keyboard, not mouse-only.

### [x] 13. Accessibility pass
- Tab order reaches every control in a logical sequence; icon-only
  buttons have `aria-label`s.
- Live-updating stats (GC%, ORF count) are announced via an `aria-live`
  region.

### [x] 14. Design polish: brand & signature detail
- The animated double-helix wordmark detail from `docs/DESIGN.md` is
  implemented and honors `prefers-reduced-motion`.
- The page does not blind a dark-mode-preferring visitor (per
  `docs/DESIGN.md`'s A11y note), even if only one full treatment ships.
