import type { ULIPFeeSchedule } from "@/lib/llm/schemas";

/**
 * Realistic-format mis-sold ULIP. Mirrors the structured output our Day 3
 * vision-extraction step will produce. The `domain/investment/ulip-math.ts`
 * audit engine consumes this shape verbatim.
 *
 * Numbers chosen so that Anjali, on a ₹50,000/year premium for 10 years,
 * sees a defensible "₹2,40,000 saved over 10 years vs term + SIP" headline.
 */

export const SAMPLE_ULIP: ULIPFeeSchedule = {
  productNameRaw: "SuperLife Wealth Plus II — Limited Pay 5",
  insurerNameRaw: "Sample Life Insurance Co.",
  premiumAnnualInr: 50_000,
  termYears: 15,
  sumAssuredInr: 5_00_000,
  lockInYears: 5,
  premiumAllocationByYear: [
    { year: 1, pctOfPremium: 10.0 },
    { year: 2, pctOfPremium: 8.0 },
    { year: 3, pctOfPremium: 5.0 },
    { year: 4, pctOfPremium: 3.0 },
    { year: 5, pctOfPremium: 3.0 },
    { year: 6, pctOfPremium: 0 },
    { year: 7, pctOfPremium: 0 },
    { year: 8, pctOfPremium: 0 },
    { year: 9, pctOfPremium: 0 },
    { year: 10, pctOfPremium: 0 },
  ],
  policyAdminMonthlyInr: 100,
  fundManagementPctAnnual: 1.35,
  mortalityChargePctAnnual: 0.45,
  surrenderScheduleByYear: [
    { year: 1, pctRecoverable: 0 },
    { year: 2, pctRecoverable: 30 },
    { year: 3, pctRecoverable: 50 },
    { year: 4, pctRecoverable: 70 },
    { year: 5, pctRecoverable: 100 },
  ],
};
