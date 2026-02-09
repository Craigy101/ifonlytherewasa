"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getSimilarPosts } from "@/actions/posts";

interface SimilarPost {
  id: string;
  title: string;
  slug: string;
  reaction_pay: number;
  comment_count: number;
}

interface SimilarPostsProps {
  postId: string;
}

export function SimilarPosts({ postId }: SimilarPostsProps) {
  const [posts, setPosts] = useState<SimilarPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSimilarPosts(postId)
      .then((data) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading || posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
        Similar Problems
      </h3>
      <div className="space-y-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.slug}`}>
            <Card hover className="p-3">
              <p className="text-sm font-medium text-content line-clamp-1">{post.title}</p>
              <div className="flex gap-3 mt-1 text-xs text-content-muted">
                <span>{post.reaction_pay} would pay</span>
                <span>{post.comment_count} comments</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
