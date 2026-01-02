/**
 * @file src/utils/string.js
 * @description String manipulation utilities
 */

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  return str.split(" ").map((word) => capitalize(word)).join(" ");
};

/**
 * Convert camelCase to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
export const camelToKebab = (str) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
export const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Generate slug from string
 * @param {string} str - String to slugify
 * @returns {string} Slug string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

/**
 * Remove HTML tags from string
 * @param {string} str - String with HTML
 * @returns {string} Plain text string
 */
export const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
};

/**
 * Highlight search term in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @returns {string} HTML with highlighted term
 */
export const highlightSearch = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

/**
 * Extract numbers from string
 * @param {string} str - String to extract from
 * @returns {string} Numbers only
 */
export const extractNumbers = (str) => {
  return str.replace(/\D/g, "");
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = extractNumbers(phone);
  const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (!match) return phone;
  return `+${match[1]}-${match[2]}-${match[3]}`;
};

const defaultExport = {
  capitalize,
  toTitleCase,
  camelToKebab,
  kebabToCamel,
  slugify,
  truncate,
  stripHtml,
  highlightSearch,
  extractNumbers,
  formatPhoneNumber,
};

export default defaultExport;
