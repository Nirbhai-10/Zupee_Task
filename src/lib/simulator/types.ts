import type { LanguageCode } from "@/lib/i18n/languages";
import type { ScamClassification } from "@/lib/llm/schemas";
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
  | "reset";

export type SimulatorDefense = {
  id: string;
  forPhoneId: PhoneId;
  classification: ScamClassification;
  language: LanguageCode;
  voiceUrl?: string;
  createdAt: string;
};

export type SimulatorState = {
  messages: SimulatorMessage[];
  typing: Partial<Record<PhoneId, boolean>>;
  defenses: SimulatorDefense[];
};
