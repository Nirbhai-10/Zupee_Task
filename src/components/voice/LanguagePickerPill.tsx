"use client";

import * as React from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { LANGUAGE_META, SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils/cn";

type LanguagePickerPillProps = {
  value: LanguageCode;
  onChange: (next: LanguageCode) => void;
  className?: string;
};

/**
 * Compact language picker — endonym + ISO. Used by the chat composer's
 * mic to choose recording locale, by the playground's custom textarea,
 * and by the goal creator. Independent from the global hi/en UI toggle.
 */
export function LanguagePickerPill({ value, onChange, className }: LanguagePickerPillProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onClickAway(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClickAway);
    return () => window.removeEventListener("mousedown", onClickAway);
  }, [open]);

  const meta = LANGUAGE_META[value];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Voice input language"
        className="inline-flex items-center gap-1 rounded-pill border border-saathi-paper-edge bg-saathi-paper px-2.5 py-1 text-caption text-saathi-ink transition-colors hover:bg-saathi-cream-deep"
      >
        <Languages className="h-3 w-3 text-saathi-ink-quiet" />
        <span data-script={meta?.indic ? "devanagari" : "latin"} className={meta?.indic ? "font-deva" : "font-sans"}>
          {meta?.endonym ?? value}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">
          {meta?.iso ?? value}
        </span>
        <ChevronDown className={cn("h-3 w-3 text-saathi-ink-quiet transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-card-sm border border-saathi-paper-edge bg-saathi-paper shadow-lift">
          <ul className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((code) => {
              const m = LANGUAGE_META[code];
              const isActive = code === value;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-body-sm transition-colors",
                      isActive
                        ? "bg-saathi-deep-green-tint text-saathi-deep-green"
                        : "text-saathi-ink-soft hover:bg-saathi-cream-deep",
                    )}
                  >
                    <span
                      data-script={m.indic ? "devanagari" : "latin"}
                      className={cn("flex-1 truncate", m.indic ? "font-deva" : "font-sans")}
                    >
                      {m.endonym}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">
                      {m.iso}
                    </span>
                    {isActive ? <Check className="h-3 w-3 text-saathi-deep-green" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
