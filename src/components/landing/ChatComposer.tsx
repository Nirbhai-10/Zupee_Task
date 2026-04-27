"use client";

import * as React from "react";
import { Mic, Send, StopCircle } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useT } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/languages";
import { LanguagePickerPill } from "@/components/voice/LanguagePickerPill";
import { cn } from "@/lib/utils/cn";

type ChatComposerProps = {
  language: LanguageCode;
  disabled?: boolean;
  onSend: (text: string) => void;
  /** Show "Bharosa is typing…" above the composer when true. */
  pending?: boolean;
};

export function ChatComposer({ language, disabled, onSend, pending }: ChatComposerProps) {
  const t = useT();
  const [draft, setDraft] = React.useState("");
  const [voiceLang, setVoiceLang] = React.useState<LanguageCode>(language);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceLang(language);
  }, [language]);
  React.useEffect(() => {
    // Set after first client render so the voice-input picker (whose
    // visibility depends on `window.SpeechRecognition`) doesn't cause a
    // hydration mismatch with the SSR output.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { state, start, stop, isSupported } = useVoiceInput({
    language: voiceLang,
    onFinal: (text) => {
      setDraft(text);
    },
  });
  const showVoiceUi = mounted && isSupported;

  const recording = state.status === "listening";
  const interim = recording && state.transcript ? state.transcript : "";
  const ready = (interim || draft).trim().length > 0;

  function commit() {
    const text = (interim || draft).trim();
    if (!text || disabled) return;
    setDraft("");
    onSend(text);
  }

  function toggleMic() {
    if (recording) stop();
    else {
      setDraft("");
      start();
    }
  }

  return (
    <div className="border-t border-saathi-paper-edge bg-saathi-paper">
      {pending ? (
        <div className="flex items-center gap-2 border-b border-saathi-paper-edge px-3 py-1.5 text-[11px] text-saathi-ink-quiet">
          <span className="flex gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:300ms]" />
          </span>
          {t("Bharosa सोच रहा है…", "Bharosa is thinking…")}
        </div>
      ) : null}

      {recording ? (
        <div className="flex items-center gap-2 border-b border-saathi-paper-edge bg-saathi-danger-tint px-3 py-1.5 text-[11px] text-saathi-danger">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saathi-danger" />
          {t("रिकॉर्डिंग…", "Recording…")}
          <span className="ml-auto truncate text-saathi-ink-soft">{interim}</span>
        </div>
      ) : null}

      {showVoiceUi ? (
        <div className="flex items-center justify-end gap-2 border-b border-saathi-paper-edge px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">
            {t("बोलने की भाषा", "Voice input")}
          </span>
          <LanguagePickerPill value={voiceLang} onChange={setVoiceLang} />
        </div>
      ) : null}

      <div className="flex items-end gap-2 bg-saathi-cream/70 px-2 py-2">
        <textarea
          value={draft}
          rows={1}
          disabled={disabled || recording}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={t("Bharosa से कुछ पूछिए…", "Ask Bharosa anything…")}
          className="max-h-32 min-h-[38px] flex-1 resize-none rounded-[20px] border border-saathi-paper-edge bg-saathi-paper px-3.5 py-2 text-body-sm leading-snug text-saathi-ink outline-none placeholder:text-saathi-ink-quiet focus:border-saathi-deep-green/50 focus:ring-2 focus:ring-saathi-deep-green/10 disabled:opacity-60"
        />

        {showVoiceUi ? (
          <button
            type="button"
            aria-label={recording ? "Stop recording" : "Voice input"}
            onClick={toggleMic}
            disabled={disabled}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border transition-colors",
              recording
                ? "border-saathi-danger bg-saathi-danger text-white"
                : "border-saathi-paper-edge bg-saathi-paper text-saathi-ink-soft hover:bg-saathi-cream-deep",
            )}
          >
            {recording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        ) : null}

        <button
          type="button"
          aria-label="Send"
          onClick={commit}
          disabled={!ready || disabled}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-white shadow-soft transition-transform",
            ready && !disabled
              ? "bg-saathi-deep-green hover:scale-105 active:scale-95"
              : "bg-saathi-ink-whisper",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
