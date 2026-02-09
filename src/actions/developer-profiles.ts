"use server";

import { createClient } from "@/lib/supabase/server";
import { createDeveloperProfileSchema } from "@/lib/validators/developer-profile";
import { revalidatePath } from "next/cache";

export async function createDeveloperProfile(formData: {
  bio?: string;
  github_username?: string;
  technology_ids: number[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createDeveloperProfileSchema.parse(formData);

  // Check if already has a developer profile
  const { data: existing } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) throw new Error("Developer profile already exists");

  const { data: profile, error } = await supabase
    .from("developer_profiles")
    .insert({
      user_id: user.id,
      bio: parsed.bio || null,
      github_username: parsed.github_username || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Insert technology associations
  if (parsed.technology_ids.length > 0) {
    await supabase.from("developer_technologies").insert(
      parsed.technology_ids.map((tid) => ({
        developer_profile_id: profile.id,
        technology_id: tid,
      }))
    );
  }

  revalidatePath("/profile/developer");
  return { id: profile.id };
}

export async function updateDeveloperProfile(formData: {
  bio?: string;
  github_username?: string;
  technology_ids: number[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createDeveloperProfileSchema.parse(formData);

  const { data: profile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) throw new Error("Developer profile not found");

  const { error } = await supabase
    .from("developer_profiles")
    .update({
      bio: parsed.bio || null,
      github_username: parsed.github_username || null,
    })
    .eq("id", profile.id);

  if (error) throw new Error(error.message);

  // Replace technology associations
  await supabase
    .from("developer_technologies")
    .delete()
    .eq("developer_profile_id", profile.id);

  if (parsed.technology_ids.length > 0) {
    await supabase.from("developer_technologies").insert(
      parsed.technology_ids.map((tid) => ({
        developer_profile_id: profile.id,
        technology_id: tid,
      }))
    );
  }

  revalidatePath("/profile/developer");
}

export async function searchTechnologies(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("technologies")
    .select("id, name, slug")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(20);

  return data || [];
}

export async function addCustomTechnology(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 50) throw new Error("Invalid technology name");

  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Check if already exists
  const { data: existing } = await supabase
    .from("technologies")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("technologies")
    .insert({ name: trimmed, slug, is_custom: true, created_by: user.id })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
