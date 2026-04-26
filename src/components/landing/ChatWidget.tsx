"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

const HIDE_ON_PREFIXES = [
  "/home",
  "/family",
  "/goals",
  "/defenses",
  "/investments",
  "/timeline",
  "/conversations",
  "/settings",
  "/admin",
  "/demo/simulator",
  "/api",
];

/**
 * Floating chat button + panel. Mounted at the root layout, but hidden
 * on authenticated app routes (where the in-app conversation surface
 * lives) and on the live simulator (which has its own chat affordance).
 */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const t = useT();

  const isHidden = HIDE_ON_PREFIXES.some((p) =>
    pathname === p || (pathname && pathname.startsWith(`${p}/`)),
  );
  if (isHidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open Bharosa chat"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-pill px-4 py-3 text-body-sm font-medium shadow-lift transition-all",
          open
            ? "bg-saathi-paper text-saathi-deep-green"
            : "bg-saathi-deep-green text-white hover:bg-saathi-deep-green-soft",
        )}
      >
        {open ? (
          <X className="h-4 w-4" />
        ) : (
          <>
            <MessageCircle className="h-4 w-4" />
            <span>{t("Bharosa से बात करें", "Chat with Bharosa")}</span>
          </>
        )}
      </button>
      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
