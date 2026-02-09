"use server";

import { createClient } from "@/lib/supabase/server";
import { createPostSchema } from "@/lib/validators/post";
import { revalidatePath } from "next/cache";

export async function createPost(formData: {
  title: string;
  body: string;
  category_ids: number[];
  product_type?: string | null;
  weekly_pay_usd?: number | null;
  time_spent_weekly?: string | null;
  current_solution?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createPostSchema.parse(formData);

  // Generate slug from title + timestamp
  const slug = parsed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) + "-" + Date.now().toString(36);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: parsed.title,
      slug,
      body: parsed.body,
      product_type: parsed.product_type || null,
      weekly_pay_usd: parsed.weekly_pay_usd || null,
      time_spent_weekly: parsed.time_spent_weekly || null,
      current_solution: parsed.current_solution || null,
    })
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);

  // Insert post_categories
  if (parsed.category_ids.length > 0) {
    await supabase.from("post_categories").insert(
      parsed.category_ids.map(cid => ({ post_id: post.id, category_id: cid }))
    );
  }

  revalidatePath("/");
  return { slug: post.slug };
}

export async function updatePost(postId: string, formData: { title: string; body: string; category_ids: number[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership and 1-hour window
  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, created_at")
    .eq("id", postId)
    .single();

  if (!existing || existing.author_id !== user.id) throw new Error("Unauthorized");
  if (Date.now() - new Date(existing.created_at).getTime() > 3600000) {
    throw new Error("Edit window has expired. You can only edit within the first hour.");
  }

  const parsed = createPostSchema.parse(formData);

  const { error } = await supabase
    .from("posts")
    .update({ title: parsed.title, body: parsed.body, edited_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(error.message);

  // Update categories: delete old, insert new
  await supabase.from("post_categories").delete().eq("post_id", postId);
  if (parsed.category_ids.length > 0) {
    await supabase.from("post_categories").insert(
      parsed.category_ids.map(cid => ({ post_id: postId, category_id: cid }))
    );
  }

  revalidatePath("/");
}

export async function getSimilarPosts(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Check if user is a paying developer
  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) return [];

  const { data: paidIndex } = await supabase
    .from("search_indices")
    .select("id")
    .eq("developer_profile_id", devProfile.id)
    .eq("is_active", true)
    .eq("is_free", false)
    .limit(1)
    .single();

  if (!paidIndex) return [];

  // Get the current post's title for keyword extraction
  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("id", postId)
    .single();

  if (!post) return [];

  // Extract keywords from title (words > 3 chars)
  const keywords = post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w: string) => w.length > 3)
    .slice(0, 5)
    .join(" | ");

  if (!keywords) return [];

  const { data: similar } = await supabase
    .rpc("search_posts", { search_query: keywords, result_limit: 5 });

  return (similar || [])
    .filter((p: { id: string }) => p.id !== postId)
    .slice(0, 4);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
