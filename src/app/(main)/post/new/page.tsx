"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/post/PostForm";
import { createPost } from "@/actions/posts";
import { Card, Dialog } from "@/components/ui";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/components/providers/AuthProvider";

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    body: string;
    category_ids: number[];
    product_type: string | null;
    weekly_pay_usd: number | null;
    time_spent_weekly: string | null;
    current_solution: string | null;
  }) => {
    try {
      setError(null);
      const result = await createPost(data);
      router.push(`/post/${result.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-content mb-6">Share your idea</h1>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <Card className="p-4 sm:p-6">
        <PostForm
          onSubmit={handleSubmit}
          requireAuth={!user}
          onAuthRequired={() => setShowLoginDialog(true)}
        />
      </Card>

      {/* Login Dialog */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        title="Sign in to post"
      >
        <p className="text-sm text-content-muted mb-6">
          You need to sign in to share your idea. Your draft will be saved and waiting for you when you return.
        </p>
        <GoogleSignInButton />
      </Dialog>
    </div>
  );
}
