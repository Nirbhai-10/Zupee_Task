"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/lib/i18n/languages";
import { decodeBrowserTTS } from "@/lib/voice/browser-voice";
import { encodeBlobToWav16kMono } from "@/lib/voice/wav-encoder";

export type VoiceAgentState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking";

export type VoiceTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  language?: LanguageCode;
};

type Options = {
  /** Caller-preferred language. Sent to STT + chat as a hint. */
  language: LanguageCode;
  /** Greeting injected as the first assistant turn. */
  greeting?: string;
};

/**
 * useVoiceAgent — extracts the conversational state machine out of the
 * VoiceAgent component so the UI stays presentational. One agent per hook
 * instance; cleans up media + audio on unmount.
 *
 * Pipeline:
 *   startRecording()  → MediaRecorder.start()
 *   stopRecording()   → wav-encode + POST /api/voice/stt (Sarvam saarika)
 *                     → POST /api/chat/respond     (Sarvam-M chat)
 *                     → autoplay reply via Sarvam bulbul TTS
 *
 * sendText(text)     → bypass STT (use the suggested-prompt chips path)
 * clear()            → reset turns to greeting only
 */
export function useVoiceAgent({ language, greeting }: Options) {
  const [state, setState] = useState<VoiceAgentState>("idle");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Detect browser support after mount (avoids SSR mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof window.MediaRecorder !== "undefined";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(ok);
  }, []);

  // Seed greeting once.
  useEffect(() => {
    if (!greeting) return;
    if (turns.length > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTurns([{ id: "greet", role: "assistant", text: greeting, language }]);
  }, [greeting, language, turns.length]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const a = currentAudioRef.current;
      if (a) {
        a.pause();
        a.src = "";
      }
    };
  }, []);

  const playReplyAudio = useCallback(async (audioUrl: string) => {
    setState("speaking");
    try {
      if (audioUrl.startsWith("browser-tts:")) {
        const decoded = decodeBrowserTTS(audioUrl);
        if (decoded && typeof window !== "undefined" && "speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance(decoded.text);
          utter.lang = decoded.lang;
          utter.rate = decoded.speed ?? 1;
          utter.onend = () => setState("idle");
          utter.onerror = () => setState("idle");
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
          return;
        }
        setState("idle");
        return;
      }

      const prev = currentAudioRef.current;
      if (prev) {
        prev.pause();
        prev.src = "";
      }
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("idle");
      await audio.play();
    } catch {
      setState("idle");
    }
  }, []);

  /** Run the chat → TTS → playback half of the loop given a transcript. */
  const dispatchTranscript = useCallback(
    async (
      transcript: string,
      detectedLanguage: LanguageCode | null,
      history: VoiceTurn[],
    ) => {
      const userTurn: VoiceTurn = {
        id: `u-${Date.now()}`,
        role: "user",
        text: transcript,
        language: detectedLanguage ?? language,
      };
      const nextHistory = [...history, userTurn];
      setTurns(nextHistory);
      setState("thinking");

      const chatRes = await fetch("/api/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((t) => ({
            id: t.id,
            role: t.role,
            text: t.text,
            language: t.language,
            createdAt: new Date().toISOString(),
          })),
          preferredLanguage: detectedLanguage ?? language,
          generateVoice: true,
        }),
      });
      if (!chatRes.ok) {
        const detail = (await chatRes.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
        };
        const msg =
          [detail?.error, detail?.detail].filter(Boolean).join(" — ") ||
          `Chat failed (${chatRes.status})`;
        throw new Error(msg);
      }
      const chatJson = (await chatRes.json()) as {
        text: string;
        language: LanguageCode;
        audioUrl?: string;
      };
      const replyTurn: VoiceTurn = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: chatJson.text,
        language: chatJson.language,
      };
      setTurns([...nextHistory, replyTurn]);

      if (chatJson.audioUrl) {
        await playReplyAudio(chatJson.audioUrl);
      } else {
        setState("idle");
      }
    },
    [language, playReplyAudio],
  );

  const startRecording = useCallback(async () => {
    if (state !== "idle") return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      setState("recording");
    } catch {
      setError(
        language === "en-IN"
          ? "Microphone access denied. Allow it in your browser settings."
          : "Mic ki permission nahi mili. Browser settings mein allow kar dijiye.",
      );
      setState("idle");
    }
  }, [language, state]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return Promise.resolve(null);
    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const submitRecording = useCallback(async () => {
    if (state !== "recording") return;
    const blob = await stopRecording();
    if (!blob || blob.size === 0) {
      setState("idle");
      return;
    }
    setState("transcribing");
    try {
      const wav = await encodeBlobToWav16kMono(blob);
      const sttForm = new FormData();
      sttForm.append("file", wav, "input.wav");
      sttForm.append("language_code", language);
      const sttRes = await fetch("/api/voice/stt", {
        method: "POST",
        body: sttForm,
      });
      if (!sttRes.ok) {
        const detail = (await sttRes.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
        };
        throw new Error(
          [detail?.error, detail?.detail].filter(Boolean).join(" — ") ||
            `STT failed (${sttRes.status})`,
        );
      }
      const sttJson = (await sttRes.json()) as {
        transcript: string;
        detectedLanguage: LanguageCode | null;
      };
      const transcript = (sttJson.transcript ?? "").trim();
      if (!transcript) {
        setError(
          language === "en-IN"
            ? "I couldn't hear you. Try again — speak a little louder."
            : "Awaaz saaf nahi aayi. Phir try kijiye — thoda zor se boliye.",
        );
        setState("idle");
        return;
      }
      await dispatchTranscript(transcript, sttJson.detectedLanguage, turns);
    } catch (err) {
      const msg = (err as Error).message;
      setError(
        language === "en-IN"
          ? `Voice agent error: ${msg}`
          : `Voice agent mein error: ${msg}`,
      );
      setState("idle");
    }
  }, [dispatchTranscript, language, state, stopRecording, turns]);

  /** Send a text message as if the user typed it — bypasses STT. Used by
   *  the suggested-prompt chips for users who don't want to record. */
  const sendText = useCallback(
    async (text: string) => {
      if (state !== "idle") return;
      const trimmed = text.trim();
      if (!trimmed) return;
      setError(null);
      try {
        await dispatchTranscript(trimmed, language, turns);
      } catch (err) {
        const msg = (err as Error).message;
        setError(
          language === "en-IN"
            ? `Voice agent error: ${msg}`
            : `Voice agent mein error: ${msg}`,
        );
        setState("idle");
      }
    },
    [dispatchTranscript, language, state, turns],
  );

  const clear = useCallback(() => {
    if (state !== "idle") return;
    setError(null);
    setTurns(
      greeting
        ? [{ id: "greet", role: "assistant", text: greeting, language }]
        : [],
    );
    const audio = currentAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [greeting, language, state]);

  return {
    state,
    turns,
    error,
    supported,
    startRecording,
    submitRecording,
    sendText,
    clear,
    isBusy: state !== "idle",
  };
}
