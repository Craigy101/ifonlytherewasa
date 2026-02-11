/**
 * Seed script using @snaplet/seed + Supabase Admin API + OpenAI
 *
 * Usage: npm run seed
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                    OPENAI_API_KEY, DB_HOST, DB_USER, DB_PASSWORD
 */
import "dotenv/config";
import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ============================================================================
// ENV VALIDATION
// ============================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
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
// OPENAI CONTENT GENERATION
// ============================================================================
interface GeneratedPost {
  title: string;
  body: string;
  category_slugs: string[];
  product_type: string | null;
  weekly_pay_usd: number | null;
  time_spent_weekly: string | null;
  current_solution: string | null;
}

interface GeneratedComment {
  post_index: number;
  body: string;
  is_reply: boolean;
}

async function generatePosts(count: number, categorySlugs: string[]): Promise<GeneratedPost[]> {
  const productTypes = ["website", "app", "desktop_app", "hardware", "physical_product"];
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate seed data for "If Only There Was A" — a Reddit-like site where people post pain points and wish for products that solve them. Posts start with "If only there was a..." or describe a frustration. Body should be 2-4 paragraphs in HTML with <p> tags. Return valid JSON.`,
      },
      {
        role: "user",
        content: `Generate ${count} unique posts. Each describes a real everyday frustration. Vary across categories: ${categorySlugs.join(", ")}

Return JSON: { "posts": [{ "title": "string (10-80 chars)", "body": "string (HTML <p> tags, 2-4 paragraphs)", "category_slugs": ["1-2 from the list"], "product_type": one of ${JSON.stringify(productTypes)} or null, "weekly_pay_usd": number 0-50 or null, "time_spent_weekly": "string like '2 hours'" or null, "current_solution": "string" or null }] }`,
      },
    ],
  });
  const parsed = JSON.parse(resp.choices[0].message.content || "{}");
  return parsed.posts || [];
}

async function generateComments(postTitles: string[], count: number): Promise<GeneratedComment[]> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate realistic comments for a Reddit-like site about pain points. Comments should be helpful, empathetic, or suggest solutions. Return valid JSON.`,
      },
      {
        role: "user",
        content: `Generate ${count} comments for these posts:\n${postTitles.map((t, i) => `${i}: "${t}"`).join("\n")}\n\nReturn JSON: { "comments": [{ "post_index": number, "body": "1-3 sentences", "is_reply": boolean (30% true) }] }`,
      },
    ],
  });
  const parsed = JSON.parse(resp.choices[0].message.content || "{}");
  return parsed.comments || [];
}

