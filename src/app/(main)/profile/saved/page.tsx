"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/feed/PostCard";
export default function SavedPostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const supabase = createClient();

    async function fetchSavedPosts() {
      const { data } = await supabase
        .from("bookmarks")
        .select(
          "post:posts!post_id(id, title, slug, body, created_at, reaction_pay, reaction_nice, reaction_meh, reaction_bad, comment_count, author:profiles!author_id(username, avatar_url), categories:post_categories(category:categories(id, name, slug, color)))"
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedPosts = (data || []).map((bookmark: any) => bookmark.post);
      setPosts(savedPosts);
      setLoading(false);
    }

    fetchSavedPosts();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="text-sm text-content-muted hover:text-content-secondary transition-colors"
        >
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-content mb-6">Saved Posts</h1>

      {loading ? (
        <div className="py-12 text-center text-sm text-content-muted">
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-content-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
          </svg>
          <p className="mt-4 text-sm text-content-muted">
            No saved posts yet
          </p>
          <p className="mt-1 text-xs text-content-muted">
            Bookmark posts to find them here later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
