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
