"use server";

import { createClient } from "@/lib/supabase/server";
import { createCommentSchema } from "@/lib/validators/comment";
import { revalidatePath } from "next/cache";

export async function createComment(data: {
  body: string;
  post_id: string;
  parent_id?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createCommentSchema.parse(data);

  let depth = 0;
  if (parsed.parent_id) {
    const { data: parent } = await supabase
      .from("comments")
      .select("depth")
      .eq("id", parsed.parent_id)
      .single();
    depth = (parent?.depth ?? 0) + 1;
  }

  const { error } = await supabase.from("comments").insert({
    post_id: parsed.post_id,
    author_id: user.id,
    parent_id: parsed.parent_id || null,
    body: parsed.body,
    depth,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/`);
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
