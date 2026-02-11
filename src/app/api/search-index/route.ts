import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, body, current_solution")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(5000);

  // Strip HTML and truncate body to ~200 chars to keep payload small
  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();

  const index = (posts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    body: stripHtml(p.body ?? "").slice(0, 200),
    cs: p.current_solution ?? "",
  }));

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
