"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "@/components/providers/NotificationProvider";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => Promise<void>;
}

function getActionText(type: string): string {
  switch (type) {
    case "mention":
      return "mentioned you in";
    case "reply_post":
      return "commented on your post";
    case "reply_comment":
      return "replied to your comment";
    case "search_match":
      return "A post matches your search index:";
    default:
      return "interacted with";
  }
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const { id, type, is_read, created_at, actor, post } = notification;

  function handleClick() {
    if (!is_read) {
      onRead(id);
    }
  }

  return (
    <Link
      href={`/post/${post.slug}`}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3",
        "hover:bg-surface-hover transition-colors",
        !is_read && "bg-surface-raised"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full mt-2 shrink-0",
          !is_read ? "bg-blue-500" : "bg-transparent"
        )}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-content">
          <span className="font-medium">{actor.username}</span>{" "}
          <span className="text-content-secondary">{getActionText(type)}</span>
        </p>
        <p className="text-sm text-content-secondary truncate mt-0.5">
          {post.title}
        </p>
        <p className="text-xs text-content-muted mt-1">
          {getRelativeTime(created_at)}
        </p>
      </div>
    </Link>
  );
}
