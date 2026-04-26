"use client";

import * as React from "react";
import type { LanguageCode } from "@/lib/i18n/languages";

type VoiceInputState =
  | { status: "idle" }
  | { status: "unsupported" }
  | { status: "listening"; transcript: string }
  | { status: "stopped"; transcript: string }
  | { status: "error"; message: string };

type UseVoiceInputArgs = {
  language: LanguageCode;
  onFinal: (transcript: string) => void;
  /** Auto-stop after this many ms of silence. Default 2500. */
  silenceTimeoutMs?: number;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionConstructor = new () => SpeechRecognitionLike;

/**
 * Wraps browser SpeechRecognition for vernacular voice input. Used by the
 * landing chat widget, the Bharosa scam playground custom textarea, and
 * the goal creator. Falls back to `unsupported` on Firefox / older Safari.
 */
export function useVoiceInput({ language, onFinal, silenceTimeoutMs = 2500 }: UseVoiceInputArgs) {
  const [state, setState] = React.useState<VoiceInputState>({ status: "idle" });
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = React.useRef<string>("");

  const Recognition: RecognitionConstructor | null = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, []);

  React.useEffect(() => {
    // One-time mount-only feature detection — server can't tell whether
    // the client supports SpeechRecognition until hydration. Disable the
    // setState-in-effect lint here; it's the canonical pattern.
    if (!Recognition && typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "unsupported" });
    }
  }, [Recognition]);

  const stopSilenceTimer = React.useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stop = React.useCallback(() => {
    stopSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore — already stopped.
    }
  }, [stopSilenceTimer]);

  const start = React.useCallback(() => {
    if (!Recognition) {
      setState({ status: "unsupported" });
      return;
    }
    try {
      const rec = new Recognition();
      rec.lang = language;
      rec.interimResults = true;
      rec.continuous = false;
      transcriptRef.current = "";

      rec.onresult = (event) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          interim += r[0].transcript;
        }
        transcriptRef.current = interim;
        setState({ status: "listening", transcript: interim });
        stopSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
          stop();
        }, silenceTimeoutMs);
      };
      rec.onerror = (event) => {
        setState({ status: "error", message: event.error || "speech-recognition-error" });
      };
      rec.onend = () => {
        stopSilenceTimer();
        const final = transcriptRef.current.trim();
        if (final.length > 0) {
          setState({ status: "stopped", transcript: final });
          onFinal(final);
        } else {
          setState({ status: "idle" });
        }
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      setState({ status: "listening", transcript: "" });
      rec.start();
    } catch (err) {
      setState({ status: "error", message: (err as Error).message });
    }
  }, [Recognition, language, onFinal, silenceTimeoutMs, stop, stopSilenceTimer]);

  React.useEffect(() => {
    return () => {
      stopSilenceTimer();
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }
    };
  }, [stopSilenceTimer]);

  return { state, start, stop, isSupported: Recognition !== null };
}
