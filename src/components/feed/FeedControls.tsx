"use client";

import { cn } from "@/lib/utils/cn";
import type { FeedSort, FeedFilters, ProductType } from "@/lib/feed-filters";
import { PRODUCT_TYPE_LABELS } from "@/lib/feed-filters";

export type { FeedSort, FeedFilters };
export { parseFeedFilters } from "@/lib/feed-filters";

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "recent", label: "Recent" },
];

const MIN_INTERESTED_OPTIONS = [0, 3, 5, 10, 25];
const MIN_SPEND_OPTIONS = [0, 5, 10, 25, 50, 100];

const selectClasses = cn(
  "bg-surface-raised border border-surface-border rounded-lg",
  "px-2.5 py-1.5 text-xs text-content-muted cursor-pointer",
  "focus:outline-none focus:ring-2 focus:ring-accent/50",
  "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_6px_center] bg-no-repeat pr-6"
);

interface FeedControlsProps {
  filters: FeedFilters;
  onFilterChange: (filters: FeedFilters) => void;
}

const DEFAULT_FILTERS: FeedFilters = {
  sort: "popular",
  minInterested: 0,
  minSpend: 0,
  productType: "",
};

export function FeedControls({ filters, onFilterChange }: FeedControlsProps) {
  const update = (patch: Partial<FeedFilters>) => {
    onFilterChange({ ...filters, ...patch });
  };

  const hasActiveFilters =
    filters.sort !== "popular" ||
    filters.minInterested > 0 ||
    filters.minSpend > 0 ||
    filters.productType !== "";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Sort toggle */}
      <div className="flex rounded-lg border border-surface-border overflow-hidden">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update({ sort: opt.value })}
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

      {/* Solution type */}
      <select
        value={filters.productType}
        onChange={(e) =>
          update({ productType: e.target.value as ProductType | "" })
        }
        className={cn(
          selectClasses,
          filters.productType && "text-content border-accent/40"
        )}
      >
        <option value="">Type: All</option>
        {(Object.entries(PRODUCT_TYPE_LABELS) as [ProductType, string][]).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          )
        )}
      </select>

      {/* Min interested */}
      <select
        value={filters.minInterested}
        onChange={(e) =>
          update({ minInterested: parseInt(e.target.value, 10) })
        }
        className={cn(
          selectClasses,
          filters.minInterested > 0 && "text-content border-accent/40"
        )}
      >
        <option value="0">Interest: All</option>
        {MIN_INTERESTED_OPTIONS.filter((v) => v > 0).map((v) => (
          <option key={v} value={v}>
            {v}+
          </option>
        ))}
      </select>

      {/* Min weekly spend */}
      <select
        value={filters.minSpend}
        onChange={(e) =>
          update({ minSpend: parseInt(e.target.value, 10) })
        }
        className={cn(
          selectClasses,
          filters.minSpend > 0 && "text-content border-accent/40"
        )}
      >
        <option value="0">$/wk: All</option>
        {MIN_SPEND_OPTIONS.filter((v) => v > 0).map((v) => (
          <option key={v} value={v}>
            ${v}+
          </option>
        ))}
      </select>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => onFilterChange(DEFAULT_FILTERS)}
          className="px-2.5 py-1.5 text-xs text-content-muted hover:text-content transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
