import type { DemoFamilyMember, DemoGoal, DemoPersona } from "@/domain/types";

/**
 * Anjali Sharma — the hero persona for the Bharosa demo. The shape mirrors
 * what Day 5's Account Aggregator stub will produce, so we can swap to
 * live data without touching call-sites.
 *
 * IDs match the seed UUIDs in supabase/migrations/0004_seed.sql.
 */

export const ANJALI: DemoPersona = {
  id: "11111111-1111-1111-1111-111111111111",
  phone: "+919876500001",
  name: "Anjali Sharma",
  language: "hi-IN",
  city: "Lucknow",
  occupation: "Government School Teacher",
  monthlyIncomeInr: 38_000,
  monthlyRemittanceInr: 40_000,
  monthlySurplusInr: 5_500,
  trustLevel: "new",
  existingAssets: {
    fdInr: 4_00_000,
    goldGrams: 80,
    rdInr: 30_000,
    mutualFundsInr: 0,
    insurance: ["LIC term plan (Rajesh)", "Employer health (Anjali)"],
  },
  declaredFears: [
    "Equity is gambling — devar lost ₹2.8L in F&O in 2023.",
    "Mother-in-law gets 4–6 scam WhatsApps a week.",
    "Bank RM keeps pushing a ULIP — refused 3 times via stalling.",
  ],
};

export const FAMILY: DemoFamilyMember[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    phone: "+919876500002",
    relationship: "mother-in-law",
    name: "Sushma Sharma",
    language: "hi-IN",
    ageBand: "60-75",
    visibility: { sees: ["protection_alerts"] },
    notes: "Receives 4-6 scam WhatsApps/week. Almost lost ₹50,000 to a 'bank manager' once before Anjali noticed.",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    phone: "+971500000003",
    relationship: "husband",
    name: "Rajesh Sharma",
    language: "hi-IN",
    ageBand: "30-45",
    visibility: { sees: ["aggregate_goal_progress"] },
    notes: "Works in Dubai. Sends ₹40,000/month remittance. Speaks Hindi but reads Devanagari only somewhat — voice notes preferred.",
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    phone: "+919876500004",
    relationship: "brother",
    name: "Vikas Sharma",
    language: "hi-IN",
    ageBand: "20-30",
    visibility: { sees: ["college_fee_transfers_only"] },
    notes: "College in Lucknow. Anjali sends ₹3,000/month for fees.",
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    phone: null,
    relationship: "daughter",
    name: "Priya",
    language: "hi-IN",
    ageBand: "10-15",
    visibility: { sees: ["self_savings_only"] },
  },
  {
    id: "22222222-2222-2222-2222-222222222205",
    phone: null,
    relationship: "son",
    name: "Aarav",
    language: "hi-IN",
    ageBand: "5-10",
    visibility: { sees: ["self_savings_only"] },
  },
];

export const GOALS: DemoGoal[] = [
  {
    id: "g-wedding-priya",
    name: "Priya ki shaadi",
    category: "wedding",
    targetInr: 8_00_000,
    targetDate: "2032-04-15",
    forFamilyMemberId: "22222222-2222-2222-2222-222222222204",
    priority: 1,
    rationale: "Cultural anchor goal. Long horizon → SSY-heavy + gold + FD ladder.",
  },
  {
    id: "g-coaching-aarav",
    name: "Aarav ki coaching",
    category: "education",
    targetInr: 3_00_000,
    targetDate: "2027-06-01",
    forFamilyMemberId: "22222222-2222-2222-2222-222222222205",
    priority: 2,
    rationale: "Mid-term horizon → short-debt fund + FD blend.",
  },
  {
    id: "g-medical-mil",
    name: "Mummy ka medical buffer",
    category: "medical",
    targetInr: 2_00_000,
    targetDate: "2026-12-31",
    forFamilyMemberId: "22222222-2222-2222-2222-222222222201",
    priority: 1,
    rationale: "Liquidity-first. Liquid fund only — must be available within 24 hours.",
  },
  {
    id: "g-festival-diwali",
    name: "Diwali fund",
    category: "festival",
    targetInr: 30_000,
    targetDate: "2026-10-15",
    priority: 3,
    rationale: "Annual recurring deposit, available 1 month before festival.",
  },
];

export function findPersona(id: string): DemoPersona | undefined {
  return id === ANJALI.id ? ANJALI : undefined;
}

export function findFamilyMember(id: string): DemoFamilyMember | undefined {
  return FAMILY.find((m) => m.id === id);
}
