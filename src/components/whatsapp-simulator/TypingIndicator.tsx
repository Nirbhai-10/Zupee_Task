"use client";

/**
 * Three-dot typing indicator. Lives where the next inbound message will
 * arrive, so the eye can already track it. Honors prefers-reduced-motion
 * (the dots stop pulsing but stay visible).
 */
export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-soft">
      <span className="block h-2 w-2 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:0ms]" />
      <span className="block h-2 w-2 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:150ms]" />
      <span className="block h-2 w-2 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:300ms]" />
    </div>
  );
}
