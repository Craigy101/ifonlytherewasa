"use client";

import { useState, useCallback } from "react";
import { toggleBookmark } from "@/actions/bookmarks";

interface UseBookmarkOptions {
  postId: string;
  initialBookmarked: boolean;
}

export function useBookmark({ postId, initialBookmarked }: UseBookmarkOptions) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    const previousState = isBookmarked;

    // Optimistic update
    setIsBookmarked(!previousState);
    setIsLoading(true);

    try {
      await toggleBookmark(postId);
    } catch {
      // Revert on error
      setIsBookmarked(previousState);
    } finally {
      setIsLoading(false);
    }
  }, [postId, isBookmarked, isLoading]);

  return { isBookmarked, isLoading, toggle };
}
