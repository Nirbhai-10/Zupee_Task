import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Cross-cutting domain types. Use these everywhere; resist re-defining
 * shapes inside features. Extending an enum in one place beats adding a
 * second-source-of-truth.
 */

export type TrustLevel =
  | "new"
  | "first_defense"
  | "multiple_defenses"
  | "invested"
  | "seasoned";

export type DefenseCategory =
  | "scam"
  | "mis_selling"
  | "harassment"
  | "overcharging"
  | "other";

export type DefenseVerdict =
  | "SCAM"
  | "SUSPICIOUS"
  | "LEGITIMATE_BUT_LOW_QUALITY"
  | "LEGITIMATE"
  | "UNCLEAR";

export type GoalCategory =
  | "wedding"
  | "education"
  | "medical"
  | "festival"
  | "house"
  | "vehicle"
  | "pilgrimage"
  | "general";

export type Instrument =
  | "gold"
  | "fd"
  | "rd"
  | "sukanya_samriddhi"
  | "ppf"
  | "short_debt_fund"
  | "liquid_fund"
  | "large_cap_equity"
  | "index_fund"
  | "lic_term";

export type FamilyRelationship =
  | "self"
  | "husband"
  | "wife"
  | "father"
  | "mother"
  | "father-in-law"
  | "mother-in-law"
  | "brother"
  | "sister"
  | "brother-in-law"
  | "sister-in-law"
  | "son"
  | "daughter"
  | "grandfather"
  | "grandmother"
  | "uncle"
  | "aunt";

export type AgeBand =
  | "0-5"
  | "5-10"
  | "10-15"
  | "15-20"
  | "20-30"
  | "30-45"
  | "45-60"
  | "60-75"
  | "75+";

export type FamilyVisibility = {
  sees: Array<
    | "everything"
    | "aggregate_goal_progress"
    | "protection_alerts"
    | "college_fee_transfers_only"
    | "self_savings_only"
  >;
};

export type DemoPersona = {
  id: string;
  phone: string;
  name: string;
  language: LanguageCode;
  city: string;
  occupation: string;
  monthlyIncomeInr: number;
  monthlyRemittanceInr?: number;
  monthlySurplusInr: number;
  trustLevel: TrustLevel;
  existingAssets: {
    fdInr: number;
    goldGrams: number;
    rdInr: number;
    mutualFundsInr: number;
    insurance: string[];
  };
  declaredFears: string[];
};

export type DemoFamilyMember = {
  id: string;
  phone: string | null;
  relationship: FamilyRelationship;
  name: string;
  language: LanguageCode;
  ageBand: AgeBand;
  visibility: FamilyVisibility;
  notes?: string;
};

export type DemoGoal = {
  id: string;
  name: string;
  category: GoalCategory;
  targetInr: number;
  targetDate: string; // ISO yyyy-mm-dd
  forFamilyMemberId?: string;
  priority: number;
  rationale: string;
};

export type ScamPatternSeed = {
  patternName: string;
  category: string;
  language: LanguageCode;
  representativeText: string;
  identifyingPhrases: string[];
  payloadType: string;
  severity: "high" | "medium" | "low";
  notes?: string;
};
