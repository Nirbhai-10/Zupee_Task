import { Logo } from "@/components/brand/Logo";

/**
 * Legacy compatibility wrapper. Brand surfaces should still render the
 * supplied image logo rather than falling back to a text-only wordmark.
 */
export function Wordmark({ className }: { className?: string }) {
  return <Logo variant="lockup" size={36} className={className} />;
}
