const BASE_CLASS = { A: "base-a", C: "base-c", G: "base-g", T: "base-t" };

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function escapeChar(char) {
  return ESCAPE[char] ?? char;
}

function inRange(index, range) {
  return !!range && index >= range.start && index < range.end;
}

// A boolean "is this index inside any range" lookup for every index in one
// pass, instead of testing each index against every range independently
// (checkingAnyRange in the render loop below is O(length * ranges.length),
// which is slow enough to hang the tab once a sequence has thousands of
// site hits — a real tandem repeat of a short recognition site gets there).
// Classic sweep-line: +1 at each range's start, -1 at its end, then a
// running total is positive exactly where at least one range covers.
function buildCoverage(length, ranges) {
  if (ranges.length === 0) return null;
  const delta = new Array(length + 1).fill(0);
  for (const range of ranges) {
    const start = Math.max(0, range.start);
    const end = Math.min(length, range.end);
    if (start >= end) continue;
    delta[start] += 1;
    delta[end] -= 1;
  }
  const coverage = new Array(length);
  let running = 0;
  for (let i = 0; i < length; i += 1) {
    running += delta[i];
    coverage[i] = running > 0;
  }
  return coverage;
}

// Builds the HTML for the textarea's live overlay: every base gets its
// docs/DESIGN.md color class, non-ACGT characters get a distinct "invalid"
// class instead of crashing, and the optional orfRange/siteRanges (raw-text
// index ranges) are wrapped in <mark>/<span> so the ORF highlight and
// restriction-site markers render inline in exact character alignment with
// the textarea underneath.
export function renderOverlayHtml(rawText, { orfRange = null, siteRanges = [] } = {}) {
  let html = "";
  let orfOpen = false;
  let siteOpen = false;
  const siteCoverage = buildCoverage(rawText.length, siteRanges);

  for (let i = 0; i <= rawText.length; i += 1) {
    const wantOrf = i < rawText.length && inRange(i, orfRange);
    const wantSite = i < rawText.length && siteCoverage !== null && siteCoverage[i];

    if (siteOpen && !wantSite) {
      html += "</span>";
      siteOpen = false;
    }
    if (orfOpen && !wantOrf) {
      html += "</mark>";
      orfOpen = false;
    }
    if (i === rawText.length) break;

    if (wantOrf && !orfOpen) {
      html += '<mark class="orf-mark">';
      orfOpen = true;
    }
    if (wantSite && !siteOpen) {
      html += '<span class="site-mark">';
      siteOpen = true;
    }

    const char = rawText[i];
    const upper = char.toUpperCase();
    if (BASE_CLASS[upper]) {
      html += `<span class="${BASE_CLASS[upper]}">${escapeChar(char)}</span>`;
    } else if (/\s/.test(char)) {
      html += char === "\n" ? "\n" : escapeChar(char);
    } else {
      html += `<span class="base-invalid">${escapeChar(char)}</span>`;
    }
  }

  return html;
}
