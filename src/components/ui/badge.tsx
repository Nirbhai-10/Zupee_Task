import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-caption font-medium uppercase tracking-wide",
  {
    variants: {
      tone: {
        scam:
          "bg-saathi-danger-tint text-saathi-danger border border-saathi-danger/20",
        suspicious:
          "bg-saathi-warning-tint text-saathi-warning border border-saathi-warning/30",
        legit:
          "bg-saathi-success-tint text-saathi-success border border-saathi-success/20",
        unclear:
          "bg-saathi-cream-deep text-saathi-ink-soft border border-saathi-paper-edge",
        gold:
          "bg-saathi-gold-tint text-saathi-gold border border-saathi-gold-line",
        green:
          "bg-saathi-deep-green-tint text-saathi-deep-green border border-saathi-deep-green-line",
        muted:
          "bg-saathi-paper text-saathi-ink-soft border border-saathi-paper-edge",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
