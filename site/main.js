import {
  normalizeSequence,
  isValidSequence,
  findInvalidCharacters,
  mapNormalizedRangeToRaw,
  baseCounts,
  gcContent,
} from "./js/sequence.js";
import { findOrfs, mapOrfToSequenceRange } from "./js/orf.js";
import { renderOverlayHtml } from "./js/overlay.js";
import { sixFrameTranslation } from "./js/translate.js";

const textarea = document.getElementById("sequence-input");
const errorEl = document.getElementById("sequence-error");
const lengthEl = document.getElementById("sequence-length");
const overlayEl = document.getElementById("sequence-overlay");
const orfPanel = document.getElementById("orf-highlight-panel");
const orfMetaEl = document.getElementById("orf-highlight-meta");
const orfProteinEl = document.getElementById("orf-highlight-protein");
const emptyFramesEl = document.getElementById("empty-frames");
const frameViewerEl = document.getElementById("frame-viewer");
const gcMeterEl = document.getElementById("gc-meter");
const gcValueEl = document.getElementById("gc-value");
const gcSegments = {
  a: document.getElementById("gc-seg-a"),
  c: document.getElementById("gc-seg-c"),
  g: document.getElementById("gc-seg-g"),
  t: document.getElementById("gc-seg-t"),
};

function describeInvalidCharacters(chars) {
  const list = chars.map((c) => (c === " " ? "space" : `"${c}"`)).join(", ");
  return `Sequence contains characters that aren't A, C, G, or T: ${list}.`;
}

function renderValidationState(raw) {
  const normalized = normalizeSequence(raw);

  if (normalized.length === 0) {
    errorEl.textContent = "";
    lengthEl.textContent = "0 bases";
    textarea.classList.remove("is-invalid");
    return { normalized, valid: false };
  }

  const invalidChars = findInvalidCharacters(normalized);
  if (invalidChars.length > 0) {
    errorEl.textContent = describeInvalidCharacters(invalidChars);
    textarea.classList.add("is-invalid");
    lengthEl.textContent = `${normalized.length} characters (invalid)`;
    return { normalized, valid: false };
  }

  errorEl.textContent = "";
  textarea.classList.remove("is-invalid");
  lengthEl.textContent = `${normalized.length} bases`;
  return { normalized, valid: isValidSequence(normalized) };
}

// Renders the longest ORF (across all six frames) into its own panel and
// returns the raw-text range so the overlay can highlight the same span.
function renderLongestOrf(normalized, raw) {
  const orfs = findOrfs(normalized);
  if (orfs.length === 0) {
    orfPanel.hidden = true;
    return null;
  }

  const longest = orfs[0];
  const normalizedRange = mapOrfToSequenceRange(longest, normalized.length);
  const rawRange = mapNormalizedRangeToRaw(raw, normalizedRange.start, normalizedRange.end);

  orfPanel.hidden = false;
  orfMetaEl.textContent =
    `Frame ${longest.frame} · ${longest.length} bases · ` +
    `position ${longest.start}–${longest.end}`;
  orfProteinEl.textContent = longest.protein;

  return rawRange;
}

function renderFrames(normalized) {
  frameViewerEl.innerHTML = "";
  for (const { frame, protein } of sixFrameTranslation(normalized)) {
    const row = document.createElement("div");
    row.className = "frame-row";

    const label = document.createElement("span");
    label.className = "frame-label";
    label.textContent = frame;

    const proteinEl = document.createElement("span");
    proteinEl.className = "frame-protein";
    proteinEl.textContent = protein || "—";

    row.append(label, proteinEl);
    frameViewerEl.append(row);
  }
  emptyFramesEl.hidden = true;
  frameViewerEl.hidden = false;
}

function clearFrames() {
  frameViewerEl.hidden = true;
  frameViewerEl.innerHTML = "";
  emptyFramesEl.hidden = false;
}

function renderGcMeter(normalized) {
  const counts = baseCounts(normalized);
  const total = normalized.length;
  for (const [base, el] of Object.entries(gcSegments)) {
    const pct = total === 0 ? 0 : (counts[base.toUpperCase()] / total) * 100;
    el.style.width = `${pct}%`;
  }
  const pct = gcContent(normalized);
  gcValueEl.textContent = `${pct.toFixed(1)}% GC`;
  gcMeterEl.setAttribute("aria-label", `GC content: ${pct.toFixed(1)} percent`);
}

function clearGcMeter() {
  for (const el of Object.values(gcSegments)) {
    el.style.width = "0%";
  }
  gcValueEl.textContent = "—";
  gcMeterEl.setAttribute("aria-label", "GC content: no sequence yet");
}

function handleInput() {
  const raw = textarea.value;
  const { normalized, valid } = renderValidationState(raw);

  if (!valid) {
    orfPanel.hidden = true;
    clearFrames();
    clearGcMeter();
    overlayEl.innerHTML = renderOverlayHtml(raw);
    return;
  }

  renderFrames(normalized);
  renderGcMeter(normalized);
  const orfRange = renderLongestOrf(normalized, raw);
  overlayEl.innerHTML = renderOverlayHtml(raw, { orfRange });
}

textarea.addEventListener("input", handleInput);
textarea.addEventListener("scroll", () => {
  overlayEl.scrollTop = textarea.scrollTop;
  overlayEl.scrollLeft = textarea.scrollLeft;
});
handleInput();
