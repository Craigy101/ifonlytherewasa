import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/feed/PostCard";
import type { PostCardData } from "@/components/feed/PostCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search: ${q} - If Only There Was A` : "Search - If Only There Was A",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  if (!q || !q.trim()) {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-semibold text-content mb-2">Search</h1>
        <p className="text-content-muted text-sm">
          Enter a search term to find ideas and pain points.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: searchResults, error } = await supabase.rpc("search_posts", {
    search_query: q.trim(),
    result_limit: 20,
  });

  if (error || !searchResults || searchResults.length === 0) {
    if (error) {
      return (
        <div className="text-center py-16">
          <h1 className="text-xl font-semibold text-content mb-2">
            Search Error
          </h1>
          <p className="text-content-muted text-sm">
            Something went wrong. Please try again.
          </p>
        </div>
      );
    }
  }

  const postIds = (searchResults ?? []).map((r: { id: string }) => r.id);
  let results: PostCardData[] = [];

  if (postIds.length > 0) {
    const { data: fullPosts } = await supabase
      .from("posts")
      .select(`
        id, title, slug, body, created_at,
        reaction_pay, reaction_nice, reaction_meh, reaction_bad,
        comment_count, is_solved,
        weekly_pay_usd, time_spent_weekly, current_solution,
        author:profiles!posts_author_id_fkey(username, avatar_url),
        categories:post_categories(category:categories(name, slug, color))
      `)
      .in("id", postIds);

    if (fullPosts) {
      // Preserve search ranking order
      const postMap = new Map(fullPosts.map((p) => [p.id, p]));
      results = postIds
        .map((id: string) => postMap.get(id))
        .filter(Boolean) as PostCardData[];
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-content">
          Search results for &ldquo;{q}&rdquo;
        </h1>
        <p className="text-sm text-content-muted mt-1">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-content-muted text-sm">
            No results found for &ldquo;{q}&rdquo;. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
