import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditIndexClient } from "./EditIndexClient";
import { CATEGORIES } from "@/lib/config/categories";

export default async function EditSearchIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) redirect("/profile/developer");

  const { data: index } = await supabase
    .from("search_indices")
    .select("*")
    .eq("id", id)
    .eq("developer_profile_id", devProfile.id)
    .single();

  if (!index) notFound();

  const categoryData = CATEGORIES.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-content">Edit Search Index</h1>
      <EditIndexClient indexId={id} initialData={index} categories={categoryData} />
    </div>
  );
}
