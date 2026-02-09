import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1,
    },
    ...categoryUrls,
    ...postUrls,
  ];
}
