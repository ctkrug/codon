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
import { codonUsage } from "./js/codonUsage.js";
import { findRestrictionSites } from "./js/restrictionSites.js";
import { EXAMPLE_SEQUENCES } from "./js/examples.js";

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
const orfTitleEl = document.getElementById("orf-highlight-title");
const orfListEl = document.getElementById("orf-list");
const codonTableBodyEl = document.getElementById("codon-table-body");
const siteListEl = document.getElementById("site-list");
const loadExampleBtn = document.getElementById("load-example");

// Tracks the current render's derived data so the ORF list's click handler
// can re-highlight a selection without recomputing everything from scratch.
const state = { normalized: "", raw: "", orfs: [], selectedOrfIndex: 0, siteRanges: [] };

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

// Renders the selected ORF (the longest by default) into its own panel and
// returns the raw-text range so the overlay can highlight the same span.
function renderOrfHighlight() {
  const orf = state.orfs[state.selectedOrfIndex];
  if (!orf) {
    orfPanel.hidden = true;
    return null;
  }

  const normalizedRange = mapOrfToSequenceRange(orf, state.normalized.length);
  const rawRange = mapNormalizedRangeToRaw(state.raw, normalizedRange.start, normalizedRange.end);

  orfPanel.hidden = false;
  orfTitleEl.textContent = state.selectedOrfIndex === 0 ? "Longest ORF" : "Selected ORF";
  orfMetaEl.textContent =
    `Frame ${orf.frame} · ${orf.length} bases · ` +
    `position ${orf.start}–${orf.end}`;
  orfProteinEl.textContent = orf.protein;

  return rawRange;
}

function scrollToRawRange(rawRange) {
  if (!rawRange) return;
  textarea.focus();
  textarea.setSelectionRange(rawRange.start, rawRange.end);
}

// Re-renders the highlight panel and the overlay for the current selection
// without recomputing frames/GC/lists — used by the ORF list's click handler.
function applyOrfSelection(index, { scroll = false } = {}) {
  state.selectedOrfIndex = index;
  renderOrfListSelection();
  const rawRange = renderOrfHighlight();
  overlayEl.innerHTML = renderOverlayHtml(state.raw, {
    orfRange: rawRange,
    siteRanges: state.siteRanges,
  });
  if (scroll) scrollToRawRange(rawRange);
}

function renderOrfListSelection() {
  for (const item of orfListEl.children) {
    const isSelected = Number(item.dataset.index) === state.selectedOrfIndex;
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
  }
}

function renderOrfList(orfs) {
  orfListEl.innerHTML = "";
  if (orfs.length === 0) {
    const empty = document.createElement("li");
    empty.className = "fact-list-empty";
    empty.textContent = "No ORFs found.";
    orfListEl.append(empty);
    return;
  }

  orfs.forEach((orf, index) => {
    const item = document.createElement("li");
    item.dataset.index = String(index);
    item.setAttribute("role", "option");
    item.tabIndex = 0;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "orf-list-item";
    button.textContent = `${orf.frame} · ${orf.length}bp · ${orf.start}–${orf.end}`;
    button.addEventListener("click", () => applyOrfSelection(index, { scroll: true }));

    item.append(button);
    orfListEl.append(item);
  });
  renderOrfListSelection();
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

function renderCodonUsage(normalized) {
  codonTableBodyEl.innerHTML = "";
  const usage = codonUsage(normalized);

  if (usage.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3" class="fact-list-empty">No complete codons yet.</td>';
    codonTableBodyEl.append(row);
    return;
  }

  for (const { codon, count, fraction } of usage) {
    const row = document.createElement("tr");

    const codonCell = document.createElement("td");
    codonCell.textContent = codon;

    const countCell = document.createElement("td");
    countCell.textContent = String(count);

    const pctCell = document.createElement("td");
    pctCell.textContent = `${(fraction * 100).toFixed(1)}%`;

    row.append(codonCell, countCell, pctCell);
    codonTableBodyEl.append(row);
  }
}

function clearCodonUsage() {
  codonTableBodyEl.innerHTML = '<tr><td colspan="3" class="fact-list-empty">No sequence yet.</td></tr>';
}

// Renders the restriction site list and returns each hit's raw-text range so
// the overlay can mark all of them inline, distinct from the ORF highlight.
function renderRestrictionSites(normalized, raw) {
  const sites = findRestrictionSites(normalized);
  siteListEl.innerHTML = "";

  if (sites.length === 0) {
    const empty = document.createElement("li");
    empty.className = "fact-list-empty";
    empty.textContent = "No recognition sites found.";
    siteListEl.append(empty);
    return [];
  }

  const ranges = sites.map((site) => {
    const item = document.createElement("li");
    item.className = "site-list-item";
    item.textContent = `${site.name} · ${site.site} · position ${site.start}`;
    siteListEl.append(item);
    return mapNormalizedRangeToRaw(raw, site.start, site.start + site.site.length);
  });

  return ranges;
}

function clearRestrictionSites() {
  siteListEl.innerHTML = '<li class="fact-list-empty">No sequence yet.</li>';
}

function handleInput() {
  const raw = textarea.value;
  const { normalized, valid } = renderValidationState(raw);
  state.raw = raw;
  state.normalized = normalized;
  state.selectedOrfIndex = 0;

  if (!valid) {
    state.orfs = [];
    orfPanel.hidden = true;
    clearFrames();
    clearGcMeter();
    clearCodonUsage();
    clearRestrictionSites();
    renderOrfList([]);
    overlayEl.innerHTML = renderOverlayHtml(raw);
    return;
  }

  renderFrames(normalized);
  renderGcMeter(normalized);
  renderCodonUsage(normalized);
  state.siteRanges = renderRestrictionSites(normalized, raw);
  state.orfs = findOrfs(normalized);
  renderOrfList(state.orfs);
  const orfRange = renderOrfHighlight();
  overlayEl.innerHTML = renderOverlayHtml(raw, { orfRange, siteRanges: state.siteRanges });
}

let nextExampleIndex = 0;

function loadNextExample() {
  const example = EXAMPLE_SEQUENCES[nextExampleIndex];
  nextExampleIndex = (nextExampleIndex + 1) % EXAMPLE_SEQUENCES.length;
  textarea.value = example.sequence;
  handleInput();
  textarea.focus();
}

textarea.addEventListener("input", handleInput);
textarea.addEventListener("scroll", () => {
  overlayEl.scrollTop = textarea.scrollTop;
  overlayEl.scrollLeft = textarea.scrollLeft;
});
loadExampleBtn.addEventListener("click", loadNextExample);
handleInput();
