import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { T } from "@/components/shared/T";

type ZupeeAttributionProps = {
  variant?: "footer" | "header" | "inline";
  className?: string;
};

/**
 * Bharosa is a thesis-style submission for Zupee's AI-native product
 * brief. Render this in the footer + the dedicated /for-zupee page so
 * the attribution is unambiguous.
 *
 * Uses the supplied Zupee PNG in /public/brand/zupee.png.
 */
export function ZupeeAttribution({ variant = "footer", className }: ZupeeAttributionProps) {
  const isCompact = variant !== "footer";
  const showCopy = variant !== "header";
  return (
    <Link
      href="/for-zupee"
      className={cn(
        "group inline-flex items-center gap-2 rounded-pill border border-saathi-paper-edge bg-saathi-paper transition-colors hover:bg-saathi-cream-deep",
        isCompact ? "px-2.5 py-1.5" : "px-3 py-1.5",
        className,
      )}
      aria-label="Submission for Zupee — read the thesis"
    >
      <Image
        src="/brand/zupee.png"
        alt="Zupee"
        width={isCompact ? 66 : 78}
        height={isCompact ? 24 : 28}
        className="h-auto w-auto"
        priority
      />
      {showCopy ? (
        <span className="text-caption text-saathi-ink-soft">
          <T hi="Submission · Zupee Theme 3" en="Submission · Zupee Theme 3" />
        </span>
      ) : null}
    </Link>
  );
}
