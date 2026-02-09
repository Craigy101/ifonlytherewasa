"use client";

import { useOptimistic, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { toggleBookmark } from "@/actions/bookmarks";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  postId: string;
  isBookmarked: boolean;
}

export function BookmarkButton({ postId, isBookmarked }: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    isBookmarked,
    (_state, newValue: boolean) => newValue
  );

  const handleClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimisticBookmarked(!optimisticBookmarked);
      try {
        await toggleBookmark(postId);
      } catch {
        // Revert handled by revalidation
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={optimisticBookmarked ? "Remove bookmark" : "Bookmark this post"}
      className={cn(
        "p-2 rounded-lg transition-colors",
        optimisticBookmarked
          ? "text-accent"
          : "text-content-muted hover:text-content hover:bg-surface-hover"
      )}
    >
      {optimisticBookmarked ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 2a1 1 0 0 0-1 1v14.5a.5.5 0 0 0 .8.4L10 13.5l5.2 4.4a.5.5 0 0 0 .8-.4V3a1 1 0 0 0-1-1H5z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 2.5h10a1 1 0 0 1 1 1v14l-5.2-4.4a.5.5 0 0 0-.6 0L5 17.5v-14a1 1 0 0 1 1-1z" />
        </svg>
      )}
    </button>
  );
}
