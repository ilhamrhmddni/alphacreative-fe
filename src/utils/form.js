/**
 * @file src/utils/form.js
 * @description Shared utility functions for form components
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} Is valid size
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {boolean} Is valid type
 */
export const isValidFileType = (file, allowedTypes = ["image/jpeg", "image/png", "image/webp"]) => {
  return allowedTypes.includes(file.type);
};

/**
 * Reset form state to initial values
 * @param {Object} initialState - Initial form state
 * @returns {Object} Reset form state
 */
export const getInitialFormState = (initialState) => {
  return { ...initialState };
};

/**
 * Merge form data with existing data
 * @param {Object} formData - Form data from submission
 * @param {Object} existingData - Existing data to merge with
 * @returns {Object} Merged data
 */
export const mergeFormData = (formData, existingData = {}) => {
  return {
    ...existingData,
    ...formData,
  };
};

/**
 * Clean form data (remove empty values)
 * @param {Object} formData - Form data to clean
 * @returns {Object} Cleaned form data
 */
export const cleanFormData = (formData) => {
  return Object.fromEntries(
    Object.entries(formData).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
};

/**
 * Get form error message
 * @param {string} fieldName - Field name
 * @param {string} errorType - Error type (required, invalid, etc)
 * @returns {string} Error message
 */
export const getErrorMessage = (fieldName, errorType) => {
  const messages = {
    required: `${fieldName} harus diisi.`,
    invalid: `${fieldName} tidak valid.`,
    email: "Email tidak valid.",
    url: "URL tidak valid.",
    minLength: `${fieldName} terlalu pendek.`,
    maxLength: `${fieldName} terlalu panjang.`,
    match: `${fieldName} tidak cocok.`,
  };
  return messages[errorType] || "Terjadi kesalahan validasi.";
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Create FormData object from form input
 * @param {HTMLFormElement} form - Form element
 * @returns {FormData} FormData object
 */
export const createFormData = (form) => {
  return new FormData(form);
};

const defaultExport = {
  isValidEmail,
  isValidUrl,
  isValidFileSize,
  isValidFileType,
  getInitialFormState,
  mergeFormData,
  cleanFormData,
  getErrorMessage,
  formatFileSize,
  createFormData,
};

export default defaultExport;
