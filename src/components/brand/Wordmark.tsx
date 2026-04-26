import { cn } from "@/lib/utils/cn";

/**
 * Legacy text-only wordmark. Prefer <Logo variant="lockup" /> for new
 * surfaces. Kept for backwards compatibility with components mounted
 * before Phase 2.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      lang="hi"
      data-script="devanagari"
      className={cn(
        "font-deva font-bold tracking-tight text-saathi-deep-green",
        className,
      )}
    >
      भरोसा
    </span>
  );
}
