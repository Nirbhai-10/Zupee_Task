import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-saathi-paper-edge bg-saathi-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Wordmark className="text-h2" />
          <span className="hidden text-caption uppercase tracking-wider text-saathi-ink-quiet sm:inline">
            Saathi
          </span>
        </Link>
        <div className="hidden flex-1 justify-center gap-6 text-body-sm md:flex">
          <Link href="#defense" className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green">
            Defense
          </Link>
          <Link href="#investments" className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green">
            Investments
          </Link>
          <Link href="/demo/simulator" className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green">
            Live demo
          </Link>
          <Link href="/family" className="text-saathi-ink-soft transition-colors hover:text-saathi-deep-green">
            Family
          </Link>
        </div>
        <div className="flex flex-1 justify-end gap-2 md:flex-none">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/api/health">Health</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">WhatsApp पर खोलें</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
