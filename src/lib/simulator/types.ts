import type { LanguageCode } from "@/lib/i18n/languages";
import type { ScamClassification } from "@/lib/llm/schemas";
import type { ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { MessageBubbleVariant } from "@/components/whatsapp-simulator/MessageBubble";

export type PhoneId = "anjali" | "mil" | "husband" | "brother";

export type SimulatorMessage = {
  id: string;
  phoneId: PhoneId;
  /** Whose perspective: a message inbound to this phone, or one this phone sent. */
  direction: "inbound" | "outbound";
  variant: MessageBubbleVariant;
  /** "9:42" — pre-formatted timestamp for the demo. */
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  highlight?: "scam" | "savings" | "none";
};

export type SimulatorTriggerKind =
  | "kbc-scam-to-mil"
  | "ulip-doc-to-anjali"
  | "intake-conversation"
  | "salary-day"
  | "vault-evening"
  | "reset";

export type SimulatorDefense = {
  id: string;
  forPhoneId: PhoneId;
  classification: ScamClassification;
  language: LanguageCode;
  voiceUrl?: string;
  matchedPatternName?: string;
  createdAt: string;
};

export type SimulatorAudit = {
  id: string;
  forPhoneId: PhoneId;
  audit: ULIPAuditResult;
  voiceScript: string;
  voiceUrl?: string;
  language: LanguageCode;
  createdAt: string;
};

export type SimulatorPlan = {
  id: string;
  forPhoneId: PhoneId;
  plan: import("@/domain/investment/allocator").Plan;
  voiceScript: string;
  voiceUrl?: string;
  language: LanguageCode;
  createdAt: string;
};

export type SimulatorHarassment = {
  id: string;
  agentName: string;
  agencyName: string;
  letter: string;
  callScript: string;
  voiceUrl?: string;
  sachetDraft: {
    portal: string;
    referenceUrl: string;
    fields: Record<string, string>;
  };
  language: LanguageCode;
  createdAt: string;
};

export type SimulatorVaultConfession = {
  id: string;
  questionText: string;
  responseTranscript: string;
  reflectionText: string;
  reflectionVoiceUrl?: string;
  emotionTags: string[];
  createdAt: string;
};

export type SimulatorState = {
  messages: SimulatorMessage[];
  typing: Partial<Record<PhoneId, boolean>>;
  defenses: SimulatorDefense[];
  audits: SimulatorAudit[];
  plans: SimulatorPlan[];
  harassments: SimulatorHarassment[];
  vaultConfessions: SimulatorVaultConfession[];
};
