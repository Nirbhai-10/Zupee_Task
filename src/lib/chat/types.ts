import type { LanguageCode } from "@/lib/i18n/languages";

export type ChatRole = "user" | "assistant";

export type ChatIntent =
  | "scam-check"
  | "ulip-audit"
  | "investment-question"
  | "harassment-help"
  | "general-help"
  | "small-talk";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  /** Hindi or English (or Hinglish — script auto-detected client-side). */
  language?: LanguageCode | "auto";
  /** Optional audio URL — Sarvam returns data:audio/wav, browser TTS uses
   *  the `browser-tts:` marker scheme decoded by VoicePlayer. */
  audioUrl?: string;
  /** When the assistant suggests a follow-up CTA. */
  cta?: { label: string; href: string } | null;
  /** True for messages where Saathi attached a structured analysis. */
  intent?: ChatIntent;
  createdAt: string;
};

export type ChatRespondPayload = {
  messages: ChatMessage[];
  /** Picker-driven preference; the model still auto-detects per turn. */
  preferredLanguage?: LanguageCode;
};

export type ChatRespondResponse = {
  intent: ChatIntent;
  text: string;
  language: LanguageCode;
  cta?: { label: string; href: string } | null;
  audioUrl?: string;
  audioDurationMs?: number;
  source: "llm" | "mock-template";
};
