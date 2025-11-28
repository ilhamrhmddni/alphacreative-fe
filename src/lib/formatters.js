const DEFAULT_DATE_OPTIONS = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export function formatDate(dateLike, options = DEFAULT_DATE_OPTIONS, locale = "id-ID") {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, options);
}

export function formatCurrency(
  value,
  {
    locale = "id-ID",
    currency = "IDR",
    maximumFractionDigits = 0,
    minimumFractionDigits,
  } = {}
) {
  const amount = Number(value) || 0;
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
    minimumFractionDigits,
  });
}
