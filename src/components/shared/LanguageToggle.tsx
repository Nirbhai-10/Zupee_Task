"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-saathi-paper-edge bg-saathi-paper px-2.5 py-1.5 text-caption font-medium text-saathi-ink transition-colors hover:bg-saathi-cream-deep",
        className,
      )}
    >
      <Languages className="h-3.5 w-3.5 text-saathi-ink-quiet" />
      <span className={cn("font-semibold", lang === "hi" ? "text-saathi-deep-green" : "text-saathi-ink-quiet")}>
        <span lang="hi" className="font-deva">हिं</span>
      </span>
      <span className="text-saathi-ink-quiet">/</span>
      <span className={cn("font-semibold", lang === "en" ? "text-saathi-deep-green" : "text-saathi-ink-quiet")}>
        EN
      </span>
    </button>
  );
}
