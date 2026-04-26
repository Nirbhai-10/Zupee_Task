import type { Instrument } from "@/domain/types";

/**
 * Catalogue of instruments Bharosa will allocate to. Real product partners
 * are pinned per instrument so the dashboard can render "Bharat AMC" /
 * "SBI" labels without mid-flight LLM calls.
 *
 * Returns shown are *long-run conservative* assumptions used by the
 * allocator — not promised yields. The audit math always reports them
 * with the assumption visible.
 */

export type InvestmentProduct = {
  instrument: Instrument;
  partnerName: string;
  /** Long-run net return assumption (after expense ratio / fees). */
  expectedAnnualReturn: number;
  /** Sub-1 = liquid, 1 = locked-in, 0 < x < 1 = partial liquidity. */
  liquidity: number;
  lockInYears: number;
  taxNote: string;
  /** Used to position the rung on the trust ladder UI. */
  trustRung: "foundation" | "trusted" | "graduated";
  vernacularPitch: string;
};

export const INVESTMENT_PRODUCTS: InvestmentProduct[] = [
  {
    instrument: "gold",
    partnerName: "Sovereign Gold Bond / DigiGold",
    expectedAnnualReturn: 0.08,
    liquidity: 0.7,
    lockInYears: 0,
    taxNote: "SGB tax-free if held to maturity (8 yr).",
    trustRung: "foundation",
    vernacularPitch: "Gold ka mahatva har Indian ghar samjhta hai. Shaadi ke liye perfect.",
  },
  {
    instrument: "fd",
    partnerName: "SBI / HDFC FD",
    expectedAnnualReturn: 0.072,
    liquidity: 0.85,
    lockInYears: 0,
    taxNote: "Interest taxable at slab.",
    trustRung: "foundation",
    vernacularPitch: "FD jo aapko already pasand hai. Hum ladder banayenge taaki har saal kuch mile.",
  },
  {
    instrument: "rd",
    partnerName: "SBI Recurring Deposit",
    expectedAnnualReturn: 0.068,
    liquidity: 0.9,
    lockInYears: 0,
    taxNote: "Interest taxable at slab.",
    trustRung: "foundation",
    vernacularPitch: "Har mahine thoda thoda — Diwali ya school fees ke liye perfect.",
  },
  {
    instrument: "sukanya_samriddhi",
    partnerName: "SBI Sukanya Samriddhi",
    expectedAnnualReturn: 0.082,
    liquidity: 0.0,
    lockInYears: 21,
    taxNote: "EEE — fully tax-free under 80C.",
    trustRung: "trusted",
    vernacularPitch: "Beti ke liye government ne specifically banaya. Tax-free, locked, safe.",
  },
  {
    instrument: "ppf",
    partnerName: "PPF (Post Office)",
    expectedAnnualReturn: 0.072,
    liquidity: 0.0,
    lockInYears: 15,
    taxNote: "EEE — fully tax-free under 80C.",
    trustRung: "trusted",
    vernacularPitch: "Lambi avadhi ke liye sabse safe, tax-free option.",
  },
  {
    instrument: "liquid_fund",
    partnerName: "ICICI Pru Liquid Fund (Direct)",
    expectedAnnualReturn: 0.065,
    liquidity: 1.0,
    lockInYears: 0,
    taxNote: "Capital gains taxable at slab.",
    trustRung: "trusted",
    vernacularPitch: "Emergency ke liye — 24 ghante mein paisa wapas mil jaata hai.",
  },
  {
    instrument: "short_debt_fund",
    partnerName: "Bharat Bond / HDFC Short Term Debt (Direct)",
    expectedAnnualReturn: 0.075,
    liquidity: 0.95,
    lockInYears: 0,
    taxNote: "Capital gains taxable at slab; held >3yr indexation possible.",
    trustRung: "trusted",
    vernacularPitch: "FD se thoda zyada — kam risk wala mutual fund.",
  },
  {
    instrument: "index_fund",
    partnerName: "Nifty 50 Index Fund (Direct)",
    expectedAnnualReturn: 0.115,
    liquidity: 0.95,
    lockInYears: 0,
    taxNote: "LTCG 12.5% above ₹1.25L (FY26) after 12 months.",
    trustRung: "graduated",
    vernacularPitch: "Slow start. Sirf jab aap comfortable ho — ulta mat dauriye.",
  },
  {
    instrument: "large_cap_equity",
    partnerName: "ICICI Pru Bluechip Direct",
    expectedAnnualReturn: 0.12,
    liquidity: 0.95,
    lockInYears: 0,
    taxNote: "LTCG 12.5% above ₹1.25L (FY26) after 12 months.",
    trustRung: "graduated",
    vernacularPitch: "Equity ka entry door — sirf bade companies, kam risk.",
  },
  {
    instrument: "lic_term",
    partnerName: "LIC Tech Term",
    expectedAnnualReturn: 0,
    liquidity: 0,
    lockInYears: 0,
    taxNote: "Pure protection — no investment component.",
    trustRung: "foundation",
    vernacularPitch: "Sirf life cover. ULIP nahi — pure term insurance hai.",
  },
];

export function findProduct(instrument: Instrument): InvestmentProduct | undefined {
  return INVESTMENT_PRODUCTS.find((p) => p.instrument === instrument);
}
