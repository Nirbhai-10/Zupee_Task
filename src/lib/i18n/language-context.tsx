"use client";

import * as React from "react";

export type AppLanguage = "hi" | "en";

type Ctx = {
  lang: AppLanguage;
  setLang: (next: AppLanguage) => void;
  toggle: () => void;
};

const LanguageContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "saathi-lang";
const STORAGE_EVENT = "saathi-lang-change";

function readLang(): AppLanguage {
  if (typeof window === "undefined") return "hi";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi") return saved;
  } catch {
    // Ignore.
  }
  return "hi";
}

/**
 * Read language via useSyncExternalStore so we don't trigger React's
 * "setState in effect" lint. The store is localStorage; we listen on
 * both the native `storage` event (cross-tab) and a custom in-tab event
 * so updates from the same tab also propagate.
 */
function useLangFromStore(): AppLanguage {
  const subscribe = React.useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", onChange);
    window.addEventListener(STORAGE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(STORAGE_EVENT, onChange);
    };
  }, []);
  return React.useSyncExternalStore(subscribe, readLang, () => "hi");
}

function writeLang(next: AppLanguage) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore.
  }
  window.dispatchEvent(new Event(STORAGE_EVENT));
  if (typeof document !== "undefined") {
    document.documentElement.lang = next === "hi" ? "hi" : "en";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useLangFromStore();

  const value = React.useMemo<Ctx>(
    () => ({
      lang,
      setLang: writeLang,
      toggle: () => writeLang(lang === "hi" ? "en" : "hi"),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "hi",
      setLang: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/** Hook returning a `t(hi, en)` function. Lightweight inline translator. */
export function useT() {
  const { lang } = useLanguage();
  return React.useCallback(
    (hi: string, en: string) => (lang === "hi" ? hi : en),
    [lang],
  );
}
