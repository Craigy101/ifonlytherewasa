"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const formatStyles: Record<string, string> = {
  horizontal: "w-full h-[90px]",
  vertical: "w-[160px] h-[600px]",
  rectangle: "w-[300px] h-[250px]",
};

export function AdSlot({
  slot,
  format = "horizontal",
  className,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;

    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // Ad blocker or adsbygoogle not loaded
    }
  }, []);

  const isInline = format !== "horizontal";

  return (
    <div className={cn("space-y-1", className)}>
      <span className="text-[10px] text-content-muted uppercase tracking-wider mb-1 block">
        Sponsored
      </span>
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-surface-raised border border-surface-border flex items-center justify-center",
          formatStyles[format]
        )}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={
            isInline
              ? {
                  display: "inline-block",
                  width: format === "vertical" ? 160 : 300,
                  height: format === "vertical" ? 600 : 250,
                }
              : { display: "block" }
          }
          data-ad-slot={slot}
        />
        <noscript>
          <span className="text-xs text-content-muted">Ad</span>
        </noscript>
      </div>
    </div>
  );
}
