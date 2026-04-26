import type { LanguageCode } from "./languages";

/**
 * Indian numbering (lakhs / crores) for currency. Anjali never sees
 * "₹240,000" — she sees "₹2,40,000" or in long form "2.4 lakh".
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_FORMATTER_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER_FORMATTER_IN = new Intl.NumberFormat("en-IN");

export function formatINR(amount: number, options: { precise?: boolean } = {}): string {
  if (!Number.isFinite(amount)) return "₹—";
  return options.precise
    ? INR_FORMATTER_PRECISE.format(amount)
    : INR_FORMATTER.format(amount);
}

export function formatNumberIN(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return NUMBER_FORMATTER_IN.format(value);
}

/**
 * Long-form INR for headlines: ₹2.4 lakh, ₹14 crore. Threshold-driven.
 * Returns short-form digits below 1 lakh.
 */
export function formatINRLong(amount: number, language: LanguageCode = "hi-IN"): string {
  if (!Number.isFinite(amount)) return "₹—";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const isHindi = language.startsWith("hi") || language.startsWith("mr");

  if (abs >= 1_00_00_000) {
    const value = abs / 1_00_00_000;
    const unit = isHindi ? "करोड़" : "crore";
    return `${sign}₹${trim(value)} ${unit}`;
  }
  if (abs >= 1_00_000) {
    const value = abs / 1_00_000;
    const unit = isHindi ? "लाख" : "lakh";
    return `${sign}₹${trim(value)} ${unit}`;
  }
  if (abs >= 1_000) {
    const value = abs / 1_000;
    const unit = isHindi ? "हज़ार" : "thousand";
    return `${sign}₹${trim(value)} ${unit}`;
  }
  return formatINR(amount);
}

function trim(value: number): string {
  // 2.40 → 2.4, 2.00 → 2, 2.45 → 2.45
  return Number.parseFloat(value.toFixed(2)).toString();
}

/**
 * Format a percent (0.118) → "11.8%". Tabular feel.
 */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) return "—%";
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

/**
 * Format a date in Indian conventions. "20 Aug 2032" by default.
 */
export function formatDate(input: string | number | Date, language: LanguageCode = "en-IN"): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language.startsWith("hi") ? "hi-IN" : "en-IN";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * "in 4 days", "kal", "abhi" — for activity feeds.
 * Lightweight wrapper; full i18n verbiage lives in strings.ts.
 */
export function formatRelativeMinutes(minutesAgo: number, language: LanguageCode = "hi-IN"): string {
  const isHindi = language.startsWith("hi");
  if (minutesAgo < 1) return isHindi ? "अभी" : "now";
  if (minutesAgo < 60) return isHindi ? `${minutesAgo} मिनट पहले` : `${minutesAgo} min ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return isHindi ? `${hoursAgo} घंटे पहले` : `${hoursAgo}h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo === 1) return isHindi ? "कल" : "yesterday";
  if (daysAgo < 7) return isHindi ? `${daysAgo} दिन पहले` : `${daysAgo}d ago`;
  const weeksAgo = Math.floor(daysAgo / 7);
  return isHindi ? `${weeksAgo} हफ़्ते पहले` : `${weeksAgo}w ago`;
}
