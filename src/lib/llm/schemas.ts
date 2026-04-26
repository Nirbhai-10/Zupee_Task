import { z } from "zod";

/**
 * Every LLM output that we trust is validated against one of these
 * schemas. Day 2 wires the scam classifier + intent detector. Later days
 * extend this file with document-audit, plan, family-notify schemas.
 */

export const ScamVerdict = z.enum([
  "SCAM",
  "SUSPICIOUS",
  "LEGITIMATE_BUT_LOW_QUALITY",
  "LEGITIMATE",
  "UNCLEAR",
]);
export type ScamVerdict = z.infer<typeof ScamVerdict>;

export const ScamCategory = z.enum([
  "lottery",
  "banking-impersonation",
  "kyc-update",
  "digital-arrest",
  "investment-scheme",
  "job-fraud",
  "tech-support-fraud",
  "romance-scam",
  "utility-scam",
  "courier-scam",
  "fake-refund",
  "phishing-link",
  "ulip-misselling",
  "tax-refund",
  "other",
]);
export type ScamCategory = z.infer<typeof ScamCategory>;

export const ScamPayloadType = z.enum([
  "money-transfer",
  "credential-harvest",
  "identity-theft",
  "premium-product",
  "malware-link",
  "social-engineering",
  "blackmail",
  "unknown",
]);
export type ScamPayloadType = z.infer<typeof ScamPayloadType>;

export const ScamClassification = z.object({
  verdict: ScamVerdict,
  category: ScamCategory,
  confidence: z.number().min(0).max(1),
  identifyingSignals: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe("Concrete phrases or patterns that triggered this verdict."),
  payloadType: ScamPayloadType,
  estimatedLossInr: z
    .number()
    .min(0)
    .describe("Best-case estimate of money the user could lose if they acted."),
  receiverExplanation: z
    .string()
    .describe(
      "Vernacular explanation written for the receiver (e.g. mother-in-law). 30-60 seconds when spoken aloud. Use respectful register.",
    ),
  primaryUserAlert: z
    .string()
    .describe(
      "Short alert for the primary user (Anjali) summarizing what was caught. 1-2 sentences.",
    ),
});
export type ScamClassification = z.infer<typeof ScamClassification>;

export const IntentLabel = z.enum([
  "scam-check",
  "document-audit",
  "harassment-help",
  "investment-plan",
  "goal-update",
  "family-add",
  "family-notify",
  "small-talk",
  "complaint",
  "unknown",
]);
export type IntentLabel = z.infer<typeof IntentLabel>;

export const IntentDetection = z.object({
  intent: IntentLabel,
  confidence: z.number().min(0).max(1),
  needsClarification: z.boolean(),
  clarifyingQuestion: z.string().optional(),
});
export type IntentDetection = z.infer<typeof IntentDetection>;

export const ULIPFeeSchedule = z.object({
  premiumAllocationByYear: z
    .array(z.object({ year: z.number().int().min(1), pctOfPremium: z.number() }))
    .min(1),
  policyAdminMonthlyInr: z.number().min(0),
  fundManagementPctAnnual: z.number(),
  mortalityChargePctAnnual: z.number(),
  surrenderScheduleByYear: z.array(
    z.object({ year: z.number().int().min(1), pctRecoverable: z.number() }),
  ),
  lockInYears: z.number().int().min(0),
  premiumAnnualInr: z.number().positive(),
  termYears: z.number().int().min(1),
  sumAssuredInr: z.number().positive(),
  productNameRaw: z.string(),
  insurerNameRaw: z.string(),
});
export type ULIPFeeSchedule = z.infer<typeof ULIPFeeSchedule>;
