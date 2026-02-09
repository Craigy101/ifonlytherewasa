import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom";
}

const positionClasses = {
  top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
  bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
} as const;

function Tooltip({ children, content, position = "top" }: TooltipProps) {
  return (
    <div className="relative inline-block group">
      {children}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 bg-surface-overlay border border-surface-border rounded-md px-2 py-1 text-xs text-content whitespace-nowrap pointer-events-none",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
          positionClasses[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}

export { Tooltip };
export type { TooltipProps };
