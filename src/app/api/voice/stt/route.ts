import { NextResponse } from "next/server";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sarvam STT endpoint — accepts a `multipart/form-data` body with:
 *   - file:           Blob (audio/webm | audio/wav | audio/mpeg | audio/mp4)
 *   - language_code:  optional LanguageCode (defaults to "unknown" → auto)
 *   - model:          optional Sarvam STT model (default: saaras:v2)
 *
 * Returns: { transcript, detectedLanguage }
 *
 * Used by the <VoiceAgent/> "Press & Talk" button to convert recorded
 * mic audio into a transcript that we then feed into the chat router.
 */

const SARVAM_API_BASE = "https://api.sarvam.ai";

const LANG_TO_SARVAM: Partial<Record<LanguageCode, string>> = {
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
  "or-IN": "od-IN",
};

export async function POST(req: Request) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SARVAM_API_KEY not configured." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (error) {
    return NextResponse.json(
      { error: "Expected multipart/form-data", detail: (error as Error).message },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing 'file' blob in form" }, { status: 400 });
  }

  const langRaw = String(form.get("language_code") ?? "");
  const lang =
    langRaw && isLanguageCode(langRaw) ? LANG_TO_SARVAM[langRaw] ?? "unknown" : "unknown";
  const model = String(form.get("model") ?? process.env.SARVAM_STT_MODEL ?? "saaras:v2");

  // Sarvam expects WAV/MP3/FLAC; the browser MediaRecorder produces webm/opus
  // by default. Sarvam accepts webm/opus too (per docs), so we forward it
  // unchanged. If the provider rejects it we surface the error to the client.
  const upstream = new FormData();
  upstream.append("file", file, "input.webm");
  upstream.append("model", model);
  upstream.append("language_code", lang);
  if (model.startsWith("saaras")) {
    upstream.append("with_diarization", "false");
  }

  const started = Date.now();
  const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: upstream,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return NextResponse.json(
      { error: `Sarvam STT failed (${response.status})`, detail },
      { status: 502 },
    );
  }

  const json = (await response.json()) as {
    transcript?: string;
    language_code?: string;
  };

  return NextResponse.json({
    transcript: (json.transcript ?? "").trim(),
    detectedLanguage:
      json.language_code && isLanguageCode(json.language_code) ? json.language_code : null,
    latencyMs: Date.now() - started,
    provider: "sarvam",
    model,
  });
}
