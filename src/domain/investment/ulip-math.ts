import type { ULIPFeeSchedule } from "@/lib/llm/schemas";

/**
 * Deterministic ULIP audit math. Pure functions, no LLM. The audit voice
 * generator (an LLM call) consumes this output and explains it — it
 * never invents numbers.
 *
 * The engine projects two scenarios over the policy term:
 *
 *   1. ULIP held to maturity.
 *   2. "Term insurance + direct equity SIP" alternative — same monthly
 *      outflow as the ULIP premium, split between a pure-protection term
 *      plan and an index/large-cap SIP.
 *
 * Output is auditable. We expose the year-by-year cash flow so a savvy
 * user (or a regulator) can re-derive every number we show.
 */

export type ULIPYear = {
  year: number;
  premium: number;
  allocationCharge: number;
  adminCharge: number;
  fmcCharge: number;
  mortalityCharge: number;
  netInvested: number;
  fundValueEnd: number;
};

export type ULIPProjection = {
  yearByYear: ULIPYear[];
  totalPremiumPaid: number;
  totalChargesPaid: number;
  finalFundValue: number;
  /** CAGR of total premium → final fund value over term. */
  effectiveAnnualReturn: number;
};

export type AlternativeProjection = {
  termInsuranceAnnualPremium: number;
  monthlySIP: number;
  finalFundValue: number;
  /** CAGR of total contribution → final fund value over term. */
  effectiveAnnualReturn: number;
};

export type ULIPAuditResult = {
  productName: string;
  insurerName: string;
  termYears: number;
  ulip: ULIPProjection;
  alternative: AlternativeProjection;
  /** Difference in final fund value: alternative – ULIP. ₹0 if ULIP wins. */
  lifetimeSavingsInr: number;
  assumptions: {
    ulipGrossEquityReturn: number;
    sipGrossEquityReturn: number;
    termInsurancePremiumPerLakh: number;
  };
};

export type ULIPAuditOptions = {
  /** Default 0.10 — long-run gross equity assumption for the ULIP fund. */
  ulipGrossEquityReturn?: number;
  /** Default 0.12 — long-run gross equity assumption for the alternative SIP. */
  sipGrossEquityReturn?: number;
  /** Default ₹3.36/lakh — rough LIC Tech Term annual premium per ₹1L of sum-assured for a 30-year-old non-smoker female. */
  termInsurancePremiumPerLakh?: number;
};

const DEFAULT_OPTIONS: Required<ULIPAuditOptions> = {
  ulipGrossEquityReturn: 0.10,
  sipGrossEquityReturn: 0.12,
  termInsurancePremiumPerLakh: 3.36,
};

export function projectULIP(
  fees: ULIPFeeSchedule,
  options: ULIPAuditOptions = {},
): ULIPProjection {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const allocationByYear = new Map(
    fees.premiumAllocationByYear.map((p) => [p.year, p.pctOfPremium]),
  );

  let fundValue = 0;
  let totalCharges = 0;
  const yearByYear: ULIPYear[] = [];

  for (let y = 1; y <= fees.termYears; y++) {
    const premium = fees.premiumAnnualInr;
    const allocPct = allocationByYear.get(y) ?? 0;
    const allocationCharge = premium * (allocPct / 100);
    const netAfterAlloc = premium - allocationCharge;

    // Premium credited at the start of the year, then admin deducted monthly.
    fundValue += netAfterAlloc;
    const adminCharge = fees.policyAdminMonthlyInr * 12;
    fundValue -= adminCharge;

    // Apply gross equity return for the year.
    const fundAfterReturn = fundValue * (1 + opts.ulipGrossEquityReturn);

    // Fund management charge on fund value (post-return is the standard convention).
    const fmcCharge = fundAfterReturn * (fees.fundManagementPctAnnual / 100);

    // Mortality charge on the *sum at risk* = max(sumAssured – fundValue, 0).
    const sumAtRisk = Math.max(fees.sumAssuredInr - fundAfterReturn, 0);
    const mortalityCharge = sumAtRisk * (fees.mortalityChargePctAnnual / 100);

    fundValue = fundAfterReturn - fmcCharge - mortalityCharge;
    if (fundValue < 0) fundValue = 0;

    const yearCharges = allocationCharge + adminCharge + fmcCharge + mortalityCharge;
    totalCharges += yearCharges;

    yearByYear.push({
      year: y,
      premium,
      allocationCharge: Math.round(allocationCharge),
      adminCharge: Math.round(adminCharge),
      fmcCharge: Math.round(fmcCharge),
      mortalityCharge: Math.round(mortalityCharge),
      netInvested: Math.round(netAfterAlloc - adminCharge),
      fundValueEnd: Math.round(fundValue),
    });
  }

  const totalPremiumPaid = fees.premiumAnnualInr * fees.termYears;
  const cagr =
    fundValue > 0
      ? Math.pow(fundValue / totalPremiumPaid, 1 / fees.termYears) - 1
      : -1;

  return {
    yearByYear,
    totalPremiumPaid,
    totalChargesPaid: Math.round(totalCharges),
    finalFundValue: Math.round(fundValue),
    effectiveAnnualReturn: cagr,
  };
}

