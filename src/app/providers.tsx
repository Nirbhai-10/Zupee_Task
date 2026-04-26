"use client";

import { LanguageProvider } from "@/lib/i18n/language-context";

/**
 * Root client providers. Currently just language; add more (theme,
 * toast, query client) here as they land.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
