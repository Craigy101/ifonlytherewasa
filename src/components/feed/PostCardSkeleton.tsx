import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="p-4">
      {/* Author row */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-24 h-3 rounded" />
      </div>

      {/* Title */}
      <Skeleton className="w-3/4 h-5 mt-3 rounded" />

      {/* Body */}
      <Skeleton className="w-full h-3 mt-2 rounded" />
      <Skeleton className="w-2/3 h-3 mt-1 rounded" />

      {/* Badges */}
      <div className="flex gap-2 mt-3">
        <Skeleton className="w-16 h-5 rounded" />
        <Skeleton className="w-16 h-5 rounded" />
      </div>

      {/* Stats */}
      <Skeleton className="w-32 h-3 mt-3 rounded" />
    </Card>
  );
}
