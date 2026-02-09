import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: "default" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
} as const;

function Badge({
  children,
  color,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full font-medium";

  const variantClasses =
    variant === "outline"
      ? "border border-surface-border text-content-secondary"
      : "bg-surface-hover text-content-secondary";

  if (color) {
    return (
      <span
        className={cn(baseClasses, sizeClasses[size], className)}
        style={{
          backgroundColor: `${color}33`,
          color: color,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(baseClasses, variantClasses, sizeClasses[size], className)}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
