/**
 * @file src/constants/index.js
 * @description Centralized constants for the entire application
 */

// Event Status
export const EVENT_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  DRAFT: "draft",
};

export const EVENT_STATUS_LABELS = {
  open: "Dibuka",
  closed: "Ditutup",
  draft: "Draft",
};

// Peserta Status
export const PESERTA_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const PESERTA_STATUS_LABELS = {
  pending: "Menunggu",
  approved: "Diterima",
  rejected: "Ditolak",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  PESERTA: "peserta",
  JURI: "juri",
};

export const USER_ROLE_LABELS = {
  admin: "Admin",
  operator: "Operator",
  peserta: "Peserta",
  juri: "Juri",
};

// Publish Status
export const PUBLISH_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
};

export const PUBLISH_STATUS_LABELS = {
  published: "Dipublikasikan",
  draft: "Draft",
};

// Badge Colors - Status Mapping
export const STATUS_BADGE_COLORS = {
  open: { bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/30", text: "text-emerald-700", darkText: "dark:text-emerald-300", border: "border-emerald-200", darkBorder: "dark:border-emerald-800" },
  closed: { bg: "bg-rose-50", darkBg: "dark:bg-rose-950/30", text: "text-rose-700", darkText: "dark:text-rose-300", border: "border-rose-200", darkBorder: "dark:border-rose-800" },
  draft: { bg: "bg-amber-50", darkBg: "dark:bg-amber-950/30", text: "text-amber-700", darkText: "dark:text-amber-300", border: "border-amber-200", darkBorder: "dark:border-amber-800" },
  pending: { bg: "bg-amber-50", darkBg: "dark:bg-amber-950/30", text: "text-amber-700", darkText: "dark:text-amber-300", border: "border-amber-200", darkBorder: "dark:border-amber-800" },
  approved: { bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/30", text: "text-emerald-700", darkText: "dark:text-emerald-300", border: "border-emerald-200", darkBorder: "dark:border-emerald-800" },
  published: { bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/30", text: "text-emerald-700", darkText: "dark:text-emerald-300", border: "border-emerald-200", darkBorder: "dark:border-emerald-800" },
  rejected: { bg: "bg-rose-50", darkBg: "dark:bg-rose-950/30", text: "text-rose-700", darkText: "dark:text-rose-300", border: "border-rose-200", darkBorder: "dark:border-rose-800" },
  default: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

// API Endpoints
export const API_ENDPOINTS = {
  EVENTS: "/events",
  PESERTA: "/peserta",
  USERS: "/users",
  BERITA: "/berita",
  GALLERY: "/gallery",
  MERCHANDISE: "/merchandise",
  JUARA: "/juara",
  PARTNERSHIPS: "/partnerships",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
};

// Messages
export const MESSAGES = {
  ERROR_GENERIC: "Terjadi kesalahan. Silakan coba lagi.",
  ERROR_NETWORK: "Kesalahan jaringan. Periksa koneksi internet Anda.",
  SUCCESS_CREATE: "Data berhasil dibuat.",
  SUCCESS_UPDATE: "Data berhasil diperbarui.",
  SUCCESS_DELETE: "Data berhasil dihapus.",
  CONFIRM_DELETE: "Apakah Anda yakin ingin menghapus data ini?",
};

const defaultExport = {
  EVENT_STATUS,
  PESERTA_STATUS,
  USER_ROLES,
  STATUS_BADGE_COLORS,
  API_ENDPOINTS,
  PAGINATION,
  UPLOAD_CONFIG,
  MESSAGES,
};

export default defaultExport;
