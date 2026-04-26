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
 * Speaker mapping is intentionally narrow — we use "anushka" (warm
 * female) for Bharosa's default voice, and "abhilash" (male) for husband
 * notifications. Adjust per Sarvam's current speaker catalogue.
 *
 * NOTE: For Day 1 we only stub the integration. The class shape is
 * frozen so flows added Day 2+ can call it without changing call-sites.
 */

const SARVAM_API_BASE = "https://api.sarvam.ai";

const SPEAKER_BY_TIMBRE = {
  "saathi-female": "anushka",
  "saathi-male": "abhilash",
  "saathi-warm": "manisha",
  "saathi-elder": "vidya",
} as const;

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

  constructor(apiKey: string | undefined = process.env.SARVAM_API_KEY) {
    this.apiKey = apiKey;
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
    const speaker = SPEAKER_BY_TIMBRE[args.timbre ?? "saathi-female"];

    const response = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Subscription-Key": this.apiKey,
      },
      body: JSON.stringify({
        text: args.text,
        target_language_code: sarvamLang,
        speaker,
        pitch: 0,
        pace: clampSpeed(args.speed),
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2",
      }),
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
    const costPaise = Math.ceil(args.text.length * 0.06); // Sarvam ~₹0.06/char approx

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
    form.append("model", "saarika:v2");
    form.append("language_code", targetLang);

    const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
      method: "POST",
      headers: { "API-Subscription-Key": this.apiKey },
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

function clampSpeed(speed: number | undefined): number {
  if (!speed) return 1.0;
  return Math.min(1.5, Math.max(0.5, speed));
}

/**
 * Day 1 stub: returns a data: URL with the base64 audio. Day 2+ will
 * upload to Supabase Storage and return a signed URL when args.storage
 * is provided.
 */
async function persistOrInline(
  base64: string,
  _args: SynthesizeArgs,
): Promise<string> {
  return `data:audio/wav;base64,${base64}`;
}
