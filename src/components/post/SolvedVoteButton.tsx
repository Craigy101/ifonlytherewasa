"use client";

import { useOptimistic, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { voteSolved, removeSolvedVote } from "@/actions/solved";
import { Button } from "@/components/ui/Button";

interface SolvedVoteButtonProps {
  postId: string;
  isSolved: boolean;
  solvedVoteCount: number;
  viewCount: number;
  userHasVoted: boolean;
  isOwnPost: boolean;
}

export function SolvedVoteButton({
  postId,
  isSolved,
  solvedVoteCount,
  viewCount,
  userHasVoted,
  isOwnPost,
}: SolvedVoteButtonProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { voted: userHasVoted, count: solvedVoteCount },
    (state, action: "vote" | "unvote") => ({
      voted: action === "vote",
      count: action === "vote" ? state.count + 1 : state.count - 1,
    })
  );

  if (isSolved || isOwnPost) return null;

  const requiredVotes = Math.max(Math.ceil(Math.sqrt(viewCount / 10)), 3);

  const handleClick = () => {
    if (!user) return;
    startTransition(async () => {
      if (optimistic.voted) {
        setOptimistic("unvote");
        await removeSolvedVote(postId);
      } else {
        setOptimistic("vote");
        await voteSolved(postId);
      }
    });
  };

  return (
    <Button
      variant={optimistic.voted ? "primary" : "secondary"}
      size="sm"
      onClick={handleClick}
      disabled={isPending || !user}
      className="gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Mark Solved ({optimistic.count}/{requiredVotes})
    </Button>
  );
}
