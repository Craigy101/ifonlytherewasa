import { cn } from "@/lib/utils/cn";
import { AdSlot } from "@/components/ads/AdSlot";

interface FeedAdProps {
  slot?: string;
}

export function FeedAd({ slot = "feed" }: FeedAdProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border/50 bg-surface-raised p-4"
      )}
    >
      <span className="text-[10px] uppercase text-content-muted tracking-wider block mb-2">
        Sponsored
      </span>
      <AdSlot slot={slot} format="horizontal" />
    </div>
  );
}
