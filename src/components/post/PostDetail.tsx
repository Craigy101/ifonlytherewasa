"use client";

import { useMemo, useState } from "react";
import { PostMeta } from "@/components/post/PostMeta";
import { RichTextContent } from "@/components/post/RichTextContent";
import { ReactionBar } from "@/components/post/ReactionBar";
import { BookmarkButton } from "@/components/post/BookmarkButton";
import { ShareButton } from "@/components/post/ShareButton";
import { Badge, Button, Dialog } from "@/components/ui";
import { SolvedBadge } from "@/components/post/SolvedBadge";
import { SolvedVoteButton } from "@/components/post/SolvedVoteButton";
import { markPostSolved, markPostUnsolved } from "@/actions/solved";
import Link from "next/link";

type ReactionType = "pay" | "nice" | "meh" | "bad";

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    slug: string;
    body: string;
    created_at: string;
    updated_at: string;
    edited_at: string | null;
    author: {
      username: string | null;
      avatar_url: string | null;
    };
    categories: Array<{
      category: {
        id: number;
        name: string;
        slug: string;
        color: string | null;
      };
    }>;
    reaction_pay: number;
    reaction_nice: number;
    reaction_meh: number;
    reaction_bad: number;
    comment_count: number;
    is_solved: boolean;
    solved_by: string | null;
    solved_vote_count: number;
    view_count: number;
    weekly_pay_usd: number | null;
    time_spent_weekly: string | null;
    current_solution: string | null;
  };
  isOwnPost: boolean;
  userReaction: ReactionType | null;
  isBookmarked: boolean;
  userHasSolvedVote: boolean;
  onDelete: () => Promise<void>;
}

export function PostDetail({
  post,
  isOwnPost,
  userReaction,
  isBookmarked,
  userHasSolvedVote,
  onDelete,
}: PostDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = useMemo(
    () => isOwnPost && Date.now() - new Date(post.created_at).getTime() < 3600000,
    [isOwnPost, post.created_at]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <article className="space-y-6">
      {/* Author / Meta */}
      <PostMeta
        author={post.author}
        createdAt={post.created_at}
        editedAt={post.edited_at}
      />

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.categories.map(({ category }) => {
            const color = category.color || "#666666";
            return (
              <Badge
                key={category.id}
                color={color}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Solved Status */}
      {post.is_solved && (
        <SolvedBadge solvedBy={post.solved_by as "author" | "community" | null} />
      )}

      {/* Title */}
      <div>
        <p className="text-content-muted text-base italic">If only there was a...</p>
        <h1 className="text-2xl font-bold text-content mt-1">{post.title}</h1>
      </div>

      {/* Body */}
      <RichTextContent content={post.body} />

      {/* Pain Point Data */}
      {(post.weekly_pay_usd || post.time_spent_weekly || post.current_solution) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-surface-raised border border-surface-border">
          {post.weekly_pay_usd && (
            <div>
              <p className="text-xs text-content-muted mb-1">Would pay</p>
              <p className="text-sm font-semibold text-green-400">${post.weekly_pay_usd}/week</p>
            </div>
          )}
          {post.time_spent_weekly && (
            <div>
              <p className="text-xs text-content-muted mb-1">Time spent weekly</p>
              <p className="text-sm font-semibold text-blue-400">{post.time_spent_weekly}</p>
            </div>
          )}
          {post.current_solution && (
            <div className={!post.weekly_pay_usd && !post.time_spent_weekly ? "sm:col-span-3" : ""}>
              <p className="text-xs text-content-muted mb-1">Current solution</p>
              <p className="text-sm text-amber-400">{post.current_solution}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-surface-border">
        <ReactionBar
          postId={post.id}
          reactions={{
            pay: post.reaction_pay,
            nice: post.reaction_nice,
            meh: post.reaction_meh,
            bad: post.reaction_bad,
          }}
          userReaction={userReaction}
        />

        <div className="flex items-center gap-1">
          <BookmarkButton postId={post.id} isBookmarked={isBookmarked} />
          <ShareButton slug={post.slug} />
        </div>
      </div>

      {/* Owner Actions */}
      {isOwnPost && (
        <div className="flex items-center gap-3 pt-2">
          {canEdit && (
            <Link href={`/post/${post.slug}?edit=true`}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            Delete
          </Button>
          {!post.is_solved ? (
            <Button variant="secondary" size="sm" onClick={() => { markPostSolved(post.id); }} className="text-green-400 border-green-400/30 hover:bg-green-400/10">
              Mark as Solved
            </Button>
          ) : post.solved_by === "author" && (
            <Button variant="secondary" size="sm" onClick={() => { markPostUnsolved(post.id); }} className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10">
              Unmark Solved
            </Button>
          )}
        </div>
      )}

      {/* Solved Vote */}
      <SolvedVoteButton
        postId={post.id}
        isSolved={post.is_solved}
        solvedVoteCount={post.solved_vote_count}
        viewCount={post.view_count}
        userHasVoted={userHasSolvedVote}
        isOwnPost={isOwnPost}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Post"
      >
        <p className="text-sm text-content-muted">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Dialog>
    </article>
  );
}
