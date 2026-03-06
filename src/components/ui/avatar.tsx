import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
};

function getInitialColor(text: string): string {
  const colors = [
    "bg-accent/20 text-accent",
    "bg-success/20 text-success",
    "bg-warning/20 text-warning",
    "bg-info/20 text-info",
    "bg-error/20 text-error",
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt = "",
  fallback = "?",
  size = "md",
  shape = "circle",
  className,
}: AvatarProps) {
  const initials = fallback
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden font-semibold shrink-0",
        sizeStyles[size],
        shape === "circle" ? "rounded-full" : "rounded-[8px]",
        !src && getInitialColor(fallback),
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
