import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white font-bold shadow-md hover:bg-accent-light hover:shadow-lg active:bg-accent-dark transition-all duration-300 rounded-[10px]",
  secondary:
    "border border-border text-text-secondary hover:border-accent hover:text-accent rounded-[10px] transition-colors duration-300",
  ghost:
    "text-text-secondary hover:text-accent hover:bg-bg-card rounded-[10px] transition-colors duration-200",
  danger:
    "border border-error text-error hover:bg-error hover:text-white rounded-[10px] transition-colors duration-200",
  gold:
    "bg-[var(--color-gold)] text-[#0C1829] hover:bg-[var(--color-gold-light)] shadow-md hover:shadow-lg hover:shadow-[var(--color-gold)]/20 hover:-translate-y-0.5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-10 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
