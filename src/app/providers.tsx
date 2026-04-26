"use client";

import { LanguageProvider } from "@/lib/i18n/language-context";
import { ChatWidget } from "@/components/landing/ChatWidget";

/**
 * Root client providers. The ChatWidget mounts here so the floating
 * button is available on every marketing surface; it self-hides on
 * authenticated routes via usePathname().
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <ChatWidget />
    </LanguageProvider>
  );
}
