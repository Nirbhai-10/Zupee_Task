"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/languages";
import { useVoiceAgent, type VoiceAgentState, type VoiceTurn } from "@/hooks/use-voice-agent";
import { cn } from "@/lib/utils/cn";

function appLangToCode(appLang: "hi" | "en"): LanguageCode {
  return appLang === "en" ? "en-IN" : "hi-IN";
}

const SUGGESTED_PROMPTS: Record<"hi" | "en", { label: string; text: string }[]> = {
  hi: [
    { label: "📞 KBC scam", text: "Mummy ko WhatsApp pe KBC 25 lakh lottery ka message aaya hai — sahi hai ya scam?" },
    { label: "🧾 ULIP audit", text: "Bank wale ek Wealth Plus policy bech rahe hain — kya yeh sahi hai?" },
    { label: "💼 Recovery agent", text: "Devar ke credit card pe recovery agent raat 9 baje threat de raha hai. Kya karein?" },
    { label: "💰 Salary plan", text: "Mera salary 38,000 hai, ghar ke kharch ke baad 5,500 bachte hain. Kaise plan karein?" },
  ],
  en: [
    { label: "📞 KBC scam", text: "Mummy got a WhatsApp saying she won ₹25 lakh in a KBC lottery — is this real or a scam?" },
    { label: "🧾 ULIP audit", text: "The bank is pushing a Wealth Plus policy on me — should I take it?" },
    { label: "💼 Recovery agent", text: "A recovery agent is calling about my brother-in-law's credit card at 9 PM with threats. What can we do?" },
    { label: "💰 Salary plan", text: "My salary is ₹38,000 and after expenses I have ₹5,500 left. How should I plan it across 4 goals?" },
  ],
};

const STATE_LABEL: Record<VoiceAgentState, { hi: string; en: string }> = {
  idle: { hi: "दबाएँ और बोलिए", en: "Press & talk" },
  recording: { hi: "सुन रहा हूँ…", en: "Listening…" },
  transcribing: { hi: "समझ रहा हूँ…", en: "Transcribing…" },
  thinking: { hi: "सोच रहा हूँ…", en: "Thinking…" },
  speaking: { hi: "बोल रहा हूँ…", en: "Speaking…" },
};

/**
 * Big "Press & Talk" voice agent. Drives the Sarvam STT → Sarvam-M chat
 * → Sarvam bulbul TTS pipeline through the `useVoiceAgent` hook.
 *
 * UX:
 *  - Hold the giant mic (or hold SPACE) to record. Release to send.
 *  - 4 suggested-prompt chips for users who can't record.
 *  - Live language toggle (Hindi / English) without leaving the section.
 *  - Copy transcript + clear conversation actions.
 *  - Sarvam attribution badge that links back to sarvam.ai.
 */
