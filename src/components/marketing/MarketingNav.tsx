import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { MarketingNavCenterLinks } from "@/components/marketing/MarketingNavCenterLinks";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { ZupeeAttribution } from "@/components/brand/ZupeeAttribution";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-saathi-paper-edge bg-saathi-cream/95 backdrop-blur-md">
      {/* Slim Zupee-yellow → indigo accent stripe — quiet partner mark
          that runs the full width of the nav at all breakpoints. */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-gradient-to-r from-zupee-yellow via-zupee-yellow to-zupee-indigo"
      />
      <div className="mx-auto grid min-h-16 max-w-6xl grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:grid-cols-[auto_1fr_auto]">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-deep-green/30"
          aria-label="Bharosa home"
        >
          <Logo size={38} />
        </Link>
        <MarketingNavCenterLinks />
        <div className="ml-auto flex min-w-0 items-center justify-end gap-2.5">
          <ZupeeAttribution variant="header" className="hidden md:inline-flex" />
          <LanguageToggle className="inline-flex" />
          <Button asChild variant="primary" size="sm" className="shrink-0 px-3.5 sm:px-4">
            <Link href="/demo/simulator">
              <MessageCircle className="h-4 w-4" />
              <MarketingCta />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
