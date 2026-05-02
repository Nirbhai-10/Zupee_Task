import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const BHAROSA_MARK_SRC = "/brand/bharosa-mark.png";

type LogoProps = {
  /** Mark only, mark+wordmark, wordmark only. */
  variant?: "mark" | "lockup" | "wordmark";
  /** Pixel size of the mark. The wordmark scales with it. */
  size?: number;
  /** White/cream variant for use over dark surfaces. */
  tone?: "default" | "light";
  className?: string;
};

/**
 * Primary Bharosa brand mark using a cropped web asset from the supplied PNG.
 * The lockup keeps a readable text label beside the square mark so the
 * detailed logo remains crisp in compact navigation areas.
 */
export function Logo({ variant = "lockup", size = 32, tone = "default", className }: LogoProps) {
  const wordmarkClass = tone === "light" ? "text-saathi-cream" : "text-saathi-deep-green";
  const tileClass =
    tone === "light"
      ? "border-white/20 bg-black/20 shadow-soft"
      : "border-saathi-paper-edge bg-saathi-cream-deep shadow-soft";
  const wordmarkSize = Math.max(18, Math.round(size * 0.58));

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      {variant !== "wordmark" ? (
        <span
          className={cn(
            "inline-flex shrink-0 overflow-hidden rounded-card-sm border",
            tileClass,
          )}
          style={{ width: size, height: size }}
        >
          <Image
            src={BHAROSA_MARK_SRC}
            alt={variant === "mark" ? "Bharosa" : ""}
            width={size}
            height={size}
            priority
            sizes={`${size}px`}
            className="h-full w-full object-cover"
          />
        </span>
      ) : null}
      {variant !== "mark" ? (
        <span
          data-logo-text
          className={cn(
            "min-w-0 truncate font-semibold leading-none",
            wordmarkClass,
          )}
          style={{ fontSize: `${wordmarkSize}px` }}
        >
          Bharosa
        </span>
      ) : null}
    </span>
  );
}
