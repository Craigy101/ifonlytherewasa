import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rectangle";
}

const variantClasses = {
  text: "h-4 w-full rounded",
  circle: "rounded-full",
  rectangle: "rounded-lg",
} as const;

function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-hover",
        variantClasses[variant],
        className
      )}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
