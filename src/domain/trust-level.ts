import type { TrustLevel } from "./types";

/**
 * Trust ladder: how a Saathi relationship deepens over time.
 *
 *   new                 → first message arrives, no defenses yet
 *   first_defense       → 1 defense (usually a scam) caught
 *   multiple_defenses   → ≥3 defenses, family loop active
 *   invested            → first investment plan executed via UPI Autopay
 *   seasoned            → ≥6 months invested, seasonal milestones hit
 */

export const TRUST_ORDER: TrustLevel[] = [
  "new",
  "first_defense",
  "multiple_defenses",
  "invested",
  "seasoned",
];

export function trustGte(a: TrustLevel, b: TrustLevel): boolean {
  return TRUST_ORDER.indexOf(a) >= TRUST_ORDER.indexOf(b);
}

export function nextTrustLevel(current: TrustLevel, defenseCount: number, hasInvested: boolean, monthsInvested: number): TrustLevel {
  if (hasInvested && monthsInvested >= 6) return "seasoned";
  if (hasInvested) return "invested";
  if (defenseCount >= 3) return "multiple_defenses";
  if (defenseCount >= 1) return "first_defense";
  return current;
}

export function trustLevelLabel(level: TrustLevel, language: "hi-IN" | "en-IN" = "hi-IN"): string {
  if (language === "hi-IN") {
    return {
      new: "नए हैं",
      first_defense: "पहली बार बचाए गए",
      multiple_defenses: "पुराने साथी",
      invested: "निवेशक",
      seasoned: "अनुभवी निवेशक",
    }[level];
  }
  return {
    new: "New",
    first_defense: "First defense",
    multiple_defenses: "Multiple defenses",
    invested: "Invested",
    seasoned: "Seasoned",
  }[level];
}
