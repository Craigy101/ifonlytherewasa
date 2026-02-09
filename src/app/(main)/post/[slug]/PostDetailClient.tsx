"use client";

import { useRouter } from "next/navigation";
import { PostDetail } from "@/components/post/PostDetail";
import { CommentThread } from "@/components/comments/CommentThread";
import { CommentForm } from "@/components/comments/CommentForm";
import { SimilarPosts } from "@/components/post/SimilarPosts";
import { deletePost } from "@/actions/posts";
import type { Comment } from "@/components/comments/CommentThread";

type ReactionType = "pay" | "nice" | "meh" | "bad";

interface PostDetailClientProps {
  post: {
    id: string;
    title: string;
    slug: string;
    body: string;
    created_at: string;
    updated_at: string;
    edited_at: string | null;
    author: {
      id: string;
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
  comments: Comment[];
  userReaction: ReactionType | null;
  isBookmarked: boolean;
  isOwnPost: boolean;
  userHasSolvedVote: boolean;
}

export function PostDetailClient({
  post,
  comments,
  userReaction,
  isBookmarked,
  isOwnPost,
  userHasSolvedVote,
}: PostDetailClientProps) {
  const router = useRouter();

  const handleDelete = async () => {
    await deletePost(post.id);
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <PostDetail
        post={post}
        isOwnPost={isOwnPost}
        userReaction={userReaction}
        isBookmarked={isBookmarked}
        userHasSolvedVote={userHasSolvedVote}
        onDelete={handleDelete}
      />


      {/* Comments Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-content">
          Comments ({post.comment_count})
        </h2>

        <CommentForm postId={post.id} parentId={null} />

        <CommentThread comments={comments} postId={post.id} />
      </section>

      {/* Similar Posts (for paying devs) */}
      <SimilarPosts postId={post.id} />
    </div>
  );
}
