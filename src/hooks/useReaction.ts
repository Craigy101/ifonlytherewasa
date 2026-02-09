"use client";

import { useState, useCallback } from "react";
import { toggleReaction } from "@/actions/reactions";

type ReactionType = "pay" | "nice" | "meh" | "bad";

interface ReactionCounts {
  pay: number;
  nice: number;
  meh: number;
  bad: number;
}

interface UseReactionOptions {
  postId: string;
  initialReaction: ReactionType | null;
  initialCounts: ReactionCounts;
}

export function useReaction({
  postId,
  initialReaction,
  initialCounts,
}: UseReactionOptions) {
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    initialReaction
  );
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [isLoading, setIsLoading] = useState(false);

  const react = useCallback(
    async (type: ReactionType) => {
      if (isLoading) return;

      const previousReaction = currentReaction;
      const previousCounts = { ...counts };

      // Optimistic update
      if (type === currentReaction) {
        // Removing current reaction
        setCurrentReaction(null);
        setCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1),
        }));
      } else if (currentReaction) {
        // Switching reaction
        setCurrentReaction(type);
        setCounts((prev) => ({
          ...prev,
          [currentReaction]: Math.max(0, prev[currentReaction] - 1),
          [type]: prev[type] + 1,
        }));
      } else {
        // New reaction
        setCurrentReaction(type);
        setCounts((prev) => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
      }

      setIsLoading(true);

      try {
        await toggleReaction(postId, type);
      } catch {
        // Revert on error
        setCurrentReaction(previousReaction);
        setCounts(previousCounts);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, currentReaction, counts, isLoading]
  );

  return { currentReaction, counts, isLoading, react };
}
