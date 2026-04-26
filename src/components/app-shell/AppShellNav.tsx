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
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  hindiLabel: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", hindiLabel: "घर", icon: HomeIcon },
  { href: "/family", label: "Family", hindiLabel: "परिवार", icon: Users },
  { href: "/goals", label: "Goals", hindiLabel: "लक्ष्य", icon: Target },
  { href: "/defenses", label: "Defenses", hindiLabel: "सुरक्षा", icon: ShieldCheck },
  { href: "/investments", label: "Investments", hindiLabel: "निवेश", icon: Wallet },
  { href: "/timeline", label: "Timeline", hindiLabel: "टाइमलाइन", icon: CalendarRange },
  { href: "/conversations", label: "Conversations", hindiLabel: "बातचीत", icon: MessageCircle },
  { href: "/settings", label: "Settings", hindiLabel: "सेटिंग्स", icon: Cog },
];

export function AppShellNav() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-saathi-paper-edge bg-saathi-paper md:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex items-center gap-2 border-b border-saathi-paper-edge px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Wordmark className="text-h2" />
            <span className="text-caption uppercase tracking-wider text-saathi-ink-quiet">
              Saathi
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span lang="hi" className="font-deva text-caption text-saathi-ink-quiet">
                      {item.hindiLabel}
                    </span>
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
              <span className="flex-1 font-medium">Live simulator</span>
              <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </nav>

        <div className="border-t border-saathi-paper-edge px-5 py-3 text-caption text-saathi-ink-quiet">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-saathi-deep-green text-[10px] font-semibold text-white">
              AS
            </span>
            <div className="min-w-0">
              <div className="truncate text-body-sm font-medium text-saathi-ink">
                Anjali Sharma
              </div>
              <div className="truncate text-[11px] text-saathi-ink-quiet">
                Lucknow · हिन्दी
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
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
