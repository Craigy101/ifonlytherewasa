import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/FeedList";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { FeedControls, parseFeedFilters } from "@/components/feed/FeedControls";
import { CATEGORIES } from "@/lib/config/categories";

export const revalidate = 30;

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters = parseFeedFilters(params);

  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      `
      id, title, slug, body, created_at, is_solved,
      weekly_pay_usd, time_spent_weekly, current_solution,
      reaction_pay, reaction_nice, reaction_meh, reaction_bad,
      comment_count, popularity_score,
      author:profiles!author_id(username, avatar_url),
      categories:post_categories(category:categories(id, name, slug, color))
    `
    )
    .eq("is_deleted", false);

  if (filters.minInterested > 0) {
    query = query.gte("reaction_pay", filters.minInterested);
  }

  if (filters.minSpend > 0) {
    query = query.gte("weekly_pay_usd", filters.minSpend);
  }

  if (filters.sort === "recent") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("popularity_score", { ascending: false });
  }

  const { data: posts } = await query.limit(20);

  return (
    <div>
      <CategoryFilter categories={CATEGORIES} />
      <FeedControls filters={filters} />
      <FeedList
        initialPosts={posts || []}
        sort={filters.sort}
        minInterested={filters.minInterested}
        minSpend={filters.minSpend}
      />
    </div>
  );
}
