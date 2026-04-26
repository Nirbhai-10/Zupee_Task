"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCcw } from "lucide-react";
import { conversationStore } from "@/lib/chat/conversation-store";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n/language-context";

/**
 * Slim "Demo mode" banner shown at the top of the (app) layout. Visible
 * whenever the `bharosa_demo` cookie is present OR the URL carries
 * `?demo=1`. Reset button clears localStorage (chat + sim state) and
 * reloads.
 */
export function DemoBadge({ className }: { className?: string }) {
  const router = useRouter();
  const t = useT();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const fromCookie = document.cookie
      .split("; ")
      .some((part) => part.startsWith("bharosa_demo="));
    const fromQuery = new URL(window.location.href).searchParams.get("demo") === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(fromCookie || fromQuery);
  }, []);

  function reset() {
    try {
      conversationStore.clear();
      window.localStorage.removeItem("saathi-lang");
    } catch {
      // ignore
    }
    router.refresh();
  }

  if (!active) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-saathi-gold-line bg-saathi-gold-tint px-4 py-1.5 text-caption text-saathi-ink-soft",
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-saathi-gold" />
      <span className="font-medium text-saathi-ink">
        {t("Demo mode · आप Anjali के dashboard पर हैं", "Demo mode · viewing Anjali's dashboard")}
      </span>
      <button
        type="button"
        onClick={reset}
        className="ml-auto inline-flex items-center gap-1 rounded-pill border border-saathi-gold/30 bg-saathi-paper px-2.5 py-0.5 text-[11px] font-medium text-saathi-ink-soft transition-colors hover:bg-saathi-cream-deep"
      >
        <RefreshCcw className="h-3 w-3" />
        {t("रीसेट", "Reset")}
      </button>
    </div>
  );
}
