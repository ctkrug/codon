import {
  normalizeSequence,
  isValidSequence,
  findInvalidCharacters,
} from "./js/sequence.js";

const textarea = document.getElementById("sequence-input");
const errorEl = document.getElementById("sequence-error");
const lengthEl = document.getElementById("sequence-length");

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

function handleInput() {
  renderValidationState(textarea.value);
}

textarea.addEventListener("input", handleInput);
handleInput();
