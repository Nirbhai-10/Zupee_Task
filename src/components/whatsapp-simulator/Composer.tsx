"use client";

import * as React from "react";
import { Mic, Plus, Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ComposerProps = {
  onSendText?: (text: string) => void;
  onMicPress?: () => void;
  /** Disable the input — useful while a turn is in flight. */
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

/**
 * WhatsApp-style composer. Left: emoji + attachment. Center: text field.
 * Right: mic OR send (swap when text is non-empty).
 */
export function Composer({
  onSendText,
  onMicPress,
  disabled,
  placeholder = "Message",
  className,
}: ComposerProps) {
  const [draft, setDraft] = React.useState("");
  const ready = draft.trim().length > 0;

  function commit() {
    if (!ready || disabled) return;
    const text = draft.trim();
    setDraft("");
    onSendText?.(text);
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 border-t border-black/5 bg-[#F0F0F0] px-2 py-2",
        className,
      )}
    >
      <div className="flex flex-1 items-end gap-2 rounded-3xl bg-white px-3 py-1.5 shadow-soft">
        <button
          type="button"
          aria-label="Emoji"
          className="text-saathi-ink-quiet hover:text-saathi-ink"
        >
          <Smile className="h-5 w-5" />
        </button>
        <textarea
          rows={1}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          className="max-h-24 min-h-[28px] flex-1 resize-none bg-transparent text-sm leading-snug outline-none placeholder:text-saathi-ink-quiet"
        />
        <button
          type="button"
          aria-label="Attach"
          className="text-saathi-ink-quiet hover:text-saathi-ink"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <button
        type="button"
        aria-label={ready ? "Send" : "Record voice note"}
        onClick={ready ? commit : onMicPress}
        disabled={disabled}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#075E54] text-white shadow-soft transition-transform",
          !disabled && "hover:scale-105 active:scale-95",
          disabled && "opacity-60",
        )}
      >
        {ready ? <Send className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
      </button>
    </div>
  );
}
