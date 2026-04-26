import { cn } from "@/lib/utils/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      lang="hi"
      className={cn(
        "font-deva font-bold tracking-tight text-saathi-deep-green",
        className,
      )}
    >
      भरोसा
    </span>
  );
}
