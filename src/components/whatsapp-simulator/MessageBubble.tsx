"use client";

import * as React from "react";
import Image from "next/image";
import { Check, CheckCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import type { LanguageCode } from "@/lib/i18n/languages";
import { LANGUAGE_META } from "@/lib/i18n/languages";

export type MessageDirection = "inbound" | "outbound";

export type MessageBubbleVariant =
  | { kind: "text"; text: string; lang?: LanguageCode }
  | { kind: "image"; src: string; caption?: string; alt: string }
  | {
      kind: "voice";
      audioUrl: string;
      durationMs?: number;
      transcript?: string;
      lang?: LanguageCode;
    }
  | { kind: "document"; fileName: string; pages?: number };

type MessageBubbleProps = {
  variant: MessageBubbleVariant;
  direction: MessageDirection;
  /** "9:42" — pre-formatted; we do not re-localize per phone. */
  timestamp: string;
  /** outbound only — single check / double check / blue checks */
  status?: "sent" | "delivered" | "read";
  /** For grouped consecutive messages, hide the tail. */
  hideTail?: boolean;
  /** Highlight: scam alert ribbon, etc. */
  highlight?: "scam" | "savings" | "none";
};

/**
 * Faithful WhatsApp bubble. Outbound = right, light-green. Inbound =
 * left, white. The simulator phone wraps these inside <PhoneFrame/>.
 */
export function MessageBubble({
  variant,
  direction,
  timestamp,
  status = "sent",
  hideTail,
  highlight = "none",
}: MessageBubbleProps) {
  const isOutbound = direction === "outbound";
  return (
    <div className={cn("flex w-full", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-snug shadow-soft",
          isOutbound ? "bg-[#DCF8C6] text-saathi-ink" : "bg-white text-saathi-ink",
          !hideTail && (isOutbound ? "rounded-tr-sm" : "rounded-tl-sm"),
          highlight === "scam" && "ring-2 ring-saathi-danger/40",
          highlight === "savings" && "ring-2 ring-saathi-gold/40",
        )}
      >
        {variant.kind === "text" ? (
          <p
            className={cn(
              variant.lang && LANGUAGE_META[variant.lang]?.indic ? "font-deva" : "font-sans",
            )}
            lang={variant.lang ? LANGUAGE_META[variant.lang]?.iso : undefined}
          >
            {variant.text}
          </p>
        ) : null}

        {variant.kind === "image" ? (
          <div className="overflow-hidden rounded-md">
            <Image
              src={variant.src}
              alt={variant.alt}
              width={240}
              height={180}
              className="h-auto w-full object-cover"
            />
            {variant.caption ? (
              <p className="mt-1 text-xs text-saathi-ink-soft">{variant.caption}</p>
            ) : null}
          </div>
        ) : null}

        {variant.kind === "voice" ? (
          <div className="-mx-1 -my-0.5 w-[240px]">
            <VoicePlayer
              src={variant.audioUrl}
              transcript={variant.transcript}
              language={variant.lang}
              durationHint={variant.durationMs ? variant.durationMs / 1000 : undefined}
              size="sm"
            />
          </div>
        ) : null}

        {variant.kind === "document" ? (
          <div className="flex items-center gap-2 rounded-md bg-saathi-cream-deep/40 p-2">
            <FileText className="h-6 w-6 text-saathi-deep-green" />
            <div className="text-xs">
              <div className="font-medium">{variant.fileName}</div>
              {variant.pages ? (
                <div className="text-saathi-ink-quiet">{variant.pages} pages</div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-saathi-ink-quiet">
          <span className="font-mono tabular-nums">{timestamp}</span>
          {isOutbound ? (
            status === "read" ? (
              <CheckCheck className="h-3 w-3 text-[#34B7F1]" />
            ) : status === "delivered" ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
