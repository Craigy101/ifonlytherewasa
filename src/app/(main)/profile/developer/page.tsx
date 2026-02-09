import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DeveloperProfileClient } from "./DeveloperProfileClient";
import { SearchIndexList } from "@/components/developer/SearchIndexList";
import { getSearchIndices } from "@/actions/search-indices";
import { CATEGORIES } from "@/lib/config/categories";

export default async function DeveloperProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id, bio, github_username")
    .eq("user_id", user.id)
    .single();

  let technologies: Array<{ id: number; name: string }> = [];
  if (devProfile) {
    const { data: devTechs } = await supabase
      .from("developer_technologies")
      .select("technology_id, technologies(id, name)")
      .eq("developer_profile_id", devProfile.id);
    technologies = (devTechs || [])
      .map((dt) => dt.technologies as unknown as { id: number; name: string })
      .filter(Boolean);
  }

  const indices = devProfile ? await getSearchIndices() : [];
  const categoryData = CATEGORIES.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-content">Developer Profile</h1>
        <p className="text-sm text-content-muted mt-1">
          Set up your developer profile to get matched with problems you can solve.
        </p>
      </div>

      <DeveloperProfileClient
        hasProfile={!!devProfile}
        initialData={devProfile ? {
          bio: devProfile.bio || "",
          github_username: devProfile.github_username || "",
          technologies,
        } : undefined}
      />

      {devProfile && (
        <SearchIndexList indices={indices} categories={categoryData} />
      )}
    </div>
  );
}
