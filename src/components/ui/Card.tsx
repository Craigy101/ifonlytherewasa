import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-raised border border-surface-border rounded-xl overflow-hidden",
        hover && "hover:bg-surface-hover transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
