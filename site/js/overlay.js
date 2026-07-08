const BASE_CLASS = { A: "base-a", C: "base-c", G: "base-g", T: "base-t" };

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function escapeChar(char) {
  return ESCAPE[char] ?? char;
}

function inRange(index, range) {
  return !!range && index >= range.start && index < range.end;
}

function inAnyRange(index, ranges) {
  return ranges.some((range) => inRange(index, range));
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

  for (let i = 0; i <= rawText.length; i += 1) {
    const wantOrf = i < rawText.length && inRange(i, orfRange);
    const wantSite = i < rawText.length && inAnyRange(i, siteRanges);

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
