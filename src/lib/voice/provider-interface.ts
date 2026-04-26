import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Voice provider abstraction. Swappable per-flow (Sarvam in production
 * for production-quality Hindi + 10 regional languages, browser Web Speech
 * as a fallback that lets us demo without an API key).
 */

export type VoiceTimbre = "saathi-female" | "saathi-male" | "saathi-warm" | "saathi-elder";

export type SynthesizeArgs = {
  text: string;
  language: LanguageCode;
  /** Maps to a Sarvam speaker / browser voice family. */
  timbre?: VoiceTimbre;
  /** 0.75 / 1.0 / 1.25 — clamped server-side. */
  speed?: number;
  /** When passed, the synthesised file is uploaded to the given Supabase
   *  Storage bucket+path. Otherwise we return a transient blob URL. */
  storage?: {
    bucket: string;
    path: string;
  };
};

export type SynthesizeResult = {
  /** Either an https URL (Sarvam → Supabase Storage signed URL) or a
   *  marker the client knows how to render: `browser-tts:{base64-utterance}`. */
  audioUrl: string;
  durationMs: number;
  provider: "sarvam" | "browser" | "mock";
  /** Best-effort cost in paise (Sarvam charges per character). 0 for browser. */
  costPaise: number;
};

export type TranscribeArgs = {
  /** Public URL or signed URL the provider can fetch. */
  audioUrl: string;
  language: LanguageCode | "auto";
};

export type TranscribeResult = {
  text: string;
  detectedLanguage: LanguageCode | null;
  durationMs: number;
  provider: "sarvam" | "browser" | "mock";
};

export interface VoiceProvider {
  readonly name: "sarvam" | "browser" | "mock";
  isAvailable(): boolean;
  synthesize(args: SynthesizeArgs): Promise<SynthesizeResult>;
  transcribe(args: TranscribeArgs): Promise<TranscribeResult>;
}
