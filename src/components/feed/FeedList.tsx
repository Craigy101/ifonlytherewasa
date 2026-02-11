"use client";

import { useState, useCallback, Fragment } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FeedAd } from "@/components/ads/FeedAd";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { PostCardData } from "./PostCard";
import type { FeedSort, ProductType } from "@/lib/feed-filters";

const PAGE_SIZE = 20;

const POST_SELECT = `
  id, title, slug, body, created_at, is_solved,
  weekly_pay_usd, time_spent_weekly, current_solution, product_type,
  reaction_pay, reaction_nice, reaction_meh, reaction_bad,
  comment_count, popularity_score,
  author:profiles!author_id(username, avatar_url),
  categories:post_categories(category:categories(id, name, slug, color))
`;

const POST_SELECT_CATEGORY = `
  id, title, slug, body, created_at, is_solved,
  weekly_pay_usd, time_spent_weekly, current_solution, product_type,
  reaction_pay, reaction_nice, reaction_meh, reaction_bad,
  comment_count, popularity_score,
  author:profiles!author_id(username, avatar_url),
  categories:post_categories!inner(category:categories!inner(id, name, slug, color))
`;

interface FeedListProps {
  supabase: SupabaseClient;
  initialPosts: PostCardData[];
  categorySlug?: string;
  sort?: FeedSort;
  minInterested?: number;
  minSpend?: number;
  productType?: ProductType | "";
}

export function FeedList({
  supabase,
  initialPosts,
  categorySlug,
  sort = "popular",
  minInterested = 0,
  minSpend = 0,
  productType = "",
}: FeedListProps) {
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);

  const loadMore = useCallback(async () => {
    setIsLoading(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const selectStr = categorySlug ? POST_SELECT_CATEGORY : POST_SELECT;

      let query = supabase
        .from("posts")
        .select(selectStr)
        .eq("is_deleted", false);

      if (categorySlug) {
        query = query.eq("post_categories.categories.slug", categorySlug);
      }

      if (minInterested > 0) {
        query = query.gte("reaction_pay", minInterested);
      }

      if (minSpend > 0) {
        query = query.gte("weekly_pay_usd", minSpend);
      }

      if (productType) {
        query = query.eq("product_type", productType);
      }

      if (sort === "recent") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("popularity_score", { ascending: false });
      }

      query = query.range(from, to);

      const { data } = await query;

      const newPosts = (data as PostCardData[] | null) ?? [];

      if (newPosts.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, page, categorySlug, sort, minInterested, minSpend, productType]);

  const { sentinelRef } = useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading,
  });

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          <PostCard post={post} />
          {(index + 1) % 5 === 0 && <FeedAd />}
        </Fragment>
      ))}

      {isLoading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {!isLoading && !hasMore && posts.length > 0 && (
        <p className="text-content-muted text-center py-8 text-sm">
          You&apos;ve reached the end
        </p>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="text-content-muted text-center py-12 text-sm">
          No posts match these filters
        </p>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} aria-hidden="true" />
    </div>
  );
}
