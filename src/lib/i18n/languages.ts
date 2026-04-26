/**
 * Saathi language registry. The first 4 ship with the prototype; the
 * remaining 7 stubs let us drop in translations without code changes.
 */

export const SUPPORTED_LANGUAGES = [
  "hi-IN",
  "en-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
  "ta-IN",
  "te-IN",
  "kn-IN",
  "ml-IN",
  "pa-IN",
  "or-IN",
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const PRIMARY_LANGUAGE: LanguageCode = "hi-IN";

export type LanguageMeta = {
  code: LanguageCode;
  /** How this language refers to itself, in its own script. */
  endonym: string;
  /** English name. */
  name: string;
  /** ISO 639-1 short code without region. */
  iso: string;
  /** True when shown in the prototype's language switcher. */
  active: boolean;
  /** Devanagari / Indic script that needs the Mukta-based font stack. */
  indic: boolean;
};

export const LANGUAGE_META: Record<LanguageCode, LanguageMeta> = {
  "hi-IN": { code: "hi-IN", endonym: "हिन्दी", name: "Hindi", iso: "hi", active: true, indic: true },
  "en-IN": { code: "en-IN", endonym: "English", name: "English (India)", iso: "en", active: true, indic: false },
  "mr-IN": { code: "mr-IN", endonym: "मराठी", name: "Marathi", iso: "mr", active: true, indic: true },
  "bn-IN": { code: "bn-IN", endonym: "বাংলা", name: "Bangla", iso: "bn", active: true, indic: true },
  "gu-IN": { code: "gu-IN", endonym: "ગુજરાતી", name: "Gujarati", iso: "gu", active: false, indic: true },
  "ta-IN": { code: "ta-IN", endonym: "தமிழ்", name: "Tamil", iso: "ta", active: false, indic: true },
  "te-IN": { code: "te-IN", endonym: "తెలుగు", name: "Telugu", iso: "te", active: false, indic: true },
  "kn-IN": { code: "kn-IN", endonym: "ಕನ್ನಡ", name: "Kannada", iso: "kn", active: false, indic: true },
  "ml-IN": { code: "ml-IN", endonym: "മലയാളം", name: "Malayalam", iso: "ml", active: false, indic: true },
  "pa-IN": { code: "pa-IN", endonym: "ਪੰਜਾਬੀ", name: "Punjabi", iso: "pa", active: false, indic: true },
  "or-IN": { code: "or-IN", endonym: "ଓଡ଼ିଆ", name: "Odia", iso: "or", active: false, indic: true },
};

export function isLanguageCode(value: string): value is LanguageCode {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function isIndicScript(language: LanguageCode): boolean {
  return LANGUAGE_META[language].indic;
}

/** ISO short code (`hi-IN` → `hi`) for the `lang` HTML attribute. */
export function htmlLang(language: LanguageCode): string {
  return LANGUAGE_META[language].iso;
}
