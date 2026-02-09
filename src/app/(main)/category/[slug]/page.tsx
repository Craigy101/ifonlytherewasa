import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/FeedList";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { FeedControls, parseFeedFilters } from "@/components/feed/FeedControls";
import { CATEGORIES } from "@/lib/config/categories";
import { notFound } from "next/navigation";

export const revalidate = 30;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} Ideas - If Only There Was A`,
    description: `Browse ${category.name.toLowerCase()} ideas and pain points shared by the community.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const filters = parseFeedFilters(sp);
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

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
      categories:post_categories!inner(category:categories!inner(id, name, slug, color))
    `
    )
    .eq("is_deleted", false)
    .eq("post_categories.categories.slug", slug);

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
      <CategoryFilter categories={CATEGORIES} activeSlug={slug} />
      <FeedControls filters={filters} />
      <FeedList
        initialPosts={posts || []}
        categorySlug={slug}
        sort={filters.sort}
        minInterested={filters.minInterested}
        minSpend={filters.minSpend}
      />
    </div>
  );
}
