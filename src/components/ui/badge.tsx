import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "accent" | "gold" | "live" | "success" | "warning" | "error" | "info" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border text-text-secondary",
  accent: "border-accent text-accent bg-accent/10",
  gold: "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-muted)]",
  live: "border-red-500 text-red-500 bg-red-500/10",
  success: "border-success text-success bg-success/10",
  warning: "border-warning text-warning bg-warning/10",
  error: "border-error text-error bg-error/10",
  info: "border-info text-info bg-info/10",
  muted: "border-border text-text-muted bg-bg-secondary",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
