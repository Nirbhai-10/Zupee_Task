"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/language-context";

const SECTIONS = [
  { id: "defense", hi: "बचाव", en: "Defense" },
  { id: "investments", hi: "निवेश", en: "Investments" },
];

const ROUTES = [
  { href: "/demo/simulator", hi: "लाइव डेमो", en: "Live demo" },
  { href: "/family", hi: "परिवार", en: "Family" },
];

export function MarketingNavCenterLinks() {
  const t = useT();
  return (
    <div className="hidden flex-1 justify-center gap-6 text-body-sm md:flex">
      {SECTIONS.map((s) => (
        <Link
          key={s.id}
          href={`#${s.id}`}
          className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green"
        >
          {t(s.hi, s.en)}
        </Link>
      ))}
      {ROUTES.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green"
        >
          {t(r.hi, r.en)}
        </Link>
      ))}
    </div>
  );
}
