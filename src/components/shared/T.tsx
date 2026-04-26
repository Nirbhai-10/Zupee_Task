"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { detectScript } from "@/lib/i18n/scripts";
import { cn } from "@/lib/utils/cn";

type TProps = {
  hi: React.ReactNode;
  en: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

/**
 * Bilingual text component. Reads the current app language from
 * <LanguageProvider/> and renders the matching slot. Sets `lang` and
 * `data-script` so globals.css applies the right typography metrics —
 * keeps EN ↔ HI switches visually consistent in weight and rhythm.
 *
 * Convention:
 *   - `en` should be **fully English** (no romanised Hindi like "Saathi"
 *     or "Maaji"). Brand names are the only exception.
 *   - `hi` is Hindi or Hinglish — fintech terms (SIP, FD, RBI, ULIP)
 *     stay in Latin script per Anjali's natural register.
 */
export function T({ hi, en, as: Tag = "span", className }: TProps) {
  const { lang } = useLanguage();
  const Component = Tag as React.ElementType;
  const isHi = lang === "hi";
  const text = isHi ? hi : en;
  // Detect script from string content where possible — the en slot may
  // contain inline ₹ or names, the hi slot may be Hinglish.
  const scriptHint =
    typeof text === "string" && text ? detectScript(text) : isHi ? "devanagari" : "latin";

  return (
    <Component
      lang={isHi ? "hi" : "en"}
      data-script={scriptHint}
      className={cn(scriptHint === "latin" ? "font-sans" : "font-deva", className)}
    >
      {text}
    </Component>
  );
}
