import type {
  SynthesizeArgs,
  SynthesizeResult,
  TranscribeArgs,
  TranscribeResult,
  VoiceProvider,
} from "./provider-interface";
import type { LanguageCode } from "@/lib/i18n/languages";
import { isLanguageCode } from "@/lib/i18n/languages";

/**
 * Sarvam voice provider. Calls the public REST API:
 *   POST https://api.sarvam.ai/text-to-speech
 *   POST https://api.sarvam.ai/speech-to-text
 *
 * Defaults track Sarvam's current production recommendations:
 * - TTS: bulbul:v3
 * - STT: saaras:v3
 * Both can be overridden through env for regression testing.
 */

const SARVAM_API_BASE = "https://api.sarvam.ai";

const DEFAULT_TTS_MODEL = "bulbul:v3";
const DEFAULT_STT_MODEL = "saaras:v3";

/**
 * Per-language native speakers (bulbul:v3).
 *
 * Critical: a Devanagari/Tamil/Telugu reply MUST be spoken by a speaker
 * whose primary language matches, otherwise pronunciation collapses
 * (the previous default of `shreya`/`rahul` everywhere produced bad
 * Hinglish for Tamil/Telugu/Bengali/etc.). Sourced from Sarvam's
 * `change-the-speaker-voice` guide + bulbul-v3 release blog. Speakers
 * are case-sensitive lowercase.
 */
const V3_SPEAKERS_BY_LANG: Record<
  string,
  { female: string; male: string; warm: string; elder: string }
> = {
  "hi-IN": { female: "priya",  male: "shubh",     warm: "suhani",  elder: "ashutosh" },
  "en-IN": { female: "ishita", male: "ratan",     warm: "shreya",  elder: "rahul"    },
  "mr-IN": { female: "priya",  male: "ratan",     warm: "ritu",    elder: "shubh"    },
  "bn-IN": { female: "roopa",  male: "rehan",     warm: "suhani",  elder: "shubh"    },
  "gu-IN": { female: "priya",  male: "ratan",     warm: "ritu",    elder: "shubh"    },
  "ta-IN": { female: "ishita", male: "ratan",     warm: "ritu",    elder: "rohan"    },
  "te-IN": { female: "neha",   male: "shubh",     warm: "priya",   elder: "ratan"    },
  "kn-IN": { female: "neha",   male: "shubh",     warm: "ishita",  elder: "ratan"    },
  "ml-IN": { female: "pooja",  male: "shubh",     warm: "ishita",  elder: "ratan"    },
  "pa-IN": { female: "roopa",  male: "mani",      warm: "suhani",  elder: "shubh"    },
  "od-IN": { female: "ritu",   male: "shubh",     warm: "pooja",   elder: "ratan"    },
};

/**
 * Per-language v2 fallback speakers. v2 ships only 7 voices (anushka,
 * manisha, vidya, arya, abhilash, karun, hitesh) and they cover a
 * narrower language set well; we map every language to the safest
 * available timbre so the pipeline degrades cleanly when v3 is
 * unavailable.
 */
const V2_SPEAKERS_BY_LANG: Record<
  string,
  { female: string; male: string; warm: string; elder: string }
> = {
  "hi-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "en-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "mr-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "bn-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "gu-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "ta-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "te-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "kn-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "ml-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "pa-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
  "od-IN": { female: "anushka", male: "abhilash", warm: "manisha", elder: "vidya" },
};

const TIMBRE_KEY: Record<
  "saathi-female" | "saathi-male" | "saathi-warm" | "saathi-elder",
  "female" | "male" | "warm" | "elder"
> = {
  "saathi-female": "female",
  "saathi-male": "male",
  "saathi-warm": "warm",
  "saathi-elder": "elder",
};

const LANG_TO_SARVAM_CODE: Partial<Record<LanguageCode, string>> = {
  "hi-IN": "hi-IN",
  "en-IN": "en-IN",
  "mr-IN": "mr-IN",
  "bn-IN": "bn-IN",
  "gu-IN": "gu-IN",
  "ta-IN": "ta-IN",
  "te-IN": "te-IN",
  "kn-IN": "kn-IN",
  "ml-IN": "ml-IN",
  "pa-IN": "pa-IN",
  "or-IN": "od-IN", // Sarvam uses od for Odia
};

export class SarvamVoiceProvider implements VoiceProvider {
  readonly name = "sarvam" as const;
  private readonly apiKey: string | undefined;
  private readonly ttsModel: "bulbul:v2" | "bulbul:v3";
  private readonly sttModel: "saarika:v2.5" | "saaras:v3";

