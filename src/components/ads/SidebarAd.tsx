import { AdSlot } from "@/components/ads/AdSlot";

interface SidebarAdProps {
  slot?: string;
}

export function SidebarAd({ slot = "sidebar" }: SidebarAdProps) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase text-content-muted tracking-wider block">
        Sponsored
      </span>
      <AdSlot slot={slot} format="rectangle" />
    </div>
  );
}
