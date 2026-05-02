"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/language-context";

// Two destinations only. The defence + investments anchors were noise
// (a visitor can scroll); live demo and the thesis page are the two
// links a Zupee reviewer actually clicks. Less to navigate, less to
// miss.
const ROUTES = [
  { href: "/demo/simulator", hi: "लाइव डेमो", en: "Live demo" },
  { href: "/for-zupee", hi: "Thesis", en: "Thesis" },
];

export function MarketingNavCenterLinks() {
  const t = useT();
  return (
    <div className="hidden min-w-0 items-center justify-center gap-1 text-body-sm md:flex">
      {ROUTES.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          className="whitespace-nowrap rounded-pill px-3 py-2 font-medium text-saathi-ink-soft transition-colors hover:bg-saathi-deep-green-tint hover:text-saathi-deep-green"
        >
          {t(r.hi, r.en)}
        </Link>
      ))}
    </div>
  );
}
