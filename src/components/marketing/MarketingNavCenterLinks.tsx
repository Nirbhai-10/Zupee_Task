"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/language-context";

const SECTIONS = [
  { href: "/#defense", hi: "बचाव", en: "Defense" },
  { href: "/#investments", hi: "निवेश", en: "Investments" },
];

const ROUTES = [
  { href: "/demo/simulator", hi: "लाइव डेमो", en: "Live demo" },
  { href: "/family", hi: "परिवार", en: "Family" },
  { href: "/for-zupee", hi: "Thesis", en: "Thesis" },
];

export function MarketingNavCenterLinks() {
  const t = useT();
  return (
    <div className="hidden min-w-0 items-center justify-center gap-2 text-body-sm lg:flex">
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="whitespace-nowrap rounded-pill px-3 py-2 text-saathi-ink-soft transition-colors hover:bg-saathi-deep-green-tint hover:text-saathi-deep-green"
        >
          {t(s.hi, s.en)}
        </Link>
      ))}
      {ROUTES.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          className="whitespace-nowrap rounded-pill px-3 py-2 text-saathi-ink-soft transition-colors hover:bg-saathi-deep-green-tint hover:text-saathi-deep-green"
        >
          {t(r.hi, r.en)}
        </Link>
      ))}
    </div>
  );
}
