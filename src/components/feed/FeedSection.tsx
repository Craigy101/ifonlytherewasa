"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FeedControls } from "./FeedControls";
import { FeedList } from "./FeedList";
import type { FeedFilters } from "@/lib/feed-filters";
import type { PostCardData } from "./PostCard";

interface FeedSectionProps {
  initialPosts: PostCardData[];
  initialFilters: FeedFilters;
  categorySlug?: string;
}

export function FeedSection({
  initialPosts,
  initialFilters,
  categorySlug,
}: FeedSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [supabase] = useState(() => createClient());

  // Local filter state — controls update immediately on user interaction
  const [filters, setFilters] = useState<FeedFilters>(initialFilters);

  // Sync local filters when server props change (browser back/forward)
  const initialFiltersKey = JSON.stringify(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiltersKey]);

  const handleFilterChange = (next: FeedFilters) => {
    // Update controls immediately for responsive UI
    setFilters(next);

    // Build URL search params
    const params = new URLSearchParams();
    if (next.sort !== "popular") params.set("sort", next.sort);
    if (next.minInterested > 0)
      params.set("min_interested", String(next.minInterested));
    if (next.minSpend > 0) params.set("min_spend", String(next.minSpend));
    if (next.productType) params.set("product_type", next.productType);

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;

    // Trigger server re-render — the page.tsx server component fetches
    // new data based on updated searchParams and passes fresh initialPosts
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  };

  // Key for FeedList — forces remount when server responds with new data
  // so its internal state (posts, page, hasMore) resets correctly
  const feedKey = initialFiltersKey;

  return (
    <>
      <FeedControls filters={filters} onFilterChange={handleFilterChange} />
      <div
        className="transition-opacity duration-150"
        style={{ opacity: isPending ? 0.5 : 1 }}
      >
        <FeedList
          key={feedKey}
          supabase={supabase}
          initialPosts={initialPosts}
          categorySlug={categorySlug}
          sort={filters.sort}
          minInterested={filters.minInterested}
          minSpend={filters.minSpend}
          productType={filters.productType}
        />
      </div>
    </>
  );
}
