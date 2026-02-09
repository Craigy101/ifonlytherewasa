import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run the matcher
    const { data: matchResult } = await supabase.rpc("run_post_matching");
    const newNotifications = matchResult ?? 0;

    // Fetch unsent matches with developer and post info
    const { data: unsentMatches } = await supabase
      .from("search_index_matches")
      .select(`
        id, post_id,
        search_index:search_indices!search_index_id(
          id, name,
          developer_profile:developer_profiles!developer_profile_id(
            user_id
          )
        ),
        post:posts!post_id(title, slug)
      `)
      .eq("email_sent", false)
      .limit(100);

    if (!unsentMatches || unsentMatches.length === 0) {
      return new Response(
        JSON.stringify({ newNotifications, emailsSent: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Group matches by developer user_id + index
    const grouped = new Map<string, {
      userId: string;
      indexName: string;
      posts: Array<{ title: string; slug: string }>;
      matchIds: string[];
    }>();

    for (const m of unsentMatches) {
      const si = m.search_index as unknown as { id: string; name: string; developer_profile: { user_id: string } };
      const post = m.post as unknown as { title: string; slug: string };
      const key = si.id;

      if (!grouped.has(key)) {
        grouped.set(key, {
          userId: si.developer_profile.user_id,
          indexName: si.name,
          posts: [],
          matchIds: [],
        });
      }
      grouped.get(key)!.posts.push(post);
      grouped.get(key)!.matchIds.push(m.id);
    }

    // Resolve emails and send
    const emailPayloads = [];
    const allMatchIds: string[] = [];

    for (const [, group] of grouped) {
      const { data: authUser } = await supabase.auth.admin.getUserById(group.userId);
      if (!authUser?.user?.email) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", group.userId)
        .single();

      emailPayloads.push({
        to: authUser.user.email,
        username: profile?.username || "Developer",
        indexName: group.indexName,
        posts: group.posts,
      });
      allMatchIds.push(...group.matchIds);
    }

    // Call send-match-email function
    if (emailPayloads.length > 0) {
      await supabase.functions.invoke("send-match-email", {
        body: { matches: emailPayloads },
      });

      // Mark as sent
      await supabase
        .from("search_index_matches")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .in("id", allMatchIds);
    }

    return new Response(
      JSON.stringify({ newNotifications, emailsSent: emailPayloads.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
