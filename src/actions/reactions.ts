"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleReaction(postId: string, type: "pay" | "nice" | "meh" | "bad") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("reactions")
    .select("id, type")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    if (existing.type === type) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").update({ type }).eq("id", existing.id);
    }
  } else {
    await supabase.from("reactions").insert({ user_id: user.id, post_id: postId, type });
  }

  revalidatePath("/");
}
