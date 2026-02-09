"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SearchResult {
  slug: string;
  title: string;
  body: string;
  current_solution?: string | null;
}

interface SearchDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onClose: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-accent/20 text-content rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function SkeletonItem() {
  return (
    <div className="p-3 space-y-2">
      <div className="h-4 bg-surface-hover rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-surface-hover rounded w-full animate-pulse" />
    </div>
  );
}

export function SearchDropdown({
  results,
  isLoading,
  query,
  onClose,
}: SearchDropdownProps) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 mt-1",
        "bg-surface-overlay border border-surface-border",
        "rounded-lg shadow-2xl z-50 overflow-hidden"
      )}
    >
      {isLoading ? (
        <div>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      ) : results.length === 0 ? (
        <div className="flex items-center justify-center py-8 px-4">
          <p className="text-sm text-content-muted">
            No results for &apos;{query}&apos;
          </p>
        </div>
      ) : (
        <div>
          {results.map((result, index) => (
            <Link
              key={result.slug}
              href={`/post/${result.slug}`}
              onClick={onClose}
              className={cn(
                "block p-3 hover:bg-surface-hover transition-colors",
                index < results.length - 1 && "border-b border-surface-border"
              )}
            >
              <p className="text-sm font-medium text-content">
                <HighlightedText text={result.title} query={query} />
              </p>
              {result.body && (
                <p className="text-xs text-content-muted line-clamp-1 mt-0.5">
                  {stripHtml(result.body)}
                </p>
              )}
              {result.current_solution && (
                <p className="text-xs text-amber-400/80 line-clamp-1 mt-0.5">
                  Currently: <HighlightedText text={result.current_solution} query={query} />
                </p>
              )}
            </Link>
          ))}

          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className={cn(
              "block text-xs text-content-muted text-center",
              "py-2 hover:bg-surface-hover transition-colors",
              "border-t border-surface-border"
            )}
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  );
}