// ============================================================================
// HELPERS
// ============================================================================
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ============================================================================
// MAIN
// ============================================================================
const main = async () => {
  console.log("🌱 Starting seed...\n");

  // ------------------------------------------------------------------
  // STEP 1: Init Snaplet client
  // ------------------------------------------------------------------
  const seed = await createSeedClient();

  // ------------------------------------------------------------------
  // STEP 2: Reset database (preserve categories & technologies — migration-seeded)
  // ------------------------------------------------------------------
  console.log("🗑️  Resetting database...");
  await seed.$resetDatabase();
  console.log("  ✓ Database reset\n");

  // Re-seed categories (static data from migration, wiped by reset)
  console.log("📂 Re-seeding categories...");
  const catRows = [
    { name: "Technology", slug: "technology", description: "Software, hardware, and digital tools", color: "#3B82F6", sort_order: 1 },
    { name: "Health", slug: "health", description: "Medical, fitness, and wellness solutions", color: "#10B981", sort_order: 2 },
    { name: "Education", slug: "education", description: "Learning tools and educational resources", color: "#8B5CF6", sort_order: 3 },
    { name: "Finance", slug: "finance", description: "Money management and financial tools", color: "#F59E0B", sort_order: 4 },
    { name: "Home & Living", slug: "home-living", description: "Household and lifestyle improvements", color: "#EC4899", sort_order: 5 },
    { name: "Transportation", slug: "transportation", description: "Getting around and travel", color: "#06B6D4", sort_order: 6 },
    { name: "Food & Drink", slug: "food-drink", description: "Culinary and beverage innovations", color: "#F97316", sort_order: 7 },
    { name: "Environment", slug: "environment", description: "Sustainability and green solutions", color: "#22C55E", sort_order: 8 },
    { name: "Social", slug: "social", description: "Communication and community tools", color: "#A855F7", sort_order: 9 },
    { name: "Work & Productivity", slug: "work-productivity", description: "Workplace and efficiency tools", color: "#64748B", sort_order: 10 },
    { name: "Entertainment", slug: "entertainment", description: "Fun, games, and media", color: "#EF4444", sort_order: 11 },
    { name: "Other", slug: "other", description: "Everything else", color: "#6B7280", sort_order: 99 },
  ];
  await seed.categories(catRows.map((c) => ({ ...c, icon: null })));
  console.log(`  ✓ ${catRows.length} categories\n`);

  // Re-seed technologies (static data from migration, wiped by reset)
  console.log("🔧 Re-seeding technologies...");
  const techRows = [
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "JavaScript",
    "Python", "Django", "Flask", "Ruby", "Ruby on Rails", "Go", "Rust", "Java",
    "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Swift", "Kotlin",
    "React Native", "Flutter", "Node.js", "Express", "PostgreSQL", "MySQL",
    "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure",
    "Terraform", "GraphQL", "Tailwind CSS", "Supabase", "Firebase",
  ];
  await seed.technologies(
    techRows.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      is_custom: false,
      created_by: null,
    }))
  );
  console.log(`  ✓ ${techRows.length} technologies\n`);

  // ------------------------------------------------------------------
  // STEP 3: Create auth users via Supabase Admin API
  // (triggers handle_new_user → auto-creates profile rows)
  // ------------------------------------------------------------------
  console.log("👥 Creating auth users via Supabase Admin...");
  const userIds: string[] = [];

  for (const u of USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: "password123",
      email_confirm: true,
    });
    if (error) {
      console.error(`  ✗ ${u.email}: ${error.message}`);
      process.exit(1);
    }
    userIds.push(data.user.id);
    console.log(`  ✓ ${u.email} → ${data.user.id}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 4: Update profiles with proper usernames (trigger created temp ones)
  // ------------------------------------------------------------------
  console.log("👤 Updating profile usernames...");
  for (let i = 0; i < USERS.length; i++) {
    const { error } = await admin
      .from("profiles")
      .update({ username: USERS[i].username })
      .eq("id", userIds[i]);
    if (error) console.error(`  ✗ ${USERS[i].username}: ${error.message}`);
    else console.log(`  ✓ ${USERS[i].username}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // STEP 5: Fetch categories & technologies from DB (just re-seeded above)
  // ------------------------------------------------------------------
  console.log("📂 Fetching categories & technologies...");
  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");
  if (!categories?.length) {
    console.error("  ✗ No categories found");
    process.exit(1);
  }
  const catSlugs = categories.map((c) => c.slug);

  const { data: techs } = await admin.from("technologies").select("id, slug").order("id");
  console.log(`  ✓ ${categories.length} categories, ${techs?.length || 0} technologies\n`);

  // ------------------------------------------------------------------
  // STEP 7: Generate post content with OpenAI
  // ------------------------------------------------------------------
  console.log("🤖 Generating post content with OpenAI...");
  const POST_COUNT = 25;
  const generatedPosts = await generatePosts(POST_COUNT, catSlugs);
  console.log(`  ✓ ${generatedPosts.length} posts generated\n`);

  // ------------------------------------------------------------------
  // STEP 8: Seed posts via Snaplet
  // ------------------------------------------------------------------
  console.log("📝 Seeding posts...");
  const postStore = await seed.posts(
    generatedPosts.map((gp, i) => ({
      author_id: userIds[i % userIds.length],
      title: gp.title.slice(0, 300),
      slug: slugify(gp.title) + "-" + copycat.scramble(String(i)).slice(0, 8),
      body: gp.body,
      product_type: gp.product_type as any,
      weekly_pay_usd: gp.weekly_pay_usd,
      time_spent_weekly: gp.time_spent_weekly,
      current_solution: gp.current_solution,
      view_count: 10 + Math.floor(Math.random() * 500),
      edited_at: null,
      solved_at: null,
      solved_by: null,
    }))
  );
  const postIds = postStore.posts.map((p) => p.id!).filter(Boolean);
  console.log(`  ✓ ${postIds.length} posts seeded\n`);

  // ------------------------------------------------------------------
  // STEP 9: Seed post_categories via Snaplet
  // ------------------------------------------------------------------
  console.log("🏷️  Seeding post categories...");
  const postCatInputs: { post_id: string; category_id: number }[] = [];
  for (let i = 0; i < generatedPosts.length; i++) {
    const gp = generatedPosts[i];
    const slugs = (gp.category_slugs || []).slice(0, 2);
    for (const slug of slugs) {
      const cat = categories.find((c) => c.slug === slug);
      if (cat) postCatInputs.push({ post_id: postIds[i], category_id: cat.id });
    }
    // Ensure at least one category
    if (slugs.length === 0) {
      postCatInputs.push({ post_id: postIds[i], category_id: pick(categories).id });
    }
  }
  await seed.post_categories(postCatInputs);
  console.log(`  ✓ ${postCatInputs.length} post-category links\n`);

  // ------------------------------------------------------------------
  // STEP 10: Seed reactions via Snaplet
  // ------------------------------------------------------------------
  console.log("⚡ Seeding reactions...");
  const reactionTypes = ["pay", "nice", "meh", "bad"] as const;
  const reactionWeights = [0.35, 0.35, 0.2, 0.1];
  const reactionInputs: { post_id: string; user_id: string; type: string }[] = [];
  const usedReactions = new Set<string>();

  for (const postId of postIds) {
    const reactors = pickN(userIds, 3 + Math.floor(Math.random() * 6));
    for (const userId of reactors) {
      const key = `${postId}-${userId}`;
      if (usedReactions.has(key)) continue;
      usedReactions.add(key);

      let type: typeof reactionTypes[number] = "nice";
      const r = Math.random();
      let cum = 0;
      for (let i = 0; i < reactionWeights.length; i++) {
        cum += reactionWeights[i];
        if (r < cum) { type = reactionTypes[i]; break; }
      }
      reactionInputs.push({ post_id: postId, user_id: userId, type });
    }
  }
  await seed.reactions(reactionInputs as any);
  console.log(`  ✓ ${reactionInputs.length} reactions\n`);

  // ------------------------------------------------------------------
  // STEP 11: Generate & seed comments via Snaplet
  // ------------------------------------------------------------------
  console.log("🤖 Generating comments with OpenAI...");
  const COMMENT_COUNT = 60;
  const postTitles = generatedPosts.map((p) => p.title);
  const generatedComments = await generateComments(postTitles, COMMENT_COUNT);
  console.log(`  ✓ ${generatedComments.length} comments generated\n`);

  console.log("💬 Seeding comments...");
  // First pass: top-level comments
  const topLevelInputs = generatedComments
    .filter((c) => !c.is_reply && c.post_index >= 0 && c.post_index < postIds.length)
    .map((c, i) => ({
      post_id: postIds[c.post_index],
      author_id: userIds[(c.post_index + i + 1) % userIds.length],
      body: c.body,
      parent_id: null,
      depth: 0,
    }));

  const topLevelStore = await seed.comments(topLevelInputs);
  const commentsByPost: Record<string, string[]> = {};
  for (const comment of topLevelStore.comments) {
    const pid = comment.post_id as string;
    const cid = comment.id as string;
    if (!commentsByPost[pid]) commentsByPost[pid] = [];
    commentsByPost[pid].push(cid);
  }

  // Second pass: replies
  const replyInputs = generatedComments
    .filter((c) => c.is_reply && c.post_index >= 0 && c.post_index < postIds.length)
    .map((c, i) => {
      const postId = postIds[c.post_index];
      const parentCandidates = commentsByPost[postId] || [];
      const parentId: string | null = parentCandidates.length > 0 ? pick(parentCandidates) : null;
      return {
        post_id: postId,
        author_id: userIds[(c.post_index + i + 2) % userIds.length],
        body: c.body,
        parent_id: parentId,
        depth: parentId ? 1 : 0,
      };
    });

  let replyStore = { comments: [] as any[] };
  if (replyInputs.length > 0) {
    replyStore = await seed.comments(replyInputs as any);
  }

  const allCommentIds = [
    ...topLevelStore.comments.map((c) => c.id),
    ...replyStore.comments.map((c) => c.id),
  ];
  console.log(`  ✓ ${allCommentIds.length} comments (${topLevelStore.comments.length} top-level, ${replyStore.comments.length} replies)\n`);

  // ------------------------------------------------------------------
  // STEP 12: Seed comment likes via Snaplet
  // ------------------------------------------------------------------
  console.log("👍 Seeding comment likes...");
  const likeInputs: { comment_id: string; user_id: string }[] = [];
  const usedLikes = new Set<string>();

  for (const commentId of allCommentIds) {
    const likers = pickN(userIds, Math.floor(Math.random() * 5));
    for (const userId of likers) {
      const key = `${commentId}-${userId}`;
      if (usedLikes.has(key)) continue;
      usedLikes.add(key);
      likeInputs.push({ comment_id: commentId, user_id: userId });
    }
  }
  if (likeInputs.length > 0) await seed.comment_likes(likeInputs);
  console.log(`  ✓ ${likeInputs.length} comment likes\n`);

  // ------------------------------------------------------------------
  // STEP 13: Seed bookmarks via Snaplet
  // ------------------------------------------------------------------
  console.log("🔖 Seeding bookmarks...");
  const bookmarkInputs: { post_id: string; user_id: string }[] = [];
  const usedBookmarks = new Set<string>();

  for (const userId of userIds) {
    const posts = pickN(postIds, 2 + Math.floor(Math.random() * 5));
    for (const postId of posts) {
      const key = `${postId}-${userId}`;
      if (usedBookmarks.has(key)) continue;
      usedBookmarks.add(key);
      bookmarkInputs.push({ post_id: postId, user_id: userId });
    }
  }
  await seed.bookmarks(bookmarkInputs);
  console.log(`  ✓ ${bookmarkInputs.length} bookmarks\n`);

  // ------------------------------------------------------------------
  // STEP 14: Seed solved votes via Snaplet
  // ------------------------------------------------------------------
  console.log("✅ Seeding solved votes...");
  const solvedPostIds = pickN(postIds, Math.floor(postIds.length * 0.3));
  const solvedVoteInputs: { post_id: string; user_id: string }[] = [];
  const usedVotes = new Set<string>();

  for (const postId of solvedPostIds) {
    const postIdx = postIds.indexOf(postId);
    const authorId = userIds[postIdx % userIds.length];
    const voters = userIds.filter((id) => id !== authorId);
    const selectedVoters = pickN(voters, 2 + Math.floor(Math.random() * 4));
    for (const userId of selectedVoters) {
      const key = `${postId}-${userId}`;
      if (usedVotes.has(key)) continue;
      usedVotes.add(key);
      solvedVoteInputs.push({ post_id: postId, user_id: userId });
    }
  }
  if (solvedVoteInputs.length > 0) await seed.solved_votes(solvedVoteInputs);
  console.log(`  ✓ ${solvedVoteInputs.length} solved votes\n`);

  // ------------------------------------------------------------------
  // STEP 15: Seed notifications via Snaplet
  // ------------------------------------------------------------------
  console.log("🔔 Seeding notifications...");
  const notifInputs: {
    recipient_id: string;
    actor_id: string;
    type: string;
    post_id: string | null;
    comment_id: string | null;
    is_read: boolean;
    search_index_id: null;
  }[] = [];

  for (const [postId, commentIds] of Object.entries(commentsByPost)) {
    const postIdx = postIds.indexOf(postId);
    if (postIdx === -1) continue;
    const postAuthorId = userIds[postIdx % userIds.length];

    for (let i = 0; i < Math.min(2, commentIds.length); i++) {
      const commenterId = userIds[(postIdx + i + 1) % userIds.length];
      if (commenterId === postAuthorId) continue;
      notifInputs.push({
        recipient_id: postAuthorId,
        actor_id: commenterId,
        type: "reply_post",
        post_id: postId,
        comment_id: commentIds[i],
        is_read: Math.random() < 0.5,
        search_index_id: null,
      });
    }
  }
  if (notifInputs.length > 0) await seed.notifications(notifInputs as any);
  console.log(`  ✓ ${notifInputs.length} notifications\n`);

  // ------------------------------------------------------------------
  // STEP 16: Seed developer profiles via Snaplet
  // ------------------------------------------------------------------
  console.log("🧑‍💻 Seeding developer profiles...");
  const devBios = [
    "Full-stack developer passionate about solving real user problems.",
    "Backend engineer building tools that make developers' lives easier.",
    "Designer & developer creating beautiful, functional products.",
  ];
  const devStore = await seed.developer_profiles(
    userIds.slice(0, 3).map((userId, i) => ({
      user_id: userId,
      bio: devBios[i],
      github_username: USERS[i].username,
      stripe_customer_id: null,
    }))
  );
  const devProfileIds = devStore.developer_profiles.map((d) => d.id!).filter(Boolean);
  console.log(`  ✓ ${devProfileIds.length} developer profiles\n`);

  // ------------------------------------------------------------------
  // STEP 17: Seed developer technologies via Snaplet
  // ------------------------------------------------------------------
  console.log("🔧 Linking developer technologies...");
  const techSets = [
    ["react", "nextjs", "typescript", "tailwind-css", "supabase", "nodejs"],
    ["python", "django", "postgresql", "docker", "aws"],
    ["vuejs", "typescript", "graphql", "firebase", "flutter"],
  ];
  const devTechInputs: { developer_profile_id: string; technology_id: number }[] = [];

  if (techs?.length) {
    for (let i = 0; i < devProfileIds.length; i++) {
      for (const slug of techSets[i]) {
        const tech = techs.find((t) => t.slug === slug);
        if (tech) {
          devTechInputs.push({
            developer_profile_id: devProfileIds[i],
            technology_id: tech.id,
          });
        }
      }
    }
  }
  if (devTechInputs.length > 0) await seed.developer_technologies(devTechInputs);
  console.log(`  ✓ ${devTechInputs.length} tech links\n`);

  // ------------------------------------------------------------------
  // STEP 18: Seed search indices via Snaplet
  // ------------------------------------------------------------------
  console.log("🔍 Seeding search indices...");
  const techCatId = categories.find((c) => c.slug === "technology")?.id;
  const healthCatId = categories.find((c) => c.slug === "health")?.id;

  const searchIndexInputs = [
    {
      developer_profile_id: devProfileIds[0],
      name: "SaaS Pain Points",
      product_types: ["website", "app"],
      keyword_patterns: ["saas", "subscription", "dashboard", "analytics"],
      category_ids: techCatId ? [techCatId] : [],
      is_active: true,
      is_free: true,
      min_pay_reactions: null,
      min_weekly_pay_usd: null,
      stripe_subscription_id: null,
    },
    {
      developer_profile_id: devProfileIds[1],
      name: "Health Tech Opportunities",
      product_types: ["app", "website"],
      keyword_patterns: ["health", "fitness", "medical", "wellness"],
      category_ids: healthCatId ? [healthCatId] : [],
      is_active: true,
      is_free: true,
      min_pay_reactions: null,
      min_weekly_pay_usd: null,
      stripe_subscription_id: null,
    },
  ];
  await seed.search_indices(searchIndexInputs as any);
  console.log(`  ✓ ${searchIndexInputs.length} search indices\n`);

  // ------------------------------------------------------------------
  // STEP 19: Mark a few posts as author-solved
  // ------------------------------------------------------------------
  console.log("🏆 Marking posts as author-solved...");
  const authorSolvedPosts = pickN(postIds, 3);
  for (const postId of authorSolvedPosts) {
    await admin.from("posts").update({
      is_solved: true,
      solved_at: new Date().toISOString(),
      solved_by: "author",
    }).eq("id", postId);
  }
  console.log(`  ✓ ${authorSolvedPosts.length} posts marked solved\n`);

  // ------------------------------------------------------------------
  // DONE
  // ------------------------------------------------------------------
  console.log("✅ Seed complete!");
  console.log(`   ${userIds.length} users`);
  console.log(`   ${postIds.length} posts`);
  console.log(`   ${postCatInputs.length} post-category links`);
  console.log(`   ${reactionInputs.length} reactions`);
  console.log(`   ${allCommentIds.length} comments`);
  console.log(`   ${likeInputs.length} comment likes`);
  console.log(`   ${bookmarkInputs.length} bookmarks`);
  console.log(`   ${solvedVoteInputs.length} solved votes`);
  console.log(`   ${notifInputs.length} notifications`);
  console.log(`   ${devProfileIds.length} developer profiles`);
  console.log(`   ${devTechInputs.length} dev-tech links`);
  console.log(`   2 search indices`);
  console.log(`\n   All users password: password123`);

  process.exit();
};

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
