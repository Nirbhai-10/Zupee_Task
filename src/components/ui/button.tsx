import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill",
    "text-body-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-deep-green/30 focus-visible:ring-offset-2 focus-visible:ring-offset-saathi-cream",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-saathi-deep-green text-white shadow-soft hover:bg-saathi-deep-green-soft active:bg-saathi-deep-green",
        secondary:
          "bg-saathi-paper text-saathi-ink border border-saathi-paper-edge hover:bg-saathi-cream-deep",
        ghost:
          "bg-transparent text-saathi-deep-green hover:bg-saathi-deep-green-tint",
        gold:
          "bg-saathi-gold text-white shadow-soft hover:bg-saathi-gold-soft",
        danger:
          "bg-saathi-danger text-white shadow-soft hover:bg-saathi-danger/90",
        outline:
          "border border-saathi-deep-green text-saathi-deep-green hover:bg-saathi-deep-green-tint",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-13 px-8 text-body",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