export function VoiceAgent({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const { lang: appLang, setLang } = useLanguage();
  const lang: LanguageCode = appLangToCode(appLang);

  const greeting =
    lang === "en-IN"
      ? "Hi, I'm Bharosa. Press and hold the mic, ask me anything — scams, ULIPs, recovery agents, or how to plan your salary."
      : "Namaste, main Bharosa hoon. Mic dabaa ke kuch bhi poochhiye — scam, ULIP, recovery agent, ya salary plan.";

  const {
    state,
    turns,
    error,
    supported,
    startRecording,
    submitRecording,
    sendText,
    clear,
    isBusy,
  } = useVoiceAgent({ language: lang, greeting });

  const onPressDown = useCallback(() => {
    void startRecording();
  }, [startRecording]);

  const onPressUp = useCallback(() => {
    void submitRecording();
  }, [submitRecording]);

  // Spacebar walkie-talkie.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isHolding = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
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
      onPressUp();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onPressDown, onPressUp, state]);

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

  const userTurnCount = turns.filter((t) => t.role === "user").length;
  const showSuggestions = userTurnCount === 0 && state === "idle";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card border border-saathi-deep-green-line bg-gradient-to-br from-saathi-deep-green via-[#0d4f3f] to-[#082f24] text-white shadow-lift",
        compact ? "p-6" : "p-8 sm:p-10",
        className,
      )}
      aria-label={t("Bharosa voice agent", "Bharosa voice agent")}
    >
      <Halos />

      <div className="relative grid items-stretch gap-8 lg:grid-cols-[auto_1fr]">
        {/* Mic + status */}
        <div className="flex flex-col items-center gap-4">
          <PressTalkButton
            state={state}
            compact={compact}
            onDown={onPressDown}
            onUp={onPressUp}
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-h3 font-semibold tracking-tight">
              {t(STATE_LABEL[state].hi, STATE_LABEL[state].en)}
            </span>
            <span className="text-caption text-white/65">
              {t(
                "होल्ड करें · छोड़ें भेजने के लिए · SPACE = walkie-talkie",
                "Hold to record · release to send · SPACE = walkie-talkie",
              )}
            </span>
          </div>
        </div>

        {/* Conversation panel */}
        <div className="flex min-h-[300px] flex-col gap-3 rounded-card-sm bg-white/[0.06] p-4 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-caption uppercase tracking-wide text-white/65">
            <div className="inline-flex items-center gap-2">
              <span>{t("बातचीत", "Conversation")}</span>
              <a
                href="https://sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100 transition hover:bg-emerald-400/25"
                title="Powered by Sarvam-M, bulbul:v3 TTS, saarika:v2.5 STT"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-emerald-300",
                    isBusy && "animate-pulse",
                  )}
                />
                Sarvam · Bharat-native
              </a>
            </div>
            <div className="inline-flex items-center gap-2">
              <LanguagePill
                value={appLang}
                onChange={(next) => setLang(next)}
                disabled={isBusy}
              />
              <CopyTranscriptButton turns={turns} disabled={turns.length === 0} />
              <button
                type="button"
                onClick={clear}
                disabled={isBusy || turns.length <= 1}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                title={t("बातचीत reset करें", "Clear conversation")}
              >
                <RotateCcw className="h-3 w-3" />
                {t("Reset", "Clear")}
              </button>
            </div>
          </div>

          {/* Bubbles */}
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {turns.map((turn) => (
              <ConversationBubble key={turn.id} turn={turn} />
            ))}
            {state === "transcribing" && (
              <TypingHint label={t("समझ रहा हूँ…", "transcribing…")} />
            )}
            {state === "thinking" && (
              <TypingHint label={t("जवाब बना रहा हूँ…", "drafting reply…")} />
            )}
          </div>

          {/* Suggested-prompt chips */}
          {showSuggestions && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/55">
                <Sparkles className="h-3 w-3" />
                {t("कोशिश कीजिए", "Try one of these")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS[appLang].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => sendText(p.text)}
                    disabled={isBusy}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-caption text-white/85 transition hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-card-sm border border-saathi-danger/40 bg-saathi-danger/15 px-3 py-2 text-caption text-white">
              <span className="font-semibold text-saathi-danger-soft">
                {t("रुकिए — ", "Heads up — ")}
              </span>
              <span className="text-white/90">{error}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Halos() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-saathi-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl"
      />
    </>
  );
}

function PressTalkButton({
  state,
  compact,
  onDown,
  onUp,
}: {
  state: VoiceAgentState;
  compact: boolean;
  onDown: () => void;
  onUp: () => void;
}) {
  const isBusy =
    state === "transcribing" || state === "thinking" || state === "speaking";

  return (
    <button
      type="button"
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={state === "recording" ? onUp : undefined}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
      disabled={isBusy}
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
  );
}

function MicIcon({ state, compact }: { state: VoiceAgentState; compact: boolean }) {
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

function ConversationBubble({ turn }: { turn: VoiceTurn }) {
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

function LanguagePill({
  value,
  onChange,
  disabled,
}: {
  value: "hi" | "en";
  onChange: (next: "hi" | "en") => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-white/15 bg-white/5 text-[11px] font-semibold">
      {(["hi", "en"] as const).map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => !active && onChange(option)}
            disabled={disabled || active}
            className={cn(
              "px-2.5 py-1 transition",
              active
                ? "bg-saathi-gold text-saathi-deep-green"
                : "text-white/75 hover:bg-white/10",
              disabled && !active && "cursor-not-allowed opacity-40",
            )}
            aria-pressed={active}
          >
            {option === "hi" ? "हिन्दी" : "EN"}
          </button>
        );
      })}
    </div>
  );
}

function CopyTranscriptButton({
  turns,
  disabled,
}: {
  turns: VoiceTurn[];
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const text = turns
      .map((t) => `${t.role === "user" ? "You" : "Bharosa"}: ${t.text}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard denied — silently no-op.
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      title="Copy transcript"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
