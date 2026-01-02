// Utility helpers to keep form payload preparation consistent across dialogs.

/**
 * Ensures the value is a string, returning an empty string for nullish inputs.
 */
export function stringOrEmpty(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

/**
 * Trims whitespace and returns the sanitized string. Empty results become "".
 */
export function sanitizeText(value) {
  return stringOrEmpty(value).trim();
}

/**
 * Returns a trimmed string or null when the value is empty after trimming.
 */
export function toNullableText(value) {
  const text = sanitizeText(value);
  return text.length ? text : null;
}

/**
 * Attempts to coerce the provided value into a finite number.
 * Returns the fallback when coercion fails.
 */
export function numberFromValue(value, fallback = null) {
  if (value === "" || value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Normalizes truthy values that may come from form controls.
 */
export function booleanFromValue(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return fallback;
}
