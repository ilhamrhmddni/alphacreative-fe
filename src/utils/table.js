/**
 * @file src/utils/table.js
 * @description Shared utility functions for table components
 */

import { STATUS_BADGE_COLORS } from "@/constants";

/**
 * Get badge styling classes based on status
 * @param {string} status - The status value
 * @returns {Object} Object containing badge styling classes
 */
export const getStatusBadgeClasses = (status) => {
  const colors = STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS.default;
  return {
    className: `${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText} ${colors.border} ${colors.darkBorder} border px-2 py-1 rounded-md text-xs font-medium inline-block`,
    color: colors.text,
  };
};

/**
 * Get badge styling for specific status (with fallback)
 * @param {string} status - Status value
 * @param {string} statusLabelMap - Map object for status labels
 * @returns {Object} Complete badge object with className and label
 */
export const getStatusBadge = (status, statusLabelMap) => {
  const classes = getStatusBadgeClasses(status);
  return {
    ...classes,
    label: statusLabelMap?.[status] || status,
  };
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'id-ID')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = "id-ID") => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format datetime for display
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, locale = "id-ID") => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, length = 50) => {
  if (!text) return "-";
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Format category label (convert snake_case/camelCase to Title Case)
 * @param {string} label - Label to format
 * @returns {string} Formatted label
 */
export const formatCategoryLabel = (label) => {
  if (!label) return "-";
  return label
    .replace(/([_-])/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Merge column definitions with common properties
 * @param {Array} columns - Column definitions
 * @returns {Array} Enhanced column definitions
 */
export const enhanceColumns = (columns) => {
  return columns.map((col) => ({
    ...col,
    className: col.className || "px-4 py-2",
  }));
};

/**
 * Get sort indicator classes
 * @param {string} field - Field name
 * @param {string} sortBy - Current sort field
 * @param {string} sortOrder - Current sort order (asc/desc)
 * @returns {string} Classes for sort indicator
 */
export const getSortIndicator = (field, sortBy, sortOrder) => {
  if (field !== sortBy) return "text-muted-foreground";
  return sortOrder === "asc" ? "text-primary" : "text-primary";
};

const defaultExport = {
  getStatusBadgeClasses,
  getStatusBadge,
  formatDate,
  formatDateTime,
  truncateText,
  formatCategoryLabel,
  enhanceColumns,
  getSortIndicator,
};

export default defaultExport;
