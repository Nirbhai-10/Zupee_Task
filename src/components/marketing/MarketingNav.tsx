import Link from "next/link";
import { Download, MessageCircle, Smartphone } from "lucide-react";
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

      {/* Submission banner — slim, sticky, single line.
          Tells a Zupee evaluator at first glance that the same Bharosa
          ships as a downloadable APK alongside the live web app, and
          gives them a one-click download. The .apk file lives at
          /public/Bharosa.apk and is served directly by Vercel. */}
      <a
        href="/Bharosa.apk"
        download="Bharosa.apk"
        className="group block w-full border-b border-zupee-indigo/15 bg-zupee-yellow-tint/80 transition-colors hover:bg-zupee-yellow/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zupee-indigo/40"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-6">
          <span className="inline-flex min-w-0 items-center gap-2 text-[12px] font-medium text-zupee-indigo">
            <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              Submitted to Zupee as a downloadable APK — same Bharosa, native shell.
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-zupee-indigo px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition-transform group-hover:-translate-y-px">
            <Download className="h-3 w-3" aria-hidden />
            <span>Download Bharosa.apk · 3.6 MB</span>
          </span>
        </div>
      </a>

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
