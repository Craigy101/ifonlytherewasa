import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostDetailClient } from "./PostDetailClient";
import { incrementViewCount } from "@/actions/solved";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, body")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (!post) return { title: "Post Not Found" };

  const description = post.body.replace(/<[^>]*>/g, "").slice(0, 160);
  return {
    title: `If only there was a ${post.title}`,
    description,
    openGraph: {
      title: `If only there was a ${post.title}`,
      description,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, title, slug, body, created_at, updated_at, edited_at,
      weekly_pay_usd, time_spent_weekly, current_solution,
      reaction_pay, reaction_nice, reaction_meh, reaction_bad,
      comment_count, is_solved, solved_by, solved_vote_count, view_count,
      author:profiles!author_id(id, username, avatar_url),
      categories:post_categories(category:categories(id, name, slug, color))
    `)
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (!post) notFound();

  try { await incrementViewCount(post.id); } catch { /* safe for anonymous users */ }

  // Get current user info
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch comments with like_count
  const { data: rawComments } = await supabase
    .from("comments")
    .select(`
      id, post_id, parent_id, body, depth, like_count, is_deleted, created_at,
      author:profiles!author_id(id, username, avatar_url)
    `)
    .eq("post_id", post.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  // Check which comments the user has liked
  let userLikedCommentIds = new Set<string>();
  if (user && rawComments && rawComments.length > 0) {
    const commentIds = rawComments.map((c) => c.id);
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", user.id)
      .in("comment_id", commentIds);
    if (likes) {
      userLikedCommentIds = new Set(likes.map((l) => l.comment_id));
    }
  }

  const comments = (rawComments || []).map((c) => ({
    ...c,
    user_has_liked: userLikedCommentIds.has(c.id),
    author: c.author as { id: string; username: string; avatar_url: string | null },
  }));
  let userReaction: "pay" | "nice" | "meh" | "bad" | null = null;
  let isBookmarked = false;
  if (user) {
    const { data: reaction } = await supabase
      .from("reactions")
      .select("type")
      .eq("user_id", user.id)
      .eq("post_id", post.id)
      .single();
    userReaction = (reaction?.type as "pay" | "nice" | "meh" | "bad") || null;

    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id)
      .eq("post_id", post.id)
      .single();
    isBookmarked = !!bookmark;
  }

  let userHasSolvedVote = false;
  if (user) {
    const { data: solvedVote } = await supabase
      .from("solved_votes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();
    userHasSolvedVote = !!solvedVote;
  }

  const author = post.author as { id: string; username: string; avatar_url: string | null } | null;
  const isOwnPost = user?.id === author?.id;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: `If only there was a ${post.title}`,
            articleBody: post.body.replace(/<[^>]*>/g, ""),
            author: { "@type": "Person", name: author?.username },
            datePublished: post.created_at,
            dateModified: post.updated_at,
            interactionStatistic: [
              { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.comment_count },
              { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.reaction_pay + post.reaction_nice },
            ],
          }),
        }}
      />
      <PostDetailClient
        post={post}
        comments={comments || []}
        userReaction={userReaction}
        isBookmarked={isBookmarked}
        isOwnPost={isOwnPost}
        userHasSolvedVote={userHasSolvedVote}
      />
    </>
  );
}
