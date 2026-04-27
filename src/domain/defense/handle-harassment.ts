import { generateText, isRecoverableLLMError } from "@/lib/llm/router";
import {
  HARASSMENT_LETTER_SYSTEM_V1,
  NEGOTIATOR_CALL_SYSTEM_V1,
} from "@/lib/llm/prompts/negotiator.v1";
import type { LanguageCode } from "@/lib/i18n/languages";

export type HarassmentInput = {
  agentName: string;
  agencyName: string;
  bankNbfc: string;
  borrowerName: string;
  borrowerCity: string;
  incidentSummary: string;
  /** "21:45" — the time the agent called outside RBI hours, if known. */
  callTime?: string;
  language: LanguageCode;
  userId?: string;
};

export type HarassmentResult = {
  letter: string;
  callScript: string;
  /** Sachet form fields, ready to submit. */
  sachetDraft: {
    portal: string;
    referenceUrl: string;
    fields: Record<string, string>;
  };
  source: "llm" | "mock-template";
};

export async function handleHarassment(
  input: HarassmentInput,
): Promise<HarassmentResult> {
  const promptShared = [
    `Borrower: ${input.borrowerName} (${input.borrowerCity}).`,
    `Agent: ${input.agentName} from ${input.agencyName}.`,
    `Originating: ${input.bankNbfc}.`,
    `Preferred language: ${input.language}.`,
    input.callTime ? `Most recent violating call: ${input.callTime}.` : "",
    "",
    `Incident: ${input.incidentSummary}`,
  ]
    .filter(Boolean)
    .join("\n");

  const sachetDraft = buildSachetDraft(input);

  try {
    const [letter, callScript] = await Promise.all([
      generateText({
        feature: "harassment-letter",
        tier: "sonnet",
        system: HARASSMENT_LETTER_SYSTEM_V1,
        prompt: promptShared,
        temperature: 0.3,
        maxOutputTokens: 1800,
        userId: input.userId,
      }),
      generateText({
        feature: "negotiator-call",
        tier: "sonnet",
        system: NEGOTIATOR_CALL_SYSTEM_V1,
        prompt: promptShared,
        temperature: 0.4,
        maxOutputTokens: 1500,
        userId: input.userId,
      }),
    ]);
    return {
      letter: letter.text.trim(),
      callScript: callScript.text.trim(),
      sachetDraft,
      source: "llm",
    };
  } catch (error) {
    if (isRecoverableLLMError(error)) {
      return mockHarassment(input, sachetDraft);
    }
    throw error;
  }
}

function buildSachetDraft(input: HarassmentInput) {
  return {
    portal: "RBI Sachet",
    referenceUrl: "https://sachet.rbi.org.in",
    fields: {
      "Complainant Name": input.borrowerName,
      "City / State": `${input.borrowerCity}, India`,
      "Entity Type": "Bank / NBFC",
      "Entity Name": input.bankNbfc,
      "Recovery Agency": input.agencyName,
      "Recovery Agent": input.agentName,
      "Nature of Complaint": "Harassment by recovery agent",
      "Brief Description": input.incidentSummary,
      "Time of Violating Call": input.callTime ?? "—",
      "Cited RBI Provision": "Master Circular on Fair Practices Code (recovery agents may not call before 8 AM or after 7 PM, must not use threatening language).",
      "Action Taken by Complainant": "Cease-and-desist letter sent. Awaiting response.",
    },
  };
}

