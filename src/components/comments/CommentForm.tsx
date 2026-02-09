"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { RichTextEditor } from "@/components/post/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createComment } from "@/actions/comments";
import Link from "next/link";

interface CommentFormProps {
  postId: string;
  parentId: string | null;
  onSuccess?: () => void;
  placeholder?: string;
  initialContent?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  placeholder = "Share your thoughts...",
  initialContent = "",
}: CommentFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Card className="p-4">
        <p className="text-sm text-content-muted text-center">
          <Link
            href="/login"
            className="text-accent hover:underline font-medium"
          >
            Sign in
          </Link>{" "}
          to comment
        </p>
      </Card>
    );
  }

  const handleSubmit = () => {
    if (!body.trim()) return;

    setError(null);

    startTransition(async () => {
      try {
        await createComment({
          body,
          post_id: postId,
          parent_id: parentId ?? undefined,
        });
        setBody("");
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to post comment"
        );
      }
    });
  };

  return (
    <Card className="p-3">
      <RichTextEditor
        content={body}
        onChange={setBody}
        placeholder={placeholder}
        minimal
      />

      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}

      <div className="flex justify-end mt-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !body.trim()}
        >
          {isPending
            ? "Posting..."
            : parentId
              ? "Reply"
              : "Comment"}
        </Button>
      </div>
    </Card>
  );
}
