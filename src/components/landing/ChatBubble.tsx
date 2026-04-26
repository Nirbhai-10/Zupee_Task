"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { detectScript } from "@/lib/i18n/scripts";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/lib/chat/types";
import type { LanguageCode } from "@/lib/i18n/languages";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const script = detectScript(message.text);

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-2xl px-3 py-2 text-sm leading-snug shadow-soft",
          isUser ? "rounded-tr-sm bg-[#DCF8C6] text-saathi-ink" : "rounded-tl-sm bg-white text-saathi-ink",
        )}
      >
        {!isUser ? (
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-saathi-deep-green/70">
            <Sparkles className="h-2.5 w-2.5" />
            Bharosa
          </div>
        ) : null}

        <p
          data-script={script}
          className={cn("whitespace-pre-wrap", script === "latin" ? "font-sans" : "font-deva")}
        >
          {message.text}
        </p>

        {message.audioUrl ? (
          <div className="-mx-1">
            <VoicePlayer
              src={message.audioUrl}
              language={(message.language as LanguageCode | undefined) ?? "hi-IN"}
              size="sm"
            />
          </div>
        ) : null}

        {message.cta ? (
          <Link
            href={message.cta.href}
            className="inline-flex items-center gap-1 rounded-pill bg-saathi-deep-green px-3 py-1 text-[11px] font-medium text-white shadow-soft hover:bg-saathi-deep-green-soft"
          >
            {message.cta.label} →
          </Link>
        ) : null}

        <div className="text-[10px] text-right font-mono tabular-nums text-saathi-ink-quiet">
          {new Date(message.createdAt).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      </div>
    </div>
  );
}
