"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { RichTextContent } from "@/components/post/RichTextContent";
import { CommentForm } from "./CommentForm";
import { toggleCommentLike } from "@/actions/comment-likes";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import type { Comment, CommentNode } from "./CommentThread";

interface CommentItemProps {
  comment: Comment;
  childNodes: CommentNode[];
  depth: number;
  postId: string;
  initialVisibleReplies?: number;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function getDepthBorderColor(depth: number): string {
  const colors = [
    "border-surface-border",
    "border-surface-hover",
    "border-content-muted/30",
    "border-content-muted/20",
    "border-content-muted/10",
  ];
  return colors[Math.min(depth, colors.length - 1)];
}

export function CommentItem({
  comment,
  childNodes,
  depth,
  postId,
  initialVisibleReplies = 3,
}: CommentItemProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialVisibleReplies);
  const [isPending, startTransition] = useTransition();

  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { liked: comment.user_has_liked, count: comment.like_count },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  const handleLike = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      setOptimisticLike(null);
      await toggleCommentLike(comment.id);
    });
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  // Auto @mention: when replying to a nested comment (depth > 0), prefill with @username
  const replyPrefix = depth > 0 ? `@${comment.author.username} ` : "";

  const hiddenCount = childNodes.length - visibleCount;
  const visibleChildren = childNodes.slice(0, visibleCount);

  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      <div
        className={`border-l-2 ${getDepthBorderColor(depth)} pl-4 py-2`}
      >
        {/* Header row */}
        <div className="flex items-center gap-2">
          <Avatar
            username={comment.author.username || "Anonymous"}
            avatarUrl={comment.author.avatar_url ?? undefined}
            size="sm"
          />
          <span className="text-sm font-medium text-content-secondary">
            {comment.author.username}
          </span>
          <span className="text-content-muted text-xs">&middot;</span>
          <span className="text-xs text-content-muted" suppressHydrationWarning>
            {getRelativeTime(comment.created_at)}
          </span>
        </div>

        {/* Body */}
        <div className="mt-1.5 text-sm">
          <RichTextContent content={comment.body} />
        </div>

        {/* Action row: like + reply */}
        <div className="flex items-center gap-3 mt-1.5">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-1 text-xs transition-colors ${
              optimisticLike.liked
                ? "text-accent"
                : "text-content-muted hover:text-content"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={optimisticLike.liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {optimisticLike.count > 0 && (
              <span>{optimisticLike.count}</span>
            )}
          </button>
          <button
            onClick={() => setShowReplyForm((prev) => !prev)}
            className="text-xs text-content-muted hover:text-content transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              placeholder={`Reply to ${comment.author.username}...`}
              initialContent={replyPrefix}
            />
          </div>
        )}
      </div>

      {/* Render visible children recursively */}
      {visibleChildren.length > 0 && (
        <div className="mt-1">
          {visibleChildren.map((child) => (
            <CommentItem
              key={child.comment.id}
              comment={child.comment}
              childNodes={child.children}
              depth={depth + 1}
              postId={postId}
              initialVisibleReplies={initialVisibleReplies}
            />
          ))}
        </div>
      )}

      {/* Show more replies button */}
      {hiddenCount > 0 && (
        <div style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
          <button
            onClick={() => setVisibleCount(childNodes.length)}
            className="text-xs text-accent hover:underline py-2 pl-4"
          >
            Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
          </button>
        </div>
      )}
    </div>
  );
}
