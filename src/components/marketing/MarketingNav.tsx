import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { StatusPill } from "@/components/shared/StatusPill";
import { MarketingNavCenterLinks } from "@/components/marketing/MarketingNavCenterLinks";
import { MarketingCta } from "@/components/marketing/MarketingCta";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-saathi-paper-edge bg-saathi-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Wordmark className="text-h2" />
          <span className="hidden text-caption uppercase tracking-wider text-saathi-ink-quiet sm:inline">
            Bharosa
          </span>
        </Link>
        <MarketingNavCenterLinks />
        <div className="flex items-center gap-2">
          <StatusPill className="hidden lg:inline-flex" />
          <LanguageToggle />
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">
              <MarketingCta />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
