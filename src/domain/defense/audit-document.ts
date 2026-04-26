import { generateText, MissingLLMCredentialsError } from "@/lib/llm/router";
import { DOCUMENT_AUDIT_SYSTEM_V1 } from "@/lib/llm/prompts/document-audit.v1";
import type { ULIPFeeSchedule } from "@/lib/llm/schemas";
import { auditULIP, summarizeAuditForPrompt, type ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { LanguageCode } from "@/lib/i18n/languages";

export type AuditDocumentArgs = {
  fees: ULIPFeeSchedule;
  receiver: { name: string; language: LanguageCode };
  userId?: string;
};

export type AuditDocumentResult = {
  audit: ULIPAuditResult;
  voiceScript: string;
  source: "llm" | "mock-template";
};

export async function auditDocument(args: AuditDocumentArgs): Promise<AuditDocumentResult> {
  const audit = auditULIP(args.fees);
  const promptBody = [
    `User: ${args.receiver.name} (language ${args.receiver.language}).`,
    "",
    "Deterministic audit summary:",
    summarizeAuditForPrompt(audit),
    "",
    "Year-by-year ULIP cash flow (first 5 years):",
    audit.ulip.yearByYear
      .slice(0, 5)
      .map(
        (y) =>
          `Year ${y.year}: premium ₹${y.premium.toLocaleString("en-IN")}, allocation charge ₹${y.allocationCharge.toLocaleString(
            "en-IN",
          )}, admin ₹${y.adminCharge.toLocaleString("en-IN")}, FMC ₹${y.fmcCharge.toLocaleString(
            "en-IN",
          )}, mortality ₹${y.mortalityCharge.toLocaleString("en-IN")}, fund value end ₹${y.fundValueEnd.toLocaleString("en-IN")}`,
      )
      .join("\n"),
    "",
    "Write the 60–90 second voice script now.",
  ].join("\n");

  try {
    const result = await generateText({
      feature: "document-audit",
      tier: "sonnet",
      system: DOCUMENT_AUDIT_SYSTEM_V1,
      prompt: promptBody,
      temperature: 0.4,
      maxOutputTokens: 600,
      userId: args.userId,
    });
    return { audit, voiceScript: result.text.trim(), source: "llm" };
  } catch (error) {
    if (error instanceof MissingLLMCredentialsError) {
      return { audit, voiceScript: mockAuditScript(audit), source: "mock-template" };
    }
    throw error;
  }
}

/**
 * Template-based fallback for when no LLM key is configured. Plays the
 * audit numbers into a hand-tuned Hindi script. Less expressive than the
 * LLM but still factually right.
 */
function mockAuditScript(audit: ULIPAuditResult): string {
  const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  return [
    `Anjali ji, yeh ${audit.productName} policy hai.`,
    `Aap ${audit.termYears} saal tak har saal ${inr(audit.ulip.totalPremiumPaid / audit.termYears)} dengi.`,
    `Total premium ${inr(audit.ulip.totalPremiumPaid)}.`,
    `Iss mein se ${inr(audit.ulip.totalChargesPaid)} sirf charges mein chala jayega — premium allocation, admin, fund management, aur mortality.`,
    `${audit.termYears} saal baad fund value hogi ${inr(audit.ulip.finalFundValue)}, effective return sirf ${pct(audit.ulip.effectiveAnnualReturn)}.`,
    `Doosra raasta: term insurance ${inr(audit.alternative.termInsuranceAnnualPremium)} saalana, aur ${inr(audit.alternative.monthlySIP)} ka monthly SIP direct equity mutual fund mein.`,
    `Same paisa, par ${audit.termYears} saal mein fund value ${inr(audit.alternative.finalFundValue)}, effective return ${pct(audit.alternative.effectiveAnnualReturn)}.`,
    `Difference ${inr(audit.lifetimeSavingsInr)} ka hai — ULIP nahi lene se itna zyada banega.`,
    `Decision aapka. Hum ULIP nahi lene ka suggest karte hain. Term insurance plus direct SIP zyada honest hai.`,
  ].join(" ");
}
