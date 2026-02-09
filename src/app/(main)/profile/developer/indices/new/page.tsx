import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewIndexClient } from "./NewIndexClient";
import { CATEGORIES } from "@/lib/config/categories";

export default async function NewSearchIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) redirect("/profile/developer");

  const categoryData = CATEGORIES.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-content">New Search Index</h1>
      <p className="text-sm text-content-muted">
        Define filters to match unsolved posts. Your first index is free — additional indices are $5/month.
      </p>
      <NewIndexClient categories={categoryData} />
    </div>
  );
}
