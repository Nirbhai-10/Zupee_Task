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

      {/* APK submission banner — deliberately loud.
          Solid Zupee yellow background, indigo text, oversized download
          pill with an animated bouncing arrow + a soft pulsing halo.
          Designed so a Zupee evaluator landing on the page cannot miss
          the download. Bharosa.apk lives in /public, served directly by
          Vercel with the .apk MIME type so click = native Save dialog. */}
      <a
        href="/Bharosa.apk"
        download="Bharosa.apk"
        className="group relative block w-full overflow-hidden border-b-2 border-zupee-indigo/40 bg-zupee-yellow transition-colors hover:bg-zupee-yellow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zupee-indigo/60"
      >
        {/* Subtle indigo shimmer sweep across the banner, slowed-down */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-zupee-indigo/15 to-transparent opacity-70 animate-[shimmer_4s_ease-in-out_infinite]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
          <span className="inline-flex min-w-0 items-center gap-2.5 text-zupee-indigo">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zupee-indigo text-zupee-yellow shadow-card">
              <Smartphone className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold uppercase tracking-wide sm:text-[14px]">
                Bharosa Android APK · Zupee Submission
              </span>
              <span className="text-[11px] font-medium text-zupee-indigo/85 sm:text-[12px]">
                Same Bharosa, native shell — install on any Android phone in 30 seconds.
              </span>
            </span>
          </span>
          <span className="relative inline-flex shrink-0">
            {/* Pulsing halo behind the button */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-ping rounded-pill bg-zupee-indigo/35"
            />
            <span className="relative inline-flex items-center gap-2 rounded-pill bg-zupee-indigo px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-lift transition-transform group-hover:-translate-y-0.5 sm:text-[13px]">
              <Download className="h-4 w-4 animate-bounce" aria-hidden />
              <span>Download .APK&nbsp;·&nbsp;3.6 MB</span>
            </span>
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
