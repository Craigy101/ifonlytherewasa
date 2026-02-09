"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markPostSolved(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .update({
      is_solved: true,
      solved_at: new Date().toISOString(),
      solved_by: "author",
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function markPostUnsolved(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("posts")
    .update({
      is_solved: false,
      solved_at: null,
      solved_by: null,
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function voteSolved(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("solved_votes").insert({
    post_id: postId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") throw new Error("Already voted");
    throw new Error(error.message);
  }
  revalidatePath("/");
}

export async function removeSolvedVote(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("solved_votes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function incrementViewCount(postId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_post_view", { p_post_id: postId });
}
