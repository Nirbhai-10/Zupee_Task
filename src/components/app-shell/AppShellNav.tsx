"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarRange,
  Cog,
  Home as HomeIcon,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: { hi: string; en: string };
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: { hi: "घर", en: "Home" }, icon: HomeIcon },
  { href: "/family", label: { hi: "परिवार", en: "Family" }, icon: Users },
  { href: "/goals", label: { hi: "लक्ष्य", en: "Goals" }, icon: Target },
  { href: "/defenses", label: { hi: "सुरक्षा", en: "Defenses" }, icon: ShieldCheck },
  { href: "/investments", label: { hi: "निवेश", en: "Investments" }, icon: Wallet },
  { href: "/timeline", label: { hi: "टाइमलाइन", en: "Timeline" }, icon: CalendarRange },
  { href: "/conversations", label: { hi: "बातचीत", en: "Chat" }, icon: MessageCircle },
  { href: "/settings", label: { hi: "सेटिंग्स", en: "Settings" }, icon: Cog },
];

type AppShellNavProps = {
  statusPill?: React.ReactNode;
  languageToggle?: React.ReactNode;
};

export function AppShellNav({ statusPill, languageToggle }: AppShellNavProps) {
  const pathname = usePathname();
  const t = useT();
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-saathi-paper-edge bg-saathi-paper md:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-saathi-paper-edge px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Wordmark className="text-h2" />
            <span className="text-caption uppercase tracking-wider text-saathi-ink-quiet">
              Bharosa
            </span>
          </Link>
          {languageToggle}
        </div>

        {statusPill ? (
          <div className="border-b border-saathi-paper-edge px-3 py-2">{statusPill}</div>
        ) : null}

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-card-sm px-3 py-2 text-body-sm transition-colors",
                      isActive
                        ? "bg-saathi-deep-green-tint text-saathi-deep-green"
                        : "text-saathi-ink-soft hover:bg-saathi-cream-deep hover:text-saathi-ink",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-saathi-deep-green" : "text-saathi-ink-quiet group-hover:text-saathi-ink-soft",
                      )}
                    />
                    <span className="flex-1 font-medium">{t(item.label.hi, item.label.en)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-saathi-paper-edge pt-4">
            <Link
              href="/demo/simulator"
              className="group flex items-center gap-3 rounded-card-sm bg-saathi-deep-green px-3 py-2.5 text-body-sm text-white transition-colors hover:bg-saathi-deep-green-soft"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="flex-1 font-medium">{t("लाइव सिमुलेटर", "Live simulator")}</span>
              <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </nav>

        <div className="border-t border-saathi-paper-edge px-4 py-3 text-caption text-saathi-ink-quiet">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-saathi-deep-green text-[10px] font-semibold text-white">
              AS
            </span>
            <div className="min-w-0">
              <div className="truncate text-body-sm font-medium text-saathi-ink">
                Anjali Sharma
              </div>
              <div className="truncate text-[11px] text-saathi-ink-quiet">
                {t("लखनऊ · हिन्दी", "Lucknow · Hindi-first")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AppShellMobileBar() {
  const pathname = usePathname();
  const t = useT();
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-saathi-paper-edge bg-saathi-paper md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium",
                  isActive ? "text-saathi-deep-green" : "text-saathi-ink-quiet",
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.label.hi, item.label.en)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
