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
 * Logo is a placeholder SVG approximation in /public/brand/zupee.svg —
 * swap it for Zupee's official PNG when handed off.
 */
export function ZupeeAttribution({ variant = "footer", className }: ZupeeAttributionProps) {
  const isCompact = variant !== "footer";
  return (
    <Link
      href="/for-zupee"
      className={cn(
        "group inline-flex items-center gap-2 rounded-pill border border-saathi-paper-edge bg-saathi-paper px-3 py-1.5 transition-colors hover:bg-saathi-cream-deep",
        className,
      )}
      aria-label="Submission for Zupee — read the thesis"
    >
      <Image
        src="/brand/zupee.svg"
        alt="Zupee"
        width={isCompact ? 56 : 72}
        height={isCompact ? 18 : 24}
        priority
      />
      <span className="text-caption text-saathi-ink-soft">
        <T hi="Submission · Zupee Theme 3" en="Submission · Zupee Theme 3" />
      </span>
    </Link>
  );
}
