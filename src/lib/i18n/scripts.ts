import type { LanguageCode } from "./languages";

/** Script families we apply per-script typography metrics to. */
export type ScriptFamily =
  | "latin"
  | "devanagari"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "bengali"
  | "gujarati"
  | "gurmukhi"
  | "oriya";

const LANGUAGE_TO_SCRIPT: Record<LanguageCode, ScriptFamily> = {
  "hi-IN": "devanagari",
  "mr-IN": "devanagari",
  "bn-IN": "bengali",
  "gu-IN": "gujarati",
  "pa-IN": "gurmukhi",
  "ta-IN": "tamil",
  "te-IN": "telugu",
  "kn-IN": "kannada",
  "ml-IN": "malayalam",
  "or-IN": "oriya",
  "en-IN": "latin",
};

export function scriptForLanguage(code: LanguageCode): ScriptFamily {
  return LANGUAGE_TO_SCRIPT[code] ?? "latin";
}

/**
 * Detect script family from text via Unicode ranges. Used by helpers that
 * receive untyped strings (chat messages, voice transcripts).
 */
export function detectScript(text: string): ScriptFamily {
  if (!text) return "latin";
  // Test in order of likelihood.
  if (/[ऀ-ॿ]/.test(text)) return "devanagari";
  if (/[஀-௿]/.test(text)) return "tamil";
  if (/[ఀ-౿]/.test(text)) return "telugu";
  if (/[ಀ-೿]/.test(text)) return "kannada";
  if (/[ഀ-ൿ]/.test(text)) return "malayalam";
  if (/[ঀ-৿]/.test(text)) return "bengali";
  if (/[઀-૿]/.test(text)) return "gujarati";
  if (/[਀-੿]/.test(text)) return "gurmukhi";
  if (/[଀-୿]/.test(text)) return "oriya";
  return "latin";
}
