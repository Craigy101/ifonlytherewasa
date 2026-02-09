import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ============================================================================
// ENV & CLIENTS
// ============================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY — needed for generating seed content");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ============================================================================
// USER DATA
// ============================================================================
const USERS = [
  { email: "alice@example.com", username: "alice_dev" },
  { email: "bob@example.com", username: "bob_builder" },
  { email: "carol@example.com", username: "carol_codes" },
  { email: "dave@example.com", username: "dave_designs" },
  { email: "eve@example.com", username: "eve_explores" },
  { email: "frank@example.com", username: "frank_fixes" },
  { email: "grace@example.com", username: "grace_grows" },
  { email: "hank@example.com", username: "hank_hacks" },
  { email: "iris@example.com", username: "iris_invents" },
  { email: "jack@example.com", username: "jack_builds" },
];

// ============================================================================
// OPENAI HELPERS
// ============================================================================
async function generatePosts(
  count: number,
  categories: { id: number; name: string; slug: string }[]
): Promise<
  {
    title: string;
    body: string;
    category_slugs: string[];
    product_type: string | null;
    weekly_pay_usd: number | null;
    time_spent_weekly: string | null;
    current_solution: string | null;
  }[]
> {
  const catNames = categories.map((c) => c.slug).join(", ");
  const productTypes = ["website", "app", "desktop_app", "hardware", "physical_product"];

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate seed data for "If Only There Was A" — a Reddit-like site where people post pain points (frustrations with how things currently work) and wish for a product/tool/service that solves them. Posts start with "If only there was a..." or describe a pain point. The body should be 2-4 paragraphs of realistic detail. Return valid JSON.`,
      },
      {
        role: "user",
        content: `Generate ${count} unique, creative posts. Each post should describe a real everyday frustration or pain point. Vary topics across these categories: ${catNames}

For each post return:
- title: string (10-80 chars, expressive, like "If only there was a way to..." or a pain point statement)
- body: string (2-4 paragraphs, HTML formatted with <p> tags, realistic detail about the problem and what a solution would look like)
- category_slugs: string[] (1-2 from: ${catNames})
- product_type: one of ${JSON.stringify(productTypes)} or null
- weekly_pay_usd: number (0-50) or null — how much they'd pay weekly for a solution
- time_spent_weekly: string like "2 hours" or "30 minutes" or null — time wasted on this problem weekly
- current_solution: string or null — what they currently do as a workaround

Return as JSON: { "posts": [...] }`,
      },
    ],
  });

  const parsed = JSON.parse(resp.choices[0].message.content || "{}");
  return parsed.posts || [];
}

async function generateComments(
  postTitles: string[],
  count: number
): Promise<{ post_index: number; body: string; is_reply: boolean }[]> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate realistic comments for a Reddit-like site about pain points and product ideas. Comments should be helpful, empathetic, suggest solutions, share similar experiences, or offer constructive feedback. Return valid JSON.`,
      },
      {
        role: "user",
        content: `Generate ${count} comments spread across these posts:
${postTitles.map((t, i) => `${i}: "${t}"`).join("\n")}

For each comment return:
- post_index: number (index of the post above)
- body: string (1-3 sentences, natural and conversational)
- is_reply: boolean (true if this should be a reply to another comment on the same post, about 30% should be replies)

Return as JSON: { "comments": [...] }`,
      },
    ],
  });

  const parsed = JSON.parse(resp.choices[0].message.content || "{}");
  return parsed.comments || [];
}

