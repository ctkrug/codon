# Design — Codon

## 1. Aesthetic direction

**Codon is a paper-and-ink lab notebook.** The page reads like an open page
from a molecular biology notebook on a warm wooden desk: cream paper, dark
indigo ink for structure and headings, and each DNA base annotated the way a
grad student would mark up a printout with four different colored
highlighters (A, C, G, T each get their own hue, used consistently
everywhere a base appears — in the sequence view, the frame viewer, the ORF
highlight, the GC meter).

This is a deliberate break from the darkroom/blueprint/near-black direction
several recent sibling ships have used (a forensic UV table, a drafting
blueprint, a fluorescence microscope). Codon is bright, warm, and legible in
daylight — a notebook, not a lab instrument under a black light.

## 2. Tokens

**Color**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f5efe1` | page background — warm cream paper |
| `--surface-1` | `#fbf7ec` | raised panels (the "page" itself) |
| `--surface-2` | `#eee5d0` | recessed wells (inputs, code blocks) |
| `--text` | `#2b2620` | primary ink |
| `--text-muted` | `#6b6252` | secondary ink, captions |
| `--accent` | `#2f4b7c` | indigo ink — headings, primary buttons, links |
| `--accent-support` | `#b3452c` | rust — secondary emphasis, active tab |
| `--success` | `#4c7a52` | sage — valid sequence, passing state |
| `--danger` | `#b3452c` | rust — invalid character, error state |
| `--base-a` | `#d1495b` | coral — adenine, everywhere a base is shown |
| `--base-c` | `#2a9d8f` | teal — cytosine |
| `--base-g` | `#e0a72e` | amber — guanine |
| `--base-t` | `#6a4c93` | violet — thymine |

Base colors are load-bearing: they appear in the sequence textarea overlay,
the six-frame viewer, ORF highlights, and the GC meter's stacked bar, so a
user's eye learns the mapping once and reuses it everywhere.

**Type**

- Display: **Fraunces** (serif, variable, warm ink-on-paper character) —
  wordmark, page headings.
- UI + data: **IBM Plex Mono** — body copy, controls, and critically the
  sequence/protein text itself, so bases and codons stay column-aligned like
  a typewritten annotation.
- Both load from Google Fonts with `system-ui, sans-serif` /
  `ui-monospace, monospace` fallbacks.
- Scale: 1.25 ratio from a 16px base (16 / 20 / 25 / 31 / 39 / 49px).

**Spacing & shape**

- 8px spacing unit (8/16/24/32/48/64).
- Corner radius: 6px — soft, like a rounded index card, not a sharp
  wireframe and not a pill.
- Shadow: soft warm-toned drop shadow, `0 2px 8px rgba(43, 38, 32, 0.12)`,
  as if the page panel is lifted slightly off the desk.
- Motion: UI transitions 150ms ease-out; live highlight pulses (new ORF,
  updated GC%) 90ms ease-out.

## 3. Layout intent

The hero is the **sequence workspace**: a large ruled-paper panel containing
the input textarea and, once a sequence is pasted, the six-frame viewer with
the longest ORF highlighted inline. On desktop (1440×900) this panel takes
the left ~65% of the viewport; a right-hand column of smaller "sticky note"
panels (GC meter, ORF list, codon usage, restriction sites) stacks
alongside it, each a distinct tilted-slightly card to reinforce the
notebook-margin feel without hurting readability (tilt ≤ 1.5deg, removed
under `prefers-reduced-motion`).

On phone (390×844) the workspace stacks vertically: input first, then the
frame viewer, then the sticky-note panels as full-width cards the user
scrolls through — no dead margins, no fixed-height boxes that clip content.

## 4. Signature detail

The wordmark **codon** renders with its two `o`s as small filled dots
colored `--base-a` and `--base-g`, and a thin SVG double-helix ribbon draws
itself under the hero headline on load (a single slow 1.2s stroke animation,
skipped under `prefers-reduced-motion`) — the one flourish that says
"bioinformatics" before the user reads a word of copy.

## 5. Games/toys juice plan

Not applicable — Codon is a data tool, not a game. Feedback is still
required by D2 (hover/focus/active states, <100ms response, designed empty
state for the input) but no win-condition, score, or SFX plan is needed.
