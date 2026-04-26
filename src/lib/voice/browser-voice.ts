import type {
  SynthesizeArgs,
  SynthesizeResult,
  TranscribeArgs,
  TranscribeResult,
  VoiceProvider,
} from "./provider-interface";

/**
 * Browser fallback that emits a marker URL the client knows how to
 * render: `browser-tts:<encoded-payload>`. The client component decodes
 * this and calls `window.speechSynthesis.speak(...)`. Free, lower
 * quality, works for the demo when Sarvam isn't configured.
 *
 * STT is also done client-side via the Web Speech API; the server-side
 * `transcribe` here only exists so the interface is satisfied — real
 * audio transcription happens in `useVoiceRecorder` on the client.
 */
export class BrowserVoiceProvider implements VoiceProvider {
  readonly name = "browser" as const;

  isAvailable(): boolean {
    return true; // Always present as fallback.
  }

  async synthesize(args: SynthesizeArgs): Promise<SynthesizeResult> {
    const payload = {
      text: args.text,
      lang: args.language,
      timbre: args.timbre ?? "saathi-female",
      speed: args.speed ?? 1.0,
    };
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const audioUrl = `browser-tts:${encoded}`;
    const durationMs = Math.round((args.text.length / 14) * 1000);
    return { audioUrl, durationMs, provider: "browser", costPaise: 0 };
  }

  async transcribe(_args: TranscribeArgs): Promise<TranscribeResult> {
    return {
      text: "",
      detectedLanguage: null,
      durationMs: 0,
      provider: "browser",
    };
  }
}

/** Decode a `browser-tts:...` URL into the original payload. Used by the
 *  client voice player to re-synthesise via SpeechSynthesisUtterance. */
export function decodeBrowserTTS(url: string): {
  text: string;
  lang: string;
  timbre: string;
  speed: number;
} | null {
  if (!url.startsWith("browser-tts:")) return null;
  try {
    const encoded = url.slice("browser-tts:".length);
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
