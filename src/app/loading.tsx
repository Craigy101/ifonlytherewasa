import { Skeleton } from "@/components/ui";

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
      {/* Header: avatar + author info */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>

      {/* Title */}
      <Skeleton className="h-5 w-3/4 rounded mb-3" />

      {/* Body preview */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-5/6 rounded" />
      </div>

      {/* Category / tags */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Reaction bar */}
      <div className="flex items-center gap-4 pt-3 border-t border-surface-border">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}
