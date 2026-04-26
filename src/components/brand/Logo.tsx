import Image from "next/image";
import { cn } from "@/lib/utils/cn";

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
 * Bharosa brand mark. SVG placeholder lives at /public/brand/logo.svg —
 * replace with the PNG when the user delivers their final brand asset.
 *
 * The lockup variant pairs the mark with the देवनागरी "भरोसा" wordmark
 * (Mukta 700, deep-green). On mobile we collapse to mark-only via the
 * `hideWordmarkBelow` utility on consumers.
 */
export function Logo({ variant = "lockup", size = 32, tone = "default", className }: LogoProps) {
  const src = tone === "light" ? "/brand/logo-white.svg" : "/brand/logo.svg";
  const wordmarkClass = tone === "light" ? "text-saathi-cream" : "text-saathi-deep-green";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {variant !== "wordmark" ? (
        <Image
          src={src}
          alt="Bharosa"
          width={size}
          height={size}
          priority
          className="shrink-0"
        />
      ) : null}
      {variant !== "mark" ? (
        <span
          lang="hi"
          data-script="devanagari"
          className={cn(
            "font-deva font-bold leading-none tracking-tight",
            wordmarkClass,
          )}
          style={{ fontSize: `${Math.round(size * 0.72)}px` }}
        >
          भरोसा
        </span>
      ) : null}
    </span>
  );
}
