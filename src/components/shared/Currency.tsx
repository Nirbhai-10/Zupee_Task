import {
  formatINR,
  formatINRLong,
  formatNumberIN,
} from "@/lib/i18n/format";
import type { LanguageCode } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils/cn";

type CurrencyProps = {
  /** Rupees. Pass paise as `amount / 100` upstream. */
  amount: number;
  /** "compact" → ₹2.4 lakh; "full" → ₹2,40,000; "precise" → ₹2,40,000.50 */
  variant?: "full" | "compact" | "precise";
  language?: LanguageCode;
  /** Pure number, no currency symbol. */
  bare?: boolean;
  className?: string;
};

/**
 * Renders an INR amount in Indian numbering with tabular numerals so
 * columns of currency line up. Compact form uses lakh / crore.
 */
export function Currency({
  amount,
  variant = "full",
  language = "en-IN",
  bare = false,
  className,
}: CurrencyProps) {
  let display: string;
  if (bare) {
    display = formatNumberIN(amount);
  } else if (variant === "compact") {
    display = formatINRLong(amount, language);
  } else if (variant === "precise") {
    display = formatINR(amount, { precise: true });
  } else {
    display = formatINR(amount);
  }
  return (
    <span className={cn("font-mono tabular-nums", className)}>{display}</span>
  );
}
