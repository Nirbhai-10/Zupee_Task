"use client";

import * as React from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { cn } from "@/lib/utils/cn";
import type { LanguageCode } from "@/lib/i18n/languages";
import { LANGUAGE_META } from "@/lib/i18n/languages";

type VoicePlayerProps = {
  /** Direct audio URL — Supabase Storage signed URL or static path. */
  src: string;
  /** Optional human-typed transcript (toggleable). */
  transcript?: string;
  /** Of the audio, not the surrounding UI. */
  language?: LanguageCode;
  durationHint?: number;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Saathi voice player. Default 64px tall on md, 48px on sm.
 *
 * Wavesurfer is initialised lazily on first interaction so we don't pay
 * the cost on cards that may never be played. The played portion of the
 * waveform turns gold; unplayed remains voice-tint.
 */
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
  const [isReady, setIsReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [duration, setDuration] = React.useState(durationHint ?? 0);
  const [position, setPosition] = React.useState(0);

  const ensureWavesurfer = React.useCallback(() => {
    if (wavesurferRef.current || !containerRef.current) return wavesurferRef.current;
    setIsLoading(true);
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
    ws.on("finish", () => setIsPlaying(false));
    wavesurferRef.current = ws;
    return ws;
  }, [src, size]);

  React.useEffect(() => {
    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    const ws = ensureWavesurfer();
    if (!ws) return;
    if (isPlaying) {
      ws.pause();
      setIsPlaying(false);
    } else {
      void ws.play();
      setIsPlaying(true);
    }
  };

  const heightClass = size === "sm" ? "h-12" : "h-16";
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-11 w-11";

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

        <div ref={containerRef} className={cn("flex-1", !isReady && "saathi-breathe rounded-sm bg-saathi-voice-tint/60")} />

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
