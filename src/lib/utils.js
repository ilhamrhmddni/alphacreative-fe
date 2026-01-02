import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const RAW_MEDIA_BASE =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

const MEDIA_ORIGIN = RAW_MEDIA_BASE.replace(/\/?api\/?$/, "").replace(/\/$/, "");

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function resolveMediaUrl(value) {
  if (!value) return null;
  if (typeof value !== "string") return null;
  if (/^https?:/i.test(value)) {
    return value;
  }

  const normalizedOrigin = MEDIA_ORIGIN.endsWith("/")
    ? MEDIA_ORIGIN.slice(0, -1)
    : MEDIA_ORIGIN;
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  return `${normalizedOrigin}${normalizedPath}`;
}

export function safeDisplayValue(value, { fallback = "-", precision } = {}) {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const lowered = trimmed.toLowerCase();
    if (lowered === "null" || lowered === "undefined") return fallback;

    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      if (typeof precision === "number") {
        return parsed.toFixed(precision);
      }
      return String(parsed);
    }

    return trimmed;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return fallback;
    if (typeof precision === "number") {
      return value.toFixed(precision);
    }
    return String(value);
  }

  return fallback;
}

export function formatScoreDisplay(value, { fallback = "-", decimals = 1 } = {}) {
  const cleaned = safeDisplayValue(value, { fallback });
  if (cleaned === fallback) return fallback;

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) {
    return cleaned;
  }

  const rounded = Number(parsed.toFixed(decimals));
  if (Number.isInteger(rounded)) {
    return safeDisplayValue(rounded, { fallback });
  }

  return safeDisplayValue(rounded, { fallback });
}

export function clampScoreValue(value, min = 0, max = 100) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.min(Math.max(numeric, min), max);
}

export function calculateDetailScore(details) {
  if (!Array.isArray(details) || !details.length) {
    return null;
  }

  const normalized = details
    .map((item) => {
      if (!item) return null;
      const nilai = clampScoreValue(item.nilai);
      const bobot =
        item.bobot === undefined || item.bobot === null
          ? null
          : clampScoreValue(item.bobot, 0, 1);
      if (nilai === null) return null;
      return { nilai, bobot };
    })
    .filter(Boolean);

  if (!normalized.length) {
    return null;
  }

  const hasWeight = normalized.some((item) => item.bobot !== null);

  if (hasWeight) {
    let weightedSum = 0;
    let hasValidWeight = false;
    normalized.forEach((item) => {
      if (item.bobot === null) return;
      hasValidWeight = true;
      weightedSum += item.nilai * item.bobot;
    });
    if (!hasValidWeight) return null;
    return clampScoreValue(weightedSum);
  }

  let total = 0;
  let count = 0;
  normalized.forEach((item) => {
    total += item.nilai;
    count += 1;
  });

  if (!count) {
    return null;
  }

  return clampScoreValue(total / count);
}

export function resolveScoreValue(score) {
  if (!score) return null;

  if (score.useManualNilai) {
    const manual = clampScoreValue(score.nilai);
    if (manual !== null) {
      return manual;
    }
  }

  const detailScore = calculateDetailScore(score.details);
  if (detailScore !== null) {
    return detailScore;
  }

  return clampScoreValue(score.nilai);
}
