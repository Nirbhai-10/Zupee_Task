"use client";

import * as React from "react";
import { Battery, Signal, Wifi, ChevronLeft, MoreVertical, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PhoneFrameProps = {
  /** Display name above the chat — usually a contact like "Bharosa" or family member. */
  contactName: string;
  /** Hindi/English status line — "online", "typing…", "last seen 2 min ago" etc. */
  contactStatus?: string;
  /** Avatar initials. Falls back to first 2 letters of contactName. */
  avatarInitials?: string;
  /** Owner of this phone — name shown in the small caption below the device. */
  ownerLabel?: string;
  /** Owner's age band so the simulator can flavor copy automatically. */
  ownerSubLabel?: string;
  /** WhatsApp wallpaper variant. */
  wallpaper?: "default" | "warm";
  children: React.ReactNode;
  className?: string;
};

/**
 * iPhone-shaped frame around a faithful WhatsApp clone. Three of these
 * live side-by-side on /demo/simulator. The frame itself is 320px wide;
 * scale via the parent's transform if you need a smaller stage.
 */
export function PhoneFrame({
  contactName,
  contactStatus,
  avatarInitials,
  ownerLabel,
  ownerSubLabel,
  wallpaper = "default",
  children,
  className,
}: PhoneFrameProps) {
  const initials = (avatarInitials ?? contactName.slice(0, 2)).toUpperCase();
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative w-[320px] rounded-[44px] bg-[#101820] p-2 shadow-lift">
        {/* Speaker / camera notch */}
        <div className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />

        <div className="relative flex h-[640px] flex-col overflow-hidden rounded-[36px] bg-saathi-cream">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-[#064E45] px-5 pb-2 pt-7 text-[10px] font-medium text-white/90">
            <span className="font-mono tabular-nums">9:42</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3 w-3" />
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="flex min-h-14 items-center gap-2 bg-[#064E45] px-3 py-2 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
            <ChevronLeft className="h-5 w-5 shrink-0 text-white/95" />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.15] text-[11px] font-semibold uppercase leading-none text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <div className="truncate text-sm font-semibold leading-tight text-white">{contactName}</div>
              {contactStatus ? (
                <div className="mt-0.5 truncate text-[11px] leading-tight text-white/80">{contactStatus}</div>
              ) : null}
            </div>
            <Video className="h-5 w-5 shrink-0 text-white/90" />
            <Phone className="h-5 w-5 shrink-0 text-white/90" />
            <MoreVertical className="h-5 w-5 shrink-0 text-white/90" />
          </div>

          {/* Conversation area */}
          <div
            className={cn(
              "relative flex-1 overflow-y-auto px-3 py-3",
              wallpaper === "default" ? "bg-[#ECE5DD]" : "bg-saathi-cream-deep",
            )}
            data-conversation-scroll
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, #075E54 0%, transparent 40%), radial-gradient(circle at 70% 70%, #128C7E 0%, transparent 40%)",
              }}
            />
            <div className="relative flex flex-col gap-1.5">{children}</div>
          </div>
        </div>
      </div>

      {ownerLabel ? (
        <div className="text-center">
          <div className="text-body-sm font-semibold text-saathi-ink">{ownerLabel}</div>
          {ownerSubLabel ? (
            <div className="text-caption text-saathi-ink-quiet">{ownerSubLabel}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
