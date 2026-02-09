"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { PostCard } from "@/components/feed/PostCard";
import { cn } from "@/lib/utils/cn";

type Tab = "posts" | "comments";

interface UserStats {
  postsCount: number;
  commentsCount: number;
  totalReactions: number;
}

interface UserComment {
  id: string;
  body: string;
  created_at: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [stats, setStats] = useState<UserStats>({
    postsCount: 0,
    commentsCount: 0,
    totalReactions: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchStats() {
      const [postsResult, commentsResult, reactionsResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", user!.id),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("author_id", user!.id),
        supabase
          .from("posts")
          .select("reaction_pay, reaction_nice, reaction_meh, reaction_bad")
          .eq("author_id", user!.id),
      ]);

      const totalReactions = (reactionsResult.data || []).reduce(
        (sum, post) =>
          sum +
          (post.reaction_pay || 0) +
          (post.reaction_nice || 0) +
          (post.reaction_meh || 0) +
          (post.reaction_bad || 0),
        0
      );

      setStats({
        postsCount: postsResult.count || 0,
        commentsCount: commentsResult.count || 0,
        totalReactions,
      });
    }

    async function fetchPosts() {
      const { data } = await supabase
        .from("posts")
        .select(
          "id, title, slug, body, created_at, reaction_pay, reaction_nice, reaction_meh, reaction_bad, comment_count, author:profiles!author_id(username, avatar_url), categories:post_categories(category:categories(id, name, slug, color))"
        )
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      setPosts(data || []);
    }

    async function fetchComments() {
      const { data } = await supabase
        .from("comments")
        .select("id, body, created_at, post:posts!post_id(id, title, slug)")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      setComments((data as unknown as UserComment[]) || []);
    }

    Promise.all([fetchStats(), fetchPosts(), fetchComments()]).finally(() =>
      setLoading(false)
    );
  }, [user]);

  if (!user) return null;

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const statItems = [
    { label: "Posts", value: stats.postsCount },
    { label: "Comments", value: stats.commentsCount },
    { label: "Reactions Received", value: stats.totalReactions },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content">
          {profile?.username || "Anonymous"}
        </h1>
        <p className="text-sm text-content-muted">Joined {joinedDate}</p>
      </div>

      <Card className="flex divide-x divide-surface-border">
        {statItems.map((stat) => (
          <div key={stat.label} className="flex-1 px-6 py-4 text-center">
            <div className="text-2xl font-bold text-content">{stat.value}</div>
            <div className="mt-1 text-xs text-content-muted">{stat.label}</div>
          </div>
        ))}
      </Card>

      <div className="flex gap-4">
        <Link
          href="/profile/saved"
          className="text-sm text-content-secondary hover:text-content transition-colors"
        >
          Saved Posts
        </Link>
        <Link
          href="/profile/settings"
          className="text-sm text-content-secondary hover:text-content transition-colors"
        >
          Settings
        </Link>
      </div>

      <div className="flex gap-4 border-b border-surface-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "pb-2 text-sm font-medium transition-colors",
            activeTab === "posts"
              ? "border-b-2 border-accent text-content"
              : "text-content-muted hover:text-content-secondary"
          )}
        >
          My Posts
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={cn(
            "pb-2 text-sm font-medium transition-colors",
            activeTab === "comments"
              ? "border-b-2 border-accent text-content"
              : "text-content-muted hover:text-content-secondary"
          )}
        >
          My Comments
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-content-muted text-sm">
          Loading...
        </div>
      ) : activeTab === "posts" ? (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="py-12 text-center text-sm text-content-muted">
              You haven&apos;t posted anything yet.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="py-12 text-center text-sm text-content-muted">
              You haven&apos;t commented yet.
            </p>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <p className="text-sm text-content">{comment.body}</p>
                <Link
                  href={`/post/${comment.post.slug}`}
                  className="mt-2 block text-xs text-content-muted hover:text-content-secondary transition-colors"
                >
                  on &ldquo;{comment.post.title}&rdquo;
                </Link>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
