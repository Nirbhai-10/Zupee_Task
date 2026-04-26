"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

type TProps = {
  hi: React.ReactNode;
  en: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

/**
 * Bilingual text component. Reads the current app language (`hi` | `en`)
 * from `<LanguageProvider/>` and renders the matching slot. Sets the
 * right `lang` attribute so the Indic font stack applies for Hindi.
 *
 * Usage: <T hi="हम सच बताते हैं।" en="We tell you the truth." />
 */
export function T({ hi, en, as: Tag = "span", className }: TProps) {
  const { lang } = useLanguage();
  const Component = Tag as React.ElementType;
  return (
    <Component
      lang={lang === "hi" ? "hi" : "en"}
      className={cn(lang === "hi" ? "font-deva" : "font-sans", className)}
    >
      {lang === "hi" ? hi : en}
    </Component>
  );
}
