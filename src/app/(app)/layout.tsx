import { AppShellNav, AppShellMobileBar } from "@/components/app-shell/AppShellNav";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { StatusPill } from "@/components/shared/StatusPill";

/**
 * Shared shell for the authenticated `(app)` route group. Sticky 260px
 * sidebar on desktop with brand, language toggle, status pill, nav,
 * and a pinned "Live simulator" CTA. Mobile: 5-tab bottom bar.
 *
 * Server component — renders the StatusPill server-side (it reads env
 * vars), then hands it to the client AppShellNav as a slot.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-saathi-cream">
      <AppShellNav
        statusPill={<StatusPill />}
        languageToggle={<LanguageToggle />}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">{children}</div>
      <AppShellMobileBar />
    </div>
  );
}
