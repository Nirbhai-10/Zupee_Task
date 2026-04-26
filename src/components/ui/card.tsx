import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-card border transition-shadow",
  {
    variants: {
      tone: {
        paper:
          "bg-saathi-paper border-saathi-paper-edge text-saathi-ink shadow-soft hover:shadow-card",
        cream:
          "bg-saathi-cream-deep border-saathi-paper-edge text-saathi-ink",
        green:
          "bg-saathi-deep-green border-saathi-deep-green-soft text-white",
        gold:
          "bg-saathi-gold-tint border-saathi-gold-line text-saathi-ink",
        danger:
          "bg-saathi-danger-tint border-saathi-danger/30 text-saathi-ink",
      },
      padding: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: { tone: "paper", padding: "md" },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ tone, padding, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-h3 font-semibold tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-saathi-ink-soft", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex items-center", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
