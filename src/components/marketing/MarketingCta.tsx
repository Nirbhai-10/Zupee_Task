"use client";

import { useT } from "@/lib/i18n/language-context";

export function MarketingCta() {
  const t = useT();
  const label = t("WhatsApp पर खोलें", "Open simulator");
  return (
    <>
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </>
  );
}
