"use client";

import { useMemo } from "react";
import { CommentItem } from "./CommentItem";

interface CommentAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  body: string;
  depth: number;
  like_count: number;
  user_has_liked: boolean;
  created_at: string;
  author: CommentAuthor;
}

export interface CommentNode {
  comment: Comment;
  children: CommentNode[];
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
}

const MAX_RENDER_DEPTH = 5;
const INITIAL_VISIBLE_REPLIES = 3;

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    map.set(comment.id, { comment, children: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;

    if (comment.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(comment.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

function renderCommentNodes(
  nodes: CommentNode[],
  depth: number,
  postId: string
): React.ReactNode {
  return nodes.map((node) => {
    if (depth >= MAX_RENDER_DEPTH) {
      return (
        <div
          key={node.comment.id}
          className="py-2"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <a
            href={`/post/${postId}?thread=${node.comment.id}`}
            className="text-xs text-accent hover:underline transition-colors"
          >
            Continue this thread&hellip;
          </a>
        </div>
      );
    }

    return (
      <CommentItem
        key={node.comment.id}
        comment={node.comment}
        childNodes={node.children}
        depth={depth}
        postId={postId}
        initialVisibleReplies={INITIAL_VISIBLE_REPLIES}
      />
    );
  });
}

export function CommentThread({ comments, postId }: CommentThreadProps) {
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-content-muted text-sm">
          No comments yet. Be the first to share your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderCommentNodes(tree, 0, postId)}
    </div>
  );
}
