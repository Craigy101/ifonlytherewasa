"use server";

import { createClient } from "@/lib/supabase/server";
import { createSearchIndexSchema } from "@/lib/validators/developer-profile";
import { revalidatePath } from "next/cache";

export async function createSearchIndex(formData: {
  name: string;
  product_types: string[];
  category_ids: number[];
  keyword_patterns: string[];
  min_pay_reactions?: number | null;
  min_weekly_pay_usd?: number | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createSearchIndexSchema.parse(formData);

  // Get developer profile
  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) throw new Error("Developer profile required");

  // Check if free slot is available
  const { data: existingIndices } = await supabase
    .from("search_indices")
    .select("id, is_free")
    .eq("developer_profile_id", devProfile.id);

  const hasFreeIndex = existingIndices?.some((i) => i.is_free);
  const isFree = !hasFreeIndex; // First index is free

  const { data: index, error } = await supabase
    .from("search_indices")
    .insert({
      developer_profile_id: devProfile.id,
      name: parsed.name,
      product_types: parsed.product_types,
      category_ids: parsed.category_ids,
      keyword_patterns: parsed.keyword_patterns.filter(Boolean),
      min_pay_reactions: parsed.min_pay_reactions ?? null,
      min_weekly_pay_usd: parsed.min_weekly_pay_usd ?? null,
      is_free: isFree,
      is_active: isFree, // Free indices are active immediately; paid ones need Stripe
    })
    .select("id, is_free")
    .single();

  if (error) throw new Error(error.message);

  // Run first scan immediately for active indices
  if (isFree) {
    try {
      await supabase.rpc("run_post_matching");
    } catch {
      // Non-blocking: first scan failure shouldn't prevent index creation
    }
  }

  revalidatePath("/profile/developer");
  return { id: index.id, isFree: index.is_free };
}

export async function updateSearchIndex(
  indexId: string,
  formData: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions?: number | null;
    min_weekly_pay_usd?: number | null;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createSearchIndexSchema.parse(formData);

  const { error } = await supabase
    .from("search_indices")
    .update({
      name: parsed.name,
      product_types: parsed.product_types,
      category_ids: parsed.category_ids,
      keyword_patterns: parsed.keyword_patterns.filter(Boolean),
      min_pay_reactions: parsed.min_pay_reactions ?? null,
      min_weekly_pay_usd: parsed.min_weekly_pay_usd ?? null,
    })
    .eq("id", indexId);

  if (error) throw new Error(error.message);
  revalidatePath("/profile/developer");
}

export async function deleteSearchIndex(indexId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("search_indices")
    .delete()
    .eq("id", indexId);

  if (error) throw new Error(error.message);
  revalidatePath("/profile/developer");
}

export async function getSearchIndices() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: devProfile } = await supabase
    .from("developer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!devProfile) return [];

  const { data } = await supabase
    .from("search_indices")
    .select("*")
    .eq("developer_profile_id", devProfile.id)
    .order("created_at", { ascending: false });

  return data || [];
}
