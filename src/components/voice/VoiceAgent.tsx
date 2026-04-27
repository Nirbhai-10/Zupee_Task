"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/languages";
import { decodeBrowserTTS } from "@/lib/voice/browser-voice";
import { cn } from "@/lib/utils/cn";

function appLangToCode(appLang: "hi" | "en"): LanguageCode {
  return appLang === "en" ? "en-IN" : "hi-IN";
}

type VoiceState = "idle" | "recording" | "transcribing" | "thinking" | "speaking";

type Turn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  language?: LanguageCode;
};

/**
 * Big "Press & Talk" mic. End-to-end conversational voice loop:
 *
 *   1. mousedown / touchstart            → MediaRecorder.start()
 *   2. mouseup   / touchend / keyup esc  → MediaRecorder.stop()
 *   3. blob → /api/voice/stt              (Sarvam saaras / saarika)
 *   4. transcript → /api/chat/respond     (Sarvam-M chat + Sarvam TTS reply)
 *   5. autoplay reply audio + show transcript bubbles
 *
 * Fully accessible: SPACE bar acts as walkie-talkie. Tap-and-hold on touch.
 * Falls back gracefully when SARVAM_API_KEY is missing — the API surfaces a
 * 503 and the component shows a polite explanation rather than crashing.
 */
