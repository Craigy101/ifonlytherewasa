"use client";

import { cn } from "@/lib/utils/cn";
import { PostCard, type PostCardData } from "@/components/feed/PostCard";

interface SearchResultPost {
  id: string;
  slug: string;
  title: string;
  body: string;
  created_at: string;
  reaction_pay: number;
  reaction_nice: number;
  reaction_meh: number;
  reaction_bad: number;
  comment_count: number;
}

interface SearchResultsProps {
  results: SearchResultPost[];
  query: string;
}

function toPostCardData(result: SearchResultPost): PostCardData {
  return {
    ...result,
    author: { username: null, avatar_url: null },
    categories: [],
  };
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "py-20 px-4"
        )}
      >
        <p className="text-content text-lg font-medium mb-2">
          No results found for &apos;{query}&apos;
        </p>
        <p className="text-content-muted text-sm text-center max-w-md">
          Try adjusting your search terms, using different keywords, or checking
          for typos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-content-muted mb-4">
        {results.length} {results.length === 1 ? "result" : "results"} for
        &apos;{query}&apos;
      </p>
      <div className="space-y-4">
        {results.map((result) => (
          <PostCard key={result.id} post={toPostCardData(result)} />
        ))}
      </div>
    </div>
  );
}