function mockHarassment(input: HarassmentInput, sachetDraft: HarassmentResult["sachetDraft"]): HarassmentResult {
  if (input.language === "en-IN") {
    const letter = `To,
${input.agentName}
${input.agencyName}
Re: Recovery activity for ${input.bankNbfc} — Account in the name of ${input.borrowerName}

Dear Sir/Madam,

This letter is written on behalf of ${input.borrowerName} (resident of ${input.borrowerCity}). On ${input.callTime ?? "[recent date]"}, your agency contacted a relative of the borrower in violation of RBI's Fair Practices Code. The incident is summarised as: ${input.incidentSummary}

This conduct violates RBI rules on multiple counts: recovery agents may not contact relatives when the borrower is reachable, may not call before 8 AM or after 7 PM, and may not use threatening or intimidating language.

You are required to stop this contact immediately and communicate only through the borrower's registered channel. Any further phone call, home visit, or contact with relatives will be treated as continued harassment.

A formal complaint is being prepared for the RBI Sachet portal and the Banking Ombudsman unless your agency confirms cessation in writing within 24 hours.

Yours sincerely,
${input.borrowerName}
${input.borrowerCity}, India

CC: RBI Sachet · Banking Ombudsman · ${input.bankNbfc} Grievance Cell`;

    const callScript = `This call is on the authorised behalf of ${input.borrowerName}. This is Bharosa speaking. ${input.borrowerName}'s loan is with ${input.bankNbfc}; repayment intent is confirmed.

However, under RBI recovery-agent rules, calls cannot be made before 8 AM or after 7 PM, and relatives cannot be contacted when the borrower is reachable. Your call at ${input.callTime ?? "the reported time"} is a violation.

From now on, communicate only through the borrower's registered channel. Stop phone calls and contact with relatives immediately. If written confirmation is not received within 24 hours, a complaint will be filed through RBI Sachet and the Banking Ombudsman.

Thank you. This call is being recorded.`;

    return { letter, callScript, sachetDraft, source: "mock-template" };
  }

  const letter = `To,
${input.agentName}
${input.agencyName}
Re: Recovery activity for ${input.bankNbfc} — Account in the name of ${input.borrowerName}

Dear Sir/Madam,

This letter is written on behalf of ${input.borrowerName} (resident of ${input.borrowerCity}). On ${input.callTime ?? "[recent date]"}, your agency placed a call to a relative of the borrower in violation of RBI's Master Circular on Fair Practices Code (RBI/DBR/2014-15/107). The contents of that contact are summarised as: ${input.incidentSummary}

This conduct violates the Master Circular on multiple counts: (a) calls to relatives are permitted only when the borrower is provably unreachable, which is not the case here; (b) recovery agents may not place calls before 8 AM or after 7 PM; (c) threatening, intimidating, or abusive language is expressly prohibited.

We hereby require you to *iss tareeke se sampark band karein* and communicate, if at all, only through registered post addressed to the borrower at the address on record. Any further contact by phone, in person, or with a relative of the borrower will be treated as continued harassment.

A formal complaint is being filed with the RBI Sachet portal (https://sachet.rbi.org.in) and the Banking Ombudsman within 7 working days unless your agency confirms cessation in writing. Continued non-compliance will be escalated to the consumer court at our cost.

Yours sincerely,
${input.borrowerName}
${input.borrowerCity}, India

CC: RBI Sachet · Banking Ombudsman · ${input.bankNbfc} Grievance Cell`;

  const callScript = `Yeh call ${input.borrowerName} ki authorised behalf par hai. Bharosa Bharosa bol raha hoon. ${input.borrowerName} ji ka loan ${input.bankNbfc} ke saath hai, repayment intent confirmed hai — koi dispute nahi.

Lekin RBI Master Circular ke according, recovery agent subah 8 baje se pehle ya raat 7 baje ke baad call nahi kar sakta. Aap ne ${input.callTime ?? "raat ke samay"} call kiya — yeh violation hai.

Aage se sirf ${input.borrowerName} ji ke registered email par hi communicate karein. Phone call ya rishtedaaron ko contact karna band kijiye. Agar agle 24 ghante mein confirmation written nahi mila, toh hum Sachet portal aur Banking Ombudsman ke saath complaint file kar denge.

Dhanyawad. Yeh call record ho rahi hai.`;

  return { letter, callScript, sachetDraft, source: "mock-template" };
}
