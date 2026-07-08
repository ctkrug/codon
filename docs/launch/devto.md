---
title: "Building Codon: a DNA sequence reader that runs entirely in the browser"
published: false
tags: javascript, webdev, bioinformatics, showdev
---

I wanted to look at a DNA sequence. Not run an analysis pipeline, not open a
desktop suite, not make an account somewhere. I had a gene from NCBI in my
clipboard and I wanted to see its reading frames and the protein it codes for,
right now.

The tools that do this well (SnapGene, Geneious, Benchling) are built for people
who do this all day, and they charge and gate accordingly. For a student or a
hobbyist who just wants a quick look, they are far more than the moment calls
for. So I built [Codon](https://apps.charliekrug.com/codon/): paste a sequence
and it shows GC content, all six reading frames, every open reading frame, codon
usage, and common restriction sites, live, with nothing leaving your browser.

It is plain JavaScript, ES modules, no framework, no build step. Here are the
two parts that were more interesting than I expected.

## The colored textarea is a lie

I wanted every base tinted its own color as you type (A, C, G, T each get a
hue), plus the longest ORF boxed and restriction sites underlined, all *inside*
an editable field. A `<textarea>` cannot render styled runs of text, so it does
not do this on its own.

The trick is two layers. A real `<textarea>` sits on top with its text color set
to `transparent` and only its caret visible. Underneath, a `<div>` overlay holds
the same text rebuilt as colored `<span>`s, positioned so the characters line up
exactly. The textarea handles all the editing; the overlay handles all the
color. A scroll listener keeps the overlay's scroll position glued to the
textarea's so they never drift.

The fiddly part is coordinates. The analysis runs on a normalized sequence
(whitespace stripped, uppercased), but the overlay draws on the raw text the
user actually typed, including line breaks. So an ORF found at normalized
position 231 has to be mapped back to the right offset in the raw string. Doing
that per highlight meant rescanning the whole raw text once for every range,
which is fine for one ORF but not for a sequence with thousands of restriction
site hits. I ended up building the normalized-index to raw-index lookup once and
reusing it for every range, and drawing the "is this character inside any
highlighted range" mask with a sweep line (plus one at each range start, minus
one at each end, running sum positive means covered) instead of testing every
character against every range.

## The ORF scanner crashed on a single base

An open reading frame is a run from an ATG start codon to the next in-frame stop
codon. The scanner slices each frame into codons once, does a single backward
pass to record the nearest downstream stop for each position, and translates the
frame once so a nested ORF's protein is a slice rather than a re-translation.

While writing a property-based test with fast-check (assert invariants over
random sequences: an ORF starts with ATG, spans whole codons, ends on a stop),
it threw a `RangeError: Invalid array length`. On a sequence shorter than a
frame's offset, `Math.floor((strand.length - offset) / 3)` goes negative, and
`new Array(negative)` throws. Pasting a single valid base like `A` crashed the
live view. The fix is one `Math.max(0, ...)`, but I would never have typed the
test case "paste exactly one base" by hand. The property test found it for free.

## What I would do differently

The restriction enzyme list is six common ones hard-coded. A real version would
load a proper enzyme database and let you filter by cut type. I would also add
protein export to the clipboard, which is the feature I keep reaching for myself.

The whole thing is a static site with a unit suite at 100% coverage on the pure
logic modules. Code and issues are on
[GitHub](https://github.com/ctkrug/codon); the live tool is at
[apps.charliekrug.com/codon](https://apps.charliekrug.com/codon/).

If you read sequences and there is an obvious thing it should do that it does
not, I would genuinely like to hear it.
