import { AppShellNav, AppShellMobileBar } from "@/components/app-shell/AppShellNav";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { StatusPill } from "@/components/shared/StatusPill";
import { DemoBadge } from "@/components/app-shell/DemoBadge";

/**
 * Shared shell for the authenticated `(app)` route group. Sticky 260px
 * sidebar on desktop, mobile bottom bar, demo banner across the top.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-saathi-cream">
      <AppShellNav
        statusPill={<StatusPill />}
        languageToggle={<LanguageToggle />}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <DemoBadge />
        {children}
      </div>
      <AppShellMobileBar />
    </div>
  );
}