  constructor(apiKey: string | undefined = process.env.SARVAM_API_KEY) {
    this.apiKey = apiKey;
    this.ttsModel = normalizeTTSModel(process.env.SARVAM_TTS_MODEL);
    this.sttModel = normalizeSTTModel(process.env.SARVAM_STT_MODEL);
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async synthesize(args: SynthesizeArgs): Promise<SynthesizeResult> {
    if (!this.apiKey) {
      throw new Error("Sarvam not configured (SARVAM_API_KEY missing).");
    }
    const sarvamLang = LANG_TO_SARVAM_CODE[args.language];
    if (!sarvamLang) {
      throw new Error(`Sarvam: unsupported language ${args.language}`);
    }
    const timbre = args.timbre ?? "saathi-female";
    const timbreKey = TIMBRE_KEY[timbre];
    // Pick a speaker that natively speaks the requested language. Falls
    // back to the Hindi speaker set if Sarvam ever adds a code we don't
    // yet have in our matrix.
    const matrix =
      this.ttsModel === "bulbul:v3" ? V3_SPEAKERS_BY_LANG : V2_SPEAKERS_BY_LANG;
    const speakers = matrix[sarvamLang] ?? matrix["hi-IN"];
    const speaker = speakers[timbreKey];
    const body =
      this.ttsModel === "bulbul:v3"
        ? {
            text: normalizeSpeechText(args.text),
            target_language_code: sarvamLang,
            speaker,
            pace: clampSpeed(args.speed, "bulbul:v3"),
            speech_sample_rate: 24000,
            model: this.ttsModel,
            temperature: 0.45,
          }
        : {
            text: normalizeSpeechText(args.text),
            target_language_code: sarvamLang,
            speaker,
            pitch: 0,
            pace: clampSpeed(args.speed, "bulbul:v2"),
            loudness: 1.0,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: this.ttsModel,
          };

    const response = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Sarvam TTS failed (${response.status}): ${detail}`);
    }

    const json = (await response.json()) as { audios?: string[] };
    const base64 = json.audios?.[0];
    if (!base64) throw new Error("Sarvam TTS: empty response.");

    const audioUrl = await persistOrInline(base64, args);
    const durationMs = Math.round((args.text.length / 14) * 1000); // rough estimate
    const costPaise = Math.ceil(args.text.length * 0.06); // Best-effort estimate for cost telemetry.

    return { audioUrl, durationMs, provider: "sarvam", costPaise };
  }

  async transcribe(args: TranscribeArgs): Promise<TranscribeResult> {
    if (!this.apiKey) {
      throw new Error("Sarvam not configured (SARVAM_API_KEY missing).");
    }
    const targetLang =
      args.language === "auto" ? "unknown" : LANG_TO_SARVAM_CODE[args.language] ?? "unknown";

    const audioRes = await fetch(args.audioUrl);
    if (!audioRes.ok) throw new Error(`Could not fetch audio: ${audioRes.status}`);
    const audioBlob = await audioRes.blob();

    const form = new FormData();
    form.append("file", audioBlob, "input.wav");
    form.append("model", this.sttModel);
    form.append("language_code", targetLang);
    if (this.sttModel === "saaras:v3") {
      form.append("mode", "transcribe");
    }

    const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
      method: "POST",
      headers: { "api-subscription-key": this.apiKey },
      body: form,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Sarvam STT failed (${response.status}): ${detail}`);
    }
    const json = (await response.json()) as {
      transcript?: string;
      language_code?: string;
    };

    return {
      text: json.transcript ?? "",
      detectedLanguage:
        json.language_code && isLanguageCode(json.language_code)
          ? json.language_code
          : null,
      durationMs: 0,
      provider: "sarvam",
    };
  }
}

function normalizeTTSModel(model: string | undefined): "bulbul:v2" | "bulbul:v3" {
  return model === "bulbul:v2" ? "bulbul:v2" : DEFAULT_TTS_MODEL;
}

function normalizeSTTModel(model: string | undefined): "saarika:v2.5" | "saaras:v3" {
  return model === "saarika:v2.5" ? "saarika:v2.5" : DEFAULT_STT_MODEL;
}

function clampSpeed(speed: number | undefined, model: "bulbul:v2" | "bulbul:v3"): number {
  const value = speed ?? 1.0;
  return model === "bulbul:v3"
    ? Math.min(2.0, Math.max(0.5, value))
    : Math.min(3.0, Math.max(0.3, value));
}

function normalizeSpeechText(text: string): string {
  return text.replace(/\b(\d{5,})\b/g, (match) => Number(match).toLocaleString("en-IN"));
}

async function persistOrInline(
  base64: string,
  _args: SynthesizeArgs,
): Promise<string> {
  return `data:audio/wav;base64,${base64}`;
}
