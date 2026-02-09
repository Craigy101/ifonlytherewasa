"use client";

import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui";

interface SortOption {
  label: string;
  value: string;
}

const SORT_OPTIONS: SortOption[] = [
  { label: "Popular", value: "popularity_score" },
  { label: "Newest", value: "created_at" },
  { label: "Most Discussed", value: "comment_count" },
];

interface SortSelectorProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label ?? "Popular";

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <span>{currentLabel}</span>
          <svg
            className="w-4 h-4 text-content-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      }
    >
      {SORT_OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={currentSort === option.value ? "bg-surface-hover text-accent" : ""}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
