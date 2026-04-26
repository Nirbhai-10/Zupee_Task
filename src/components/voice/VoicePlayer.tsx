"use client";

import * as React from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { cn } from "@/lib/utils/cn";
import type { LanguageCode } from "@/lib/i18n/languages";
import { LANGUAGE_META } from "@/lib/i18n/languages";
import { decodeBrowserTTS } from "@/lib/voice/browser-voice";

type VoicePlayerProps = {
  /** Sarvam returns `data:audio/wav;base64,...`, browser fallback returns
   *  `browser-tts:<encoded-payload>`. Plain http(s) URLs also work. */
  src: string;
  transcript?: string;
  language?: LanguageCode;
  durationHint?: number;
  className?: string;
  size?: "sm" | "md";
};

type PlaybackMode = "wavesurfer" | "speech-synthesis" | "unsupported";

function detectMode(src: string): PlaybackMode {
  if (!src) return "unsupported";
  if (src.startsWith("browser-tts:")) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return "speech-synthesis";
    }
    return "unsupported";
  }
  return "wavesurfer";
}

export function VoicePlayer({
  src,
  transcript,
  language,
  durationHint,
  className,
  size = "md",
}: VoicePlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wavesurferRef = React.useRef<WaveSurfer | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const speechProgressRef = React.useRef<{
    raf: number | null;
    startedAt: number;
    estimatedMs: number;
  }>({ raf: null, startedAt: 0, estimatedMs: 0 });

  const mode = React.useMemo(() => detectMode(src), [src]);

  const [isReady, setIsReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [duration, setDuration] = React.useState(durationHint ?? 0);
  const [position, setPosition] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────
  // Wavesurfer path (data: URLs from Sarvam, http(s) URLs).
  // ─────────────────────────────────────────────────────────────────
  const ensureWavesurfer = React.useCallback(() => {
    if (mode !== "wavesurfer") return null;
    if (wavesurferRef.current || !containerRef.current) return wavesurferRef.current;
    setIsLoading(true);
    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#DDE9E5",
        progressColor: "#C8973F",
        cursorColor: "#0F4D3F",
        cursorWidth: 2,
        barWidth: 2,
        barGap: 2,
        barRadius: 1,
        height: size === "sm" ? 28 : 36,
        normalize: true,
        url: src,
      });
      ws.on("ready", () => {
        setIsReady(true);
        setIsLoading(false);
        setDuration(ws.getDuration());
      });
      ws.on("audioprocess", (time) => setPosition(time));
      ws.on("seeking", (time) => setPosition(time));
      ws.on("finish", () => {
        setIsPlaying(false);
        setPosition(0);
      });
      ws.on("error", (err) => {
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });
      wavesurferRef.current = ws;
      return ws;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
      return null;
    }
  }, [src, size, mode]);

  // ─────────────────────────────────────────────────────────────────
  // Speech-synthesis path (browser-tts:<...> marker URLs).
  // ─────────────────────────────────────────────────────────────────
  const speak = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const decoded = decodeBrowserTTS(src);
    if (!decoded) {
      setError("Could not decode browser TTS payload.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop anything still queued.
    const utt = new SpeechSynthesisUtterance(decoded.text);
    utt.lang = decoded.lang || "hi-IN";
    utt.rate = decoded.speed || 1.0;

    // Pick the best matching voice.
    const voices = window.speechSynthesis.getVoices();
    const matched =
      voices.find((v) => v.lang === utt.lang) ??
      voices.find((v) => v.lang.startsWith(utt.lang.slice(0, 2))) ??
      null;
    if (matched) utt.voice = matched;

    // Estimate duration: ~14 chars/sec for Hindi at rate 1.
    const estimatedMs = Math.max(2000, Math.round((decoded.text.length / 14) * 1000));
    setDuration(estimatedMs / 1000);
    speechProgressRef.current.startedAt = performance.now();
    speechProgressRef.current.estimatedMs = estimatedMs;

    const tick = () => {
      const elapsed = performance.now() - speechProgressRef.current.startedAt;
      const t = Math.min(estimatedMs, elapsed) / 1000;
      setPosition(t);
      if (elapsed < estimatedMs && utteranceRef.current) {
        speechProgressRef.current.raf = requestAnimationFrame(tick);
      }
    };

    utt.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      speechProgressRef.current.raf = requestAnimationFrame(tick);
    };
    utt.onend = () => {
      setIsPlaying(false);
      setPosition(0);
      if (speechProgressRef.current.raf) {
        cancelAnimationFrame(speechProgressRef.current.raf);
        speechProgressRef.current.raf = null;
      }
      utteranceRef.current = null;
    };
    utt.onerror = (event) => {
      setIsPlaying(false);
      setIsLoading(false);
      setError(`Speech synthesis error: ${event.error}`);
      if (speechProgressRef.current.raf) {
        cancelAnimationFrame(speechProgressRef.current.raf);
        speechProgressRef.current.raf = null;
      }
      utteranceRef.current = null;
    };

    utteranceRef.current = utt;
    setIsLoading(true);
    window.speechSynthesis.speak(utt);
  }, [src]);

  const stopSpeaking = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    if (speechProgressRef.current.raf) {
      cancelAnimationFrame(speechProgressRef.current.raf);
      speechProgressRef.current.raf = null;
    }
    setIsPlaying(false);
    setPosition(0);
    utteranceRef.current = null;
  }, []);

  // Cleanup on unmount.
  React.useEffect(() => {
    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // ─────────────────────────────────────────────────────────────────
  // Toggle.
  // ─────────────────────────────────────────────────────────────────
  const togglePlay = () => {
    setError(null);
    if (mode === "wavesurfer") {
      const ws = ensureWavesurfer();
      if (!ws) return;
      if (isPlaying) {
        ws.pause();
        setIsPlaying(false);
      } else {
        void ws.play();
        setIsPlaying(true);
      }
    } else if (mode === "speech-synthesis") {
      if (isPlaying) {
        stopSpeaking();
      } else {
        speak();
      }
    }
  };

  const heightClass = size === "sm" ? "h-12" : "h-16";
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  if (mode === "unsupported") {
    return (
      <div className={cn("rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep p-3 text-caption text-saathi-ink-quiet", className)}>
        Voice not playable in this browser. Transcript:
        {transcript ? <p lang={language ? LANGUAGE_META[language].iso : undefined} className="mt-1 text-saathi-ink-soft">{transcript}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-card-sm border border-saathi-paper-edge bg-saathi-cream px-3",
          heightClass,
        )}
      >
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          disabled={isLoading && !isPlaying}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green text-white transition-colors hover:bg-saathi-deep-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-deep-green/30",
            buttonSize,
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-px" />
          )}
        </button>

        <div className="flex flex-1 items-center min-w-0">
          {mode === "wavesurfer" ? (
            <div ref={containerRef} className={cn("flex-1", !isReady && "saathi-breathe rounded-sm bg-saathi-voice-tint/60 h-7")} />
          ) : (
            <SpeechBars active={isPlaying} progress={duration > 0 ? position / duration : 0} />
          )}
        </div>

        <div className="flex flex-col items-end shrink-0 gap-0.5">
          <span className="font-mono tabular-nums text-caption text-saathi-ink-soft">
            {formatTime(position)} / {formatTime(duration)}
          </span>
          {language ? (
            <span className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">
              {LANGUAGE_META[language].endonym}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-caption text-saathi-danger">{error}</p>
      ) : null}

      {transcript ? (
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="text-caption text-saathi-deep-green hover:underline"
          >
            {showTranscript ? "Transcript chhupayein" : "Transcript dekhein"}
          </button>
        </div>
      ) : null}

      {transcript && showTranscript ? (
        <p
          lang={language ? LANGUAGE_META[language].iso : undefined}
          className="rounded-card-sm border border-saathi-paper-edge bg-saathi-paper p-3 text-body-sm text-saathi-ink-soft"
        >
          {transcript}
        </p>
      ) : null}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Lightweight bar visualiser used as a proxy for the speech-synthesis
 * playback state. We can't read the audio output of SpeechSynthesisUtterance,
 * so we fake a rhythmic equaliser that gives the user a "voice is happening"
 * cue. Honors prefers-reduced-motion through globals.css.
 */
function SpeechBars({ active, progress }: { active: boolean; progress: number }) {
  const bars = 24;
  const filledCount = Math.max(1, Math.round(progress * bars));
  return (
    <div className="flex flex-1 items-center gap-[2px] h-7">
      {Array.from({ length: bars }).map((_, i) => {
        const isFilled = i < filledCount;
        const heightPct = active ? 30 + ((i * 13) % 70) : 40;
        return (
          <span
            key={i}
            className={cn(
              "block w-[3px] rounded-sm transition-colors",
              isFilled ? "bg-saathi-gold" : "bg-saathi-voice-tint",
              active && "saathi-breathe",
            )}
            style={{
              height: `${heightPct}%`,
              animationDelay: `${i * 40}ms`,
              animationDuration: "1.2s",
            }}
          />
        );
      })}
    </div>
  );
}