// ============================================================================
// SLUG HELPER
// ============================================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ============================================================================
// MAIN SEED
// ============================================================================
async function main() {
  console.log("🌱 Starting seed...\n");

  // ------------------------------------------------------------------
  // STEP 1: Clean up existing data (reverse dependency order)
  // ------------------------------------------------------------------
  console.log("🗑️  Cleaning existing data...");
  const tablesToClean = [
    "search_index_matches",
    "search_indices",
    "developer_technologies",
    "developer_profiles",
    "notifications",
    "comment_likes",
    "comments",
    "bookmarks",
    "solved_votes",
    "reactions",
    "post_categories",
    "posts",
    "profiles",
  ];

  for (const table of tablesToClean) {
    const { error } = await admin.from(table).delete().neq("created_at", "1970-01-01");
    if (error) console.warn(`  Warning cleaning ${table}: ${error.message}`);
    else console.log(`  ✓ Cleaned ${table}`);
  }

  // Clean auth users
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  for (const u of existingUsers?.users || []) {
    await admin.auth.admin.deleteUser(u.id);
  }
  console.log(`  ✓ Cleaned auth users\n`);

  // ------------------------------------------------------------------
  // STEP 2: Create auth users (trigger auto-creates profiles)
  // ------------------------------------------------------------------
  console.log("👥 Creating auth users...");
  const userIds: string[] = [];

  for (const u of USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: "password123",
      email_confirm: true,
    });
    if (error) {
      console.error(`  ✗ Failed to create ${u.email}: ${error.message}`);
      process.exit(1);
    }
    userIds.push(data.user.id);
    console.log(`  ✓ Created ${u.email} → ${data.user.id}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 3: Update profiles with proper usernames
  // ------------------------------------------------------------------
  console.log("👤 Updating profiles...");
  for (let i = 0; i < USERS.length; i++) {
    const { error } = await admin
      .from("profiles")
      .update({ username: USERS[i].username })
      .eq("id", userIds[i]);
    if (error) console.error(`  ✗ Profile update failed for ${USERS[i].username}: ${error.message}`);
    else console.log(`  ✓ ${USERS[i].username}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 4: Fetch categories (already seeded by migration)
  // ------------------------------------------------------------------
  console.log("📂 Fetching categories...");
  const { data: categories, error: catErr } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");
  if (catErr || !categories?.length) {
    console.error("  ✗ No categories found — did migrations run?", catErr);
    process.exit(1);
  }
  console.log(`  ✓ Found ${categories.length} categories\n`);

  // ------------------------------------------------------------------
  // STEP 5: Generate & insert posts via OpenAI
  // ------------------------------------------------------------------
  console.log("📝 Generating posts with OpenAI...");
  const POST_COUNT = 25;
  const generatedPosts = await generatePosts(POST_COUNT, categories);
  console.log(`  ✓ Generated ${generatedPosts.length} posts\n`);

  console.log("💾 Inserting posts...");
  const postIds: string[] = [];
  const postTitles: string[] = [];
  const postAuthorIds: string[] = [];

  for (let i = 0; i < generatedPosts.length; i++) {
    const p = generatedPosts[i];
    const authorId = userIds[i % userIds.length];
    const slug = slugify(p.title) + "-" + Date.now().toString(36) + i;

    const { data: post, error } = await admin
      .from("posts")
      .insert({
        author_id: authorId,
        title: p.title,
        slug,
        body: p.body,
        product_type: p.product_type as any,
        weekly_pay_usd: p.weekly_pay_usd,
        time_spent_weekly: p.time_spent_weekly,
        current_solution: p.current_solution,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  ✗ Post insert failed: ${error.message} — title: "${p.title}"`);
      continue;
    }

    postIds.push(post.id);
    postTitles.push(p.title);
    postAuthorIds.push(authorId);

    // Link categories
    const catSlugs = p.category_slugs || [];
    for (const cs of catSlugs) {
      const cat = categories.find((c) => c.slug === cs);
      if (cat) {
        await admin.from("post_categories").insert({ post_id: post.id, category_id: cat.id });
      }
    }

    console.log(`  ✓ [${i + 1}/${generatedPosts.length}] "${p.title.slice(0, 50)}..."`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 6: Generate & insert comments
  // ------------------------------------------------------------------
  console.log("💬 Generating comments with OpenAI...");
  const COMMENT_COUNT = 60;
  const generatedComments = await generateComments(postTitles, COMMENT_COUNT);
  console.log(`  ✓ Generated ${generatedComments.length} comments\n`);

  console.log("💾 Inserting comments...");
  // Track inserted comments by post_index for threading
  const commentsByPost: Record<number, string[]> = {};

  for (let i = 0; i < generatedComments.length; i++) {
    const c = generatedComments[i];
    const postIdx = c.post_index;
    if (postIdx < 0 || postIdx >= postIds.length) continue;

    const postId = postIds[postIdx];
    // Pick a commenter that isn't the post author
    const commenterId = userIds[(postIdx + i + 1) % userIds.length];

    let parentId: string | null = null;
    let depth = 0;

    // If this is a reply and there are existing comments on this post, pick one as parent
    if (c.is_reply && commentsByPost[postIdx]?.length) {
      parentId =
        commentsByPost[postIdx][Math.floor(Math.random() * commentsByPost[postIdx].length)];
      depth = 1; // Keep it simple — depth 1 for replies
    }

    const { data: comment, error } = await admin
      .from("comments")
      .insert({
        post_id: postId,
        author_id: commenterId,
        body: c.body,
        parent_id: parentId,
        depth,
      })
      .select("id")
      .single();

    if (error) {
      console.warn(`  ⚠ Comment insert failed: ${error.message}`);
      continue;
    }

    if (!commentsByPost[postIdx]) commentsByPost[postIdx] = [];
    commentsByPost[postIdx].push(comment.id);
  }
  console.log(`  ✓ Inserted comments\n`);

  // ------------------------------------------------------------------
  // STEP 7: Add reactions to posts
  // ------------------------------------------------------------------
  console.log("⚡ Adding reactions...");
  const reactionTypes = ["pay", "nice", "meh", "bad"] as const;
  let reactionCount = 0;

  for (const postId of postIds) {
    // Each post gets 3-8 random reactions from different users
    const numReactions = 3 + Math.floor(Math.random() * 6);
    const shuffled = [...userIds].sort(() => Math.random() - 0.5).slice(0, numReactions);

    for (const userId of shuffled) {
      // Weighted: more pay/nice, fewer meh/bad
      const weights = [0.35, 0.35, 0.2, 0.1];
      const r = Math.random();
      let type: (typeof reactionTypes)[number] = "nice";
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (r < cumulative) {
          type = reactionTypes[i];
          break;
        }
      }

      const { error } = await admin
        .from("reactions")
        .insert({ post_id: postId, user_id: userId, type });
      if (!error) reactionCount++;
    }
  }
  console.log(`  ✓ Added ${reactionCount} reactions\n`);

  // ------------------------------------------------------------------
  // STEP 8: Add comment likes
  // ------------------------------------------------------------------
  console.log("👍 Adding comment likes...");
  let likeCount = 0;
  const allCommentIds = Object.values(commentsByPost).flat();

  for (const commentId of allCommentIds) {
    // Each comment gets 0-4 likes
    const numLikes = Math.floor(Math.random() * 5);
    const shuffled = [...userIds].sort(() => Math.random() - 0.5).slice(0, numLikes);

    for (const userId of shuffled) {
      const { error } = await admin
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: userId });
      if (!error) likeCount++;
    }
  }
  console.log(`  ✓ Added ${likeCount} comment likes\n`);

  // ------------------------------------------------------------------
  // STEP 9: Add bookmarks
  // ------------------------------------------------------------------
  console.log("🔖 Adding bookmarks...");
  let bookmarkCount = 0;

  for (const userId of userIds) {
    // Each user bookmarks 2-6 random posts
    const numBookmarks = 2 + Math.floor(Math.random() * 5);
    const shuffled = [...postIds].sort(() => Math.random() - 0.5).slice(0, numBookmarks);

    for (const postId of shuffled) {
      const { error } = await admin
        .from("bookmarks")
        .insert({ post_id: postId, user_id: userId });
      if (!error) bookmarkCount++;
    }
  }
  console.log(`  ✓ Added ${bookmarkCount} bookmarks\n`);

  // ------------------------------------------------------------------
  // STEP 10: Add solved votes (some posts get community solved)
  // ------------------------------------------------------------------
  console.log("✅ Adding solved votes...");
  let solvedVoteCount = 0;
  // Pick ~30% of posts to have solved votes
  const postsToSolve = postIds
    .filter(() => Math.random() < 0.3)
    .slice(0, 8);

  for (const postId of postsToSolve) {
    // Find the author so we don't let them vote
    const postIdx = postIds.indexOf(postId);
    const authorId = postAuthorIds[postIdx];
    const voters = userIds.filter((id) => id !== authorId);
    const numVotes = 2 + Math.floor(Math.random() * 4);
    const shuffled = voters.sort(() => Math.random() - 0.5).slice(0, numVotes);

    for (const userId of shuffled) {
      const { error } = await admin
        .from("solved_votes")
        .insert({ post_id: postId, user_id: userId });
      if (!error) solvedVoteCount++;
    }
  }
  console.log(`  ✓ Added ${solvedVoteCount} solved votes\n`);

  // ------------------------------------------------------------------
  // STEP 11: Add view counts to posts
  // ------------------------------------------------------------------
  console.log("👀 Setting view counts...");
  for (const postId of postIds) {
    const views = 10 + Math.floor(Math.random() * 500);
    await admin.from("posts").update({ view_count: views }).eq("id", postId);
  }
  console.log(`  ✓ Set view counts for ${postIds.length} posts\n`);

  // ------------------------------------------------------------------
  // STEP 12: Create notifications
  // ------------------------------------------------------------------
  console.log("🔔 Creating notifications...");
  let notifCount = 0;

  // Create reply_post notifications for each post's first commenter
  for (const [postIdxStr, commentIds] of Object.entries(commentsByPost)) {
    const postIdx = parseInt(postIdxStr);
    if (commentIds.length === 0) continue;

    const postAuthorId = postAuthorIds[postIdx];
    // Notify post author about the first 2 comments
    for (let i = 0; i < Math.min(2, commentIds.length); i++) {
      const commenterId = userIds[(postIdx + i + 1) % userIds.length];
      if (commenterId === postAuthorId) continue;

      const { error } = await admin.from("notifications").insert({
        recipient_id: postAuthorId,
        actor_id: commenterId,
        type: "reply_post",
        post_id: postIds[postIdx],
        comment_id: commentIds[i],
        is_read: Math.random() < 0.5,
      });
      if (!error) notifCount++;
    }
  }
  console.log(`  ✓ Created ${notifCount} notifications\n`);

  // ------------------------------------------------------------------
  // STEP 13: Create developer profiles (for 3 users)
  // ------------------------------------------------------------------
  console.log("🧑‍💻 Creating developer profiles...");
  const devUsers = userIds.slice(0, 3); // alice, bob, carol
  const devProfileIds: string[] = [];

  for (let i = 0; i < devUsers.length; i++) {
    const { data, error } = await admin
      .from("developer_profiles")
      .insert({
        user_id: devUsers[i],
        bio: [
          "Full-stack developer passionate about solving real user problems.",
          "Backend engineer building tools that make developers' lives easier.",
          "Designer & developer creating beautiful, functional products.",
        ][i],
        github_username: [USERS[0].username, USERS[1].username, USERS[2].username][i],
      })
      .select("id")
      .single();

    if (error) {
      console.warn(`  ⚠ Dev profile failed: ${error.message}`);
      continue;
    }
    devProfileIds.push(data.id);
    console.log(`  ✓ Dev profile for ${USERS[i].username}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 14: Link developers to technologies
  // ------------------------------------------------------------------
  console.log("🔧 Linking technologies...");
  const { data: techs } = await admin.from("technologies").select("id, slug").order("id");

  if (techs?.length && devProfileIds.length) {
    const techSets = [
      ["react", "nextjs", "typescript", "tailwind-css", "supabase", "nodejs"],
      ["python", "django", "postgresql", "docker", "aws"],
      ["vuejs", "typescript", "graphql", "firebase", "flutter"],
    ];

    for (let i = 0; i < devProfileIds.length; i++) {
      for (const slug of techSets[i]) {
        const tech = techs.find((t) => t.slug === slug);
        if (tech) {
          await admin.from("developer_technologies").insert({
            developer_profile_id: devProfileIds[i],
            technology_id: tech.id,
          });
        }
      }
    }
    console.log(`  ✓ Linked tech stacks\n`);
  }

  // ------------------------------------------------------------------
  // STEP 15: Create search indices for developers
  // ------------------------------------------------------------------
  console.log("🔍 Creating search indices...");
  if (devProfileIds.length) {
    const searchIndices = [
      {
        developer_profile_id: devProfileIds[0],
        name: "SaaS Pain Points",
        product_types: ["website", "app"],
        keyword_patterns: ["saas", "subscription", "dashboard", "analytics"],
        category_ids: categories.filter((c) => ["technology", "work-productivity"].includes(c.slug)).map((c) => c.id),
        is_active: true,
        is_free: true,
      },
      {
        developer_profile_id: devProfileIds[1],
        name: "Health Tech Opportunities",
        product_types: ["app", "website"],
        keyword_patterns: ["health", "fitness", "medical", "wellness"],
        category_ids: categories.filter((c) => c.slug === "health").map((c) => c.id),
        is_active: true,
        is_free: true,
      },
    ];

    for (const si of searchIndices) {
      const { error } = await admin.from("search_indices").insert(si);
      if (error) console.warn(`  ⚠ Search index failed: ${error.message}`);
      else console.log(`  ✓ "${si.name}"`);
    }
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 16: Mark some posts as author-solved
  // ------------------------------------------------------------------
  console.log("🏆 Marking some posts as author-solved...");
  const authorSolvedPosts = postIds.filter(() => Math.random() < 0.15).slice(0, 3);
  for (const postId of authorSolvedPosts) {
    await admin.from("posts").update({
      is_solved: true,
      solved_at: new Date().toISOString(),
      solved_by: "author",
    }).eq("id", postId);
  }
  console.log(`  ✓ Marked ${authorSolvedPosts.length} posts as author-solved\n`);

  // ------------------------------------------------------------------
  // DONE
  // ------------------------------------------------------------------
  console.log("✅ Seed complete!");
  console.log(`   ${userIds.length} users`);
  console.log(`   ${postIds.length} posts`);
  console.log(`   ${allCommentIds.length} comments`);
  console.log(`   ${reactionCount} reactions`);
  console.log(`   ${likeCount} comment likes`);
  console.log(`   ${bookmarkCount} bookmarks`);
  console.log(`   ${solvedVoteCount} solved votes`);
  console.log(`   ${notifCount} notifications`);
  console.log(`   ${devProfileIds.length} developer profiles`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
