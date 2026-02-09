"use client";

import { useOptimistic, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { REACTIONS } from "@/lib/config/reactions";
import { toggleReaction } from "@/actions/reactions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

type ReactionType = "pay" | "nice" | "meh" | "bad";

interface ReactionBarProps {
  postId: string;
  reactions: {
    pay: number;
    nice: number;
    meh: number;
    bad: number;
  };
  userReaction: ReactionType | null;
}

interface ReactionState {
  counts: Record<ReactionType, number>;
  active: ReactionType | null;
}

export function ReactionBar({ postId, reactions, userReaction }: ReactionBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic<ReactionState, ReactionType>(
    {
      counts: { ...reactions },
      active: userReaction,
    },
    (state, clickedType) => {
      const newCounts = { ...state.counts };

      if (state.active === clickedType) {
        // Remove reaction
        newCounts[clickedType] = Math.max(0, newCounts[clickedType] - 1);
        return { counts: newCounts, active: null };
      }

      if (state.active) {
        // Switch reaction
        newCounts[state.active] = Math.max(0, newCounts[state.active] - 1);
      }
      newCounts[clickedType] = newCounts[clickedType] + 1;
      return { counts: newCounts, active: clickedType };
    }
  );

  const handleClick = (type: ReactionType) => {
    if (!user) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimisticState(type);
      try {
        await toggleReaction(postId, type);
      } catch {
        // Revert handled by optimistic update returning to server state on revalidation
      }
    });
  };

  const colorMap: Record<ReactionType, string> = {
    pay: "#22C55E",
    nice: "#3B82F6",
    meh: "#F59E0B",
    bad: "#EF4444",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map((config) => {
        const isActive = optimisticState.active === config.type;
        const count = optimisticState.counts[config.type];
        const hex = colorMap[config.type];

        return (
          <button
            key={config.type}
            type="button"
            onClick={() => handleClick(config.type)}
            disabled={isPending}
            title={config.label}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all",
              isActive
                ? "border-current"
                : "border-surface-border bg-surface-raised text-content-secondary hover:bg-surface-hover"
            )}
            style={
              isActive
                ? {
                    color: hex,
                    backgroundColor: `${hex}1A`,
                    borderColor: hex,
                  }
                : undefined
            }
          >
            <span>{config.icon}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
