import { AppShellNav, AppShellMobileBar } from "@/components/app-shell/AppShellNav";

/**
 * Shared shell for the authenticated `(app)` route group. Adds a sticky
 * left sidebar on desktop and a 5-tab bottom bar on mobile so navigation
 * is consistent across /home, /family, /goals, /defenses, /investments,
 * /timeline, /conversations, /settings.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-saathi-cream">
      <AppShellNav />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">{children}</div>
      <AppShellMobileBar />
    </div>
  );
}