export function VoiceAgent({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const { lang: appLang } = useLanguage();
  const lang: LanguageCode = appLangToCode(appLang);
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
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

  // Greet on first paint.
  useEffect(() => {
    if (turns.length > 0) return;
    const greet =
      lang === "en-IN"
        ? "Hi, I'm Bharosa. Press and hold the mic, ask me anything — scams, ULIPs, recovery agents, or how to plan your salary."
        : "Namaste, main Bharosa hoon. Mic dabaa ke kuch bhi poochhiye — scam, ULIP, recovery agent, ya salary plan.";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTurns([{ id: "greet", role: "assistant", text: greet, language: lang }]);
  }, [lang, turns.length]);

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

  const startRecording = useCallback(async () => {
    if (state !== "idle") return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      setState("recording");
    } catch (_err) {
      setError(
        lang === "en-IN"
          ? "Microphone access denied. Please allow it in your browser settings."
          : "Mic ki permission nahi mili. Browser settings mein allow kar dijiye.",
      );
      setState("idle");
    }
  }, [lang, state]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    return new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const playReplyAudio = useCallback(async (audioUrl: string) => {
    setState("speaking");
    try {
      if (audioUrl.startsWith("browser-tts:")) {
        // Browser fallback path — use SpeechSynthesis directly.
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

      // Stop the previous reply if it's still playing.
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

  const submitTurn = useCallback(
    async (audioBlob: Blob, history: Turn[]) => {
      setState("transcribing");
      try {
        const sttForm = new FormData();
        sttForm.append("file", audioBlob, "input.webm");
        sttForm.append("language_code", lang);
        const sttRes = await fetch("/api/voice/stt", { method: "POST", body: sttForm });
        if (!sttRes.ok) {
          const detail = await sttRes.json().catch(() => ({}));
          throw new Error(detail?.error ?? `STT failed (${sttRes.status})`);
        }
        const sttJson = (await sttRes.json()) as {
          transcript: string;
          detectedLanguage: LanguageCode | null;
        };
        const transcript = (sttJson.transcript ?? "").trim();
        if (!transcript) {
          setError(
            lang === "en-IN"
              ? "I couldn't hear you. Try again — speak a little louder."
              : "Awaaz saaf nahi aayi. Phir try kijiye — thoda zor se boliye.",
          );
          setState("idle");
          return;
        }
        const userTurn: Turn = {
          id: `u-${Date.now()}`,
          role: "user",
          text: transcript,
          language: sttJson.detectedLanguage ?? lang,
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
            preferredLanguage: sttJson.detectedLanguage ?? lang,
            generateVoice: true,
          }),
        });
        if (!chatRes.ok) {
          const detail = await chatRes.json().catch(() => ({}));
          throw new Error(detail?.error ?? `Chat failed (${chatRes.status})`);
        }
        const chatJson = (await chatRes.json()) as {
          text: string;
          language: LanguageCode;
          audioUrl?: string;
        };
        const replyTurn: Turn = {
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
      } catch (err) {
        const msg = (err as Error).message;
        setError(
          lang === "en-IN"
            ? `Voice agent error: ${msg}`
            : `Voice agent mein error: ${msg}`,
        );
        setState("idle");
      }
    },
    [lang, playReplyAudio],
  );

  const onPressDown = useCallback(() => {
    void startRecording();
  }, [startRecording]);

  const onPressUp = useCallback(async () => {
    if (state !== "recording") return;
    const blob = await stopRecording();
    if (blob && blob.size > 0) {
      await submitTurn(blob, turns);
    } else {
      setState("idle");
    }
  }, [state, stopRecording, submitTurn, turns]);

  // Spacebar walkie-talkie. Active only when component is in DOM.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isHolding = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (state !== "idle") return;
      isHolding = true;
      e.preventDefault();
      onPressDown();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !isHolding) return;
      isHolding = false;
      e.preventDefault();
      void onPressUp();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onPressDown, onPressUp, state]);

  const buttonLabel: Record<VoiceState, { hi: string; en: string }> = {
    idle: { hi: "दबाएँ और बोलिए", en: "Press & talk" },
    recording: { hi: "सुन रहा हूँ…", en: "Listening…" },
    transcribing: { hi: "समझ रहा हूँ…", en: "Transcribing…" },
    thinking: { hi: "सोच रहा हूँ…", en: "Thinking…" },
    speaking: { hi: "बोल रहा हूँ…", en: "Speaking…" },
  };

  const isBusy = state !== "idle";

  if (!supported) {
    return (
      <div
        className={cn(
          "rounded-card border border-saathi-paper-edge bg-saathi-paper p-6 text-center text-saathi-ink-soft",
          className,
        )}
      >
        {t(
          "यह browser mic record नहीं कर सकता। Chrome / Safari पर खोलिए।",
          "This browser can't record from the mic. Please open in Chrome or Safari.",
        )}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card border border-saathi-deep-green-line bg-gradient-to-br from-saathi-deep-green via-[#0d4f3f] to-[#082f24] text-white shadow-lift",
        compact ? "p-6" : "p-8 sm:p-10",
        className,
      )}
      aria-label={t("Bharosa voice agent", "Bharosa voice agent")}
    >
      {/* Soft halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-saathi-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl"
      />

      <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        {/* Mic side */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onMouseDown={onPressDown}
            onMouseUp={onPressUp}
            onMouseLeave={state === "recording" ? () => void onPressUp() : undefined}
            onTouchStart={(e) => {
              e.preventDefault();
              onPressDown();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              void onPressUp();
            }}
            disabled={state === "transcribing" || state === "thinking" || state === "speaking"}
            aria-pressed={state === "recording"}
            className={cn(
              "group relative flex items-center justify-center rounded-full transition-all duration-300 ease-out",
              compact ? "h-32 w-32" : "h-44 w-44 sm:h-52 sm:w-52",
              state === "recording"
                ? "scale-105 bg-saathi-danger/95 shadow-[0_0_0_18px_rgba(229,72,77,0.18),0_0_0_36px_rgba(229,72,77,0.10)]"
                : isBusy
                  ? "bg-saathi-gold/85 shadow-[0_0_0_14px_rgba(199,156,72,0.22)]"
                  : "bg-white text-saathi-deep-green shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] hover:scale-[1.03]",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-saathi-gold/60",
            )}
          >
            {state === "recording" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-saathi-danger/30"
              />
            )}
            <MicIcon state={state} compact={compact} />
          </button>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-h3 font-semibold tracking-tight">
              {t(buttonLabel[state].hi, buttonLabel[state].en)}
            </span>
            <span className="text-caption text-white/65">
              {t(
                "होल्ड करें · छोड़ें भेजने के लिए · SPACE = walkie-talkie",
                "Hold to record · release to send · SPACE = walkie-talkie",
              )}
            </span>
          </div>
        </div>

        {/* Conversation side */}
        <div className="flex min-h-[260px] flex-col gap-3 rounded-card-sm bg-white/[0.06] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-caption uppercase tracking-wide text-white/65">
            <span>{t("बातचीत", "Conversation")}</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-200">
              <span className={cn("h-1.5 w-1.5 rounded-full bg-emerald-300", isBusy && "animate-pulse")} />
              Sarvam · Bharat-native
            </span>
          </div>
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {turns.map((turn) => (
              <ConversationBubble key={turn.id} turn={turn} />
            ))}
            {state === "transcribing" && <TypingHint label={t("transcribe…", "transcribing…")} />}
            {state === "thinking" && <TypingHint label={t("जवाब बना रहा हूँ…", "drafting reply…")} />}
          </div>
          {error && (
            <div className="rounded-card-sm bg-saathi-danger/15 px-3 py-2 text-caption text-saathi-danger-soft">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MicIcon({ state, compact }: { state: VoiceState; compact: boolean }) {
  const size = compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20";
  if (state === "transcribing" || state === "thinking") {
    return <Loader2 className={cn(size, "animate-spin text-white")} aria-hidden />;
  }
  if (state === "speaking") {
    return <Volume2 className={cn(size, "text-white")} aria-hidden />;
  }
  if (state === "recording") {
    return <MicOff className={cn(size, "text-white")} aria-hidden />;
  }
  return <Mic className={cn(size)} aria-hidden />;
}

function ConversationBubble({ turn }: { turn: Turn }) {
  const isUser = turn.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3 py-2 text-body-sm leading-relaxed shadow-soft",
          isUser
            ? "rounded-tr-sm bg-saathi-gold/95 text-saathi-deep-green"
            : "rounded-tl-sm bg-white text-saathi-ink",
        )}
        data-script={turn.language?.startsWith("hi") ? "devanagari" : undefined}
      >
        {turn.text}
      </div>
    </div>
  );
}

function TypingHint({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-caption text-white/80">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {label}
      </div>
    </div>
  );
}
