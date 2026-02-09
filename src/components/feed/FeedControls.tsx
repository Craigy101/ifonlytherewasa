"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export type FeedSort = "popular" | "recent";

export interface FeedFilters {
  sort: FeedSort;
  minInterested: number;
  minSpend: number;
}

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "recent", label: "Most Recent" },
];

const MIN_INTERESTED_OPTIONS = [0, 3, 5, 10, 25];
const MIN_SPEND_OPTIONS = [0, 5, 10, 25, 50, 100];

export function parseFeedFilters(searchParams: Record<string, string | string[] | undefined>): FeedFilters {
  const sort = (searchParams.sort === "recent" ? "recent" : "popular") as FeedSort;
  const minInterested = Math.max(0, parseInt(String(searchParams.min_interested ?? "0"), 10) || 0);
  const minSpend = Math.max(0, parseInt(String(searchParams.min_spend ?? "0"), 10) || 0);
  return { sort, minInterested, minSpend };
}

export function FeedControls({ filters }: { filters: FeedFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "0" || value === "popular") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Sort toggle */}
      <div className="flex rounded-lg border border-surface-border overflow-hidden">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("sort", opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              filters.sort === opt.value
                ? "bg-accent text-surface"
                : "bg-surface-raised text-content-muted hover:text-content"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Min interested dropdown */}
      <select
        value={filters.minInterested}
        onChange={(e) => updateParam("min_interested", e.target.value)}
        className={cn(
          "bg-surface-raised border border-surface-border rounded-lg",
          "px-2.5 py-1.5 text-xs text-content-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          filters.minInterested > 0 && "text-content border-accent/40"
        )}
      >
        <option value="0">Min interested: Any</option>
        {MIN_INTERESTED_OPTIONS.filter((v) => v > 0).map((v) => (
          <option key={v} value={v}>
            Min interested: {v}+
          </option>
        ))}
      </select>

      {/* Min weekly spend dropdown */}
      <select
        value={filters.minSpend}
        onChange={(e) => updateParam("min_spend", e.target.value)}
        className={cn(
          "bg-surface-raised border border-surface-border rounded-lg",
          "px-2.5 py-1.5 text-xs text-content-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          filters.minSpend > 0 && "text-content border-accent/40"
        )}
      >
        <option value="0">Min $/wk: Any</option>
        {MIN_SPEND_OPTIONS.filter((v) => v > 0).map((v) => (
          <option key={v} value={v}>
            Min $/wk: ${v}+
          </option>
        ))}
      </select>
    </div>
  );
}
