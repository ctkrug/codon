import { test } from "node:test";
import assert from "node:assert/strict";
import { renderOverlayHtml } from "../site/js/overlay.js";

test("renderOverlayHtml colors each base with its DESIGN.md class", () => {
  const html = renderOverlayHtml("ACGT");
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="base-c">C</span>' +
      '<span class="base-g">G</span><span class="base-t">T</span>'
  );
});

test("renderOverlayHtml returns an empty string for empty input", () => {
  assert.equal(renderOverlayHtml(""), "");
});

test("renderOverlayHtml marks non-ACGT characters as invalid without crashing", () => {
  const html = renderOverlayHtml("AXN");
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="base-invalid">X</span><span class="base-invalid">N</span>'
  );
});

test("renderOverlayHtml passes whitespace through unstyled", () => {
  const html = renderOverlayHtml("AC GT");
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="base-c">C</span> ' +
      '<span class="base-g">G</span><span class="base-t">T</span>'
  );
});

test("renderOverlayHtml passes an embedded newline through unstyled", () => {
  const html = renderOverlayHtml("AC\nGT");
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="base-c">C</span>\n' +
      '<span class="base-g">G</span><span class="base-t">T</span>'
  );
});

test("renderOverlayHtml ignores a degenerate (empty or inverted) site range", () => {
  const html = renderOverlayHtml("ACGT", { siteRanges: [{ start: 2, end: 2 }] });
  assert.ok(!html.includes("site-mark"));
});

test("renderOverlayHtml escapes HTML-significant characters", () => {
  const html = renderOverlayHtml("<A&>");
  assert.ok(!html.includes("<A&>"));
  assert.match(html, /&lt;/);
  assert.match(html, /&amp;/);
  assert.match(html, /&gt;/);
});

test("renderOverlayHtml wraps an orfRange in a mark element", () => {
  const html = renderOverlayHtml("AACCGGTT", { orfRange: { start: 2, end: 6 } });
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="base-a">A</span>' +
      '<mark class="orf-mark"><span class="base-c">C</span><span class="base-c">C</span>' +
      '<span class="base-g">G</span><span class="base-g">G</span></mark>' +
      '<span class="base-t">T</span><span class="base-t">T</span>'
  );
});

test("renderOverlayHtml supports an orfRange reaching the end of the text", () => {
  const html = renderOverlayHtml("AACC", { orfRange: { start: 2, end: 4 } });
  assert.ok(html.endsWith("</mark>"));
});

test("renderOverlayHtml wraps siteRanges in span markers distinct from the ORF mark", () => {
  const html = renderOverlayHtml("AACCGGTT", { siteRanges: [{ start: 1, end: 3 }] });
  assert.equal(
    html,
    '<span class="base-a">A</span><span class="site-mark"><span class="base-a">A</span>' +
      '<span class="base-c">C</span></span><span class="base-c">C</span>' +
      '<span class="base-g">G</span><span class="base-g">G</span>' +
      '<span class="base-t">T</span><span class="base-t">T</span>'
  );
});

test("renderOverlayHtml nests a site marker inside an overlapping ORF mark", () => {
  const html = renderOverlayHtml("AACCGGTT", {
    orfRange: { start: 0, end: 8 },
    siteRanges: [{ start: 2, end: 4 }],
  });
  assert.match(html, /<mark class="orf-mark"><span class="base-a">A<\/span><span class="base-a">A<\/span><span class="site-mark">/);
  assert.ok(html.trim().endsWith("</mark>"));
});

test("renderOverlayHtml merges two overlapping siteRanges into one continuous marker", () => {
  // Two restriction-site hits whose ranges overlap (e.g. two enzymes
  // matching an overlapping stretch) must render as a single contiguous
  // <span> covering their union, not close and immediately reopen at the
  // overlap boundary.
  const html = renderOverlayHtml("AAAAAAAA", {
    siteRanges: [
      { start: 0, end: 4 },
      { start: 2, end: 6 },
    ],
  });
  assert.equal((html.match(/class="site-mark"/g) ?? []).length, 1);
  const base = '<span class="base-a">A</span>';
  assert.equal(html, `<span class="site-mark">${base.repeat(6)}</span>${base.repeat(2)}`);
});

test("renderOverlayHtml stays fast with thousands of site ranges over a long text", () => {
  // Checking every character against every range independently is
  // O(length * ranges) — a realistic dense repeat (e.g. a tandem repeat of
  // a 6bp restriction site) can produce thousands of overlapping ranges and
  // hang the tab. This pins it to a size a real paste could hit.
  const rawText = "GAATTC".repeat(16667); // ~100,000 characters
  const siteRanges = [];
  for (let i = 0; i < rawText.length; i += 6) siteRanges.push({ start: i, end: i + 6 });
  const started = Date.now();
  const html = renderOverlayHtml(rawText, { siteRanges });
  const elapsed = Date.now() - started;
  assert.ok(html.includes('class="site-mark"'));
  assert.ok(elapsed < 1000, `expected renderOverlayHtml to finish in under 1s, took ${elapsed}ms`);
});
