import type { LanguageCode } from "./languages";

/**
 * Every user-facing string lives here, keyed by ID with one entry per
 * language we actively ship. Strings outside this file should be
 * actual content (a goal name typed by the user) — UI chrome belongs here.
 *
 * Day 1 seeds the IDs we'll touch on Day 2. New IDs are added as features
 * land. Missing translations fall back to the primary (hi-IN) string with
 * a console warning in dev so we notice gaps.
 */

export type StringId =
  // Brand & nav
  | "brand.tagline.eyebrow"
  | "brand.tagline.headline"
  | "brand.tagline.subhead"
  | "nav.home"
  | "nav.family"
  | "nav.goals"
  | "nav.defenses"
  | "nav.investments"
  | "nav.timeline"
  | "nav.conversations"
  | "nav.settings"
  // CTAs
  | "cta.startOnWhatsapp"
  | "cta.seeHow"
  | "cta.demo"
  | "cta.healthCheck"
  // Verdicts
  | "verdict.scam"
  | "verdict.suspicious"
  | "verdict.legitLowQuality"
  | "verdict.legitimate"
  | "verdict.unclear"
  // Defense card
  | "defense.savedThisYear"
  | "defense.scamsBlocked"
  // Voice player
  | "voice.play"
  | "voice.pause"
  | "voice.transcript"
  | "voice.speed"
  // Empty / loading
  | "loading.analysing"
  | "loading.thinking"
  | "empty.feed"
  // Day-1 placeholder banner
  | "demo.day1.banner";

type StringEntry = Partial<Record<LanguageCode, string>> & { "hi-IN": string };

export const STRINGS: Record<StringId, StringEntry> = {
  "brand.tagline.eyebrow": {
    "hi-IN": "जब बैंक वाले ULIP बेच रहे हैं,",
    "en-IN": "When the bank is selling you a ULIP,",
  },
  "brand.tagline.headline": {
    "hi-IN": "हम सच बताते हैं।",
    "en-IN": "we tell you the truth.",
  },
  "brand.tagline.subhead": {
    "hi-IN":
      "Bharosa aapka AI advocate hai Bharat ke liye. Family ke liye scam defense free. Paise ke liye honest investment plan. Sab WhatsApp pe.",
    "en-IN":
      "Bharosa is your AI advocate for Bharat. Free scam defense for your family. Honest investment plans for your money. Entirely on WhatsApp.",
  },
  "nav.home": { "hi-IN": "घर", "en-IN": "Home" },
  "nav.family": { "hi-IN": "परिवार", "en-IN": "Family" },
  "nav.goals": { "hi-IN": "लक्ष्य", "en-IN": "Goals" },
  "nav.defenses": { "hi-IN": "सुरक्षा", "en-IN": "Defenses" },
  "nav.investments": { "hi-IN": "निवेश", "en-IN": "Investments" },
  "nav.timeline": { "hi-IN": "टाइमलाइन", "en-IN": "Timeline" },
  "nav.conversations": { "hi-IN": "बातचीत", "en-IN": "Conversations" },
  "nav.settings": { "hi-IN": "सेटिंग्स", "en-IN": "Settings" },

  "cta.startOnWhatsapp": {
    "hi-IN": "WhatsApp पर शुरू करें",
    "en-IN": "Start on WhatsApp",
  },
  "cta.seeHow": {
    "hi-IN": "देखें कैसे काम करता है",
    "en-IN": "See how it works",
  },
  "cta.demo": { "hi-IN": "डेमो", "en-IN": "Demo" },
  "cta.healthCheck": { "hi-IN": "हेल्थ चेक", "en-IN": "Health check" },

  "verdict.scam": { "hi-IN": "स्कैम", "en-IN": "Scam" },
  "verdict.suspicious": { "hi-IN": "शक़ है", "en-IN": "Suspicious" },
  "verdict.legitLowQuality": { "hi-IN": "असली पर कमज़ोर", "en-IN": "Legit but weak" },
  "verdict.legitimate": { "hi-IN": "असली", "en-IN": "Legitimate" },
  "verdict.unclear": { "hi-IN": "साफ़ नहीं", "en-IN": "Unclear" },

  "defense.savedThisYear": {
    "hi-IN": "इस साल हमने आपके बचाए",
    "en-IN": "We've saved you this year",
  },
  "defense.scamsBlocked": {
    "hi-IN": "इस हफ़्ते रोके गए स्कैम",
    "en-IN": "Scams blocked this week",
  },

  "voice.play": { "hi-IN": "चलाएँ", "en-IN": "Play" },
  "voice.pause": { "hi-IN": "रुकें", "en-IN": "Pause" },
  "voice.transcript": { "hi-IN": "ट्रांसक्रिप्ट", "en-IN": "Transcript" },
  "voice.speed": { "hi-IN": "स्पीड", "en-IN": "Speed" },

  "loading.analysing": {
    "hi-IN": "Document analyze ho raha hai…",
    "en-IN": "Analysing your document…",
  },
  "loading.thinking": {
    "hi-IN": "Bharosa soch raha hai…",
    "en-IN": "Bharosa is thinking…",
  },
  "empty.feed": {
    "hi-IN": "अभी कुछ नहीं है। हम तैयार हैं।",
    "en-IN": "Nothing yet. We're standing by.",
  },

  "demo.day1.banner": {
    "hi-IN": "Day 1 — Foundation booted ✓",
    "en-IN": "Day 1 — Foundation booted ✓",
  },
};

export function resolveString(id: StringId, language: LanguageCode): string {
  const entry = STRINGS[id];
  const value = entry?.[language] ?? entry?.["hi-IN"];
  if (!value && process.env.NODE_ENV === "development") {
    console.warn(`[i18n] missing string: ${id} @ ${language}`);
  }
  return value ?? id;
}
