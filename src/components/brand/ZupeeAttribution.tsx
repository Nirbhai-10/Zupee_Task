import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { T } from "@/components/shared/T";

type ZupeeAttributionProps = {
  variant?: "footer" | "header" | "inline";
  className?: string;
};

/**
 * Zupee co-mark for Bharosa. Renders the Zupee logo + a short theme line
 * ("AI × Investments · for Bharat"). Rendered in the marketing nav,
 * footer, and the dedicated /for-zupee page so the partnership is
 * unambiguous without naming any submission round.
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
        // Zupee yellow tint background, indigo border + label.
        "group inline-flex items-center gap-2 rounded-pill border border-zupee-indigo/20 bg-zupee-yellow-tint transition-colors hover:border-zupee-indigo/35 hover:bg-zupee-yellow-soft/40",
        isCompact ? "px-2.5 py-1.5" : "px-3 py-1.5",
        className,
      )}
      aria-label="For Zupee — read the thesis"
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
        <span className="text-caption font-semibold text-zupee-indigo">
          <T hi="AI × निवेश · Bharat के लिए" en="AI × Investments · for Bharat" />
        </span>
      ) : null}
    </Link>
  );
}