export function projectAlternative(
  fees: ULIPFeeSchedule,
  options: ULIPAuditOptions = {},
): AlternativeProjection {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const termPremium = Math.round(
    (fees.sumAssuredInr / 100_000) * opts.termInsurancePremiumPerLakh,
  );
  const annualSIPCapacity = Math.max(0, fees.premiumAnnualInr - termPremium);
  const monthlySIP = Math.round(annualSIPCapacity / 12);

  // FV of a monthly annuity (contribution at end of month) over `months`
  //   FV = M × [(1 + r/12)^(12T) – 1] / (r/12)
  const monthlyRate = opts.sipGrossEquityReturn / 12;
  const months = fees.termYears * 12;
  const fv = monthlySIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const totalContribution = (termPremium + annualSIPCapacity) * fees.termYears;
  const cagr =
    fv > 0 && totalContribution > 0
      ? Math.pow(fv / totalContribution, 1 / fees.termYears) - 1
      : -1;

  return {
    termInsuranceAnnualPremium: termPremium,
    monthlySIP,
    finalFundValue: Math.round(fv),
    effectiveAnnualReturn: cagr,
  };
}

export function auditULIP(
  fees: ULIPFeeSchedule,
  options: ULIPAuditOptions = {},
): ULIPAuditResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const ulip = projectULIP(fees, opts);
  const alternative = projectAlternative(fees, opts);
  return {
    productName: fees.productNameRaw,
    insurerName: fees.insurerNameRaw,
    termYears: fees.termYears,
    ulip,
    alternative,
    lifetimeSavingsInr: Math.max(0, alternative.finalFundValue - ulip.finalFundValue),
    assumptions: {
      ulipGrossEquityReturn: opts.ulipGrossEquityReturn,
      sipGrossEquityReturn: opts.sipGrossEquityReturn,
      termInsurancePremiumPerLakh: opts.termInsurancePremiumPerLakh,
    },
  };
}

/** Compact summary suitable for prompt injection — no decimals, INR formatted. */
export function summarizeAuditForPrompt(audit: ULIPAuditResult): string {
  const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  return [
    `Product: ${audit.productName} (${audit.insurerName})`,
    `Term: ${audit.termYears} years.`,
    `ULIP: total premium ${inr(audit.ulip.totalPremiumPaid)}, total charges ${inr(audit.ulip.totalChargesPaid)}, final fund value ${inr(audit.ulip.finalFundValue)}, effective return ${pct(audit.ulip.effectiveAnnualReturn)}.`,
    `Alternative (Term + SIP): term premium ${inr(audit.alternative.termInsuranceAnnualPremium)}/yr, monthly SIP ${inr(audit.alternative.monthlySIP)}, final fund value ${inr(audit.alternative.finalFundValue)}, effective return ${pct(audit.alternative.effectiveAnnualReturn)}.`,
    `Lifetime savings if user picks the alternative: ${inr(audit.lifetimeSavingsInr)} over ${audit.termYears} years.`,
    `Assumptions: ULIP gross ${pct(audit.assumptions.ulipGrossEquityReturn)}, SIP gross ${pct(audit.assumptions.sipGrossEquityReturn)}.`,
  ].join("\n");
}
