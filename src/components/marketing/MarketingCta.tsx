"use client";

import { useT } from "@/lib/i18n/language-context";

export function MarketingCta() {
  const t = useT();
  return <span>{t("WhatsApp पर खोलें", "Open simulator")}</span>;
}
