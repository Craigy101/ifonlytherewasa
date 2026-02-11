import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PRODUCT_TYPE_LABELS } from "@/lib/feed-filters";
import type { ProductType } from "@/lib/feed-filters";

interface PostAuthor {
  username: string | null;
  avatar_url: string | null;
}

interface PostCategory {
  name: string;
  slug: string;
  color: string | null;
}

export interface PostCardData {
  id: string;
  title: string;
  slug: string;
  body: string;
  created_at: string;
  reaction_pay: number;
  reaction_nice: number;
  reaction_meh: number;
  reaction_bad: number;
  comment_count: number;
  is_solved?: boolean;
  weekly_pay_usd?: number | null;
  time_spent_weekly?: string | null;
  current_solution?: string | null;
  product_type?: ProductType | null;
  author: PostAuthor;
  categories: PostCategory[] | { category: PostCategory }[];
}

interface PostCardProps {
  post: PostCardData;
}

const REACTION_ICONS: Record<string, string> = {
  pay: "\uD83D\uDCB0",
  nice: "\uD83D\uDE0D",
  meh: "\uD83D\uDE10",
  bad: "\uD83D\uDC4E",
};

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
}

function getTopReaction(post: PostCardData): { icon: string; count: number } | null {
  const reactions = [
    { key: "pay", count: post.reaction_pay },
    { key: "nice", count: post.reaction_nice },
    { key: "meh", count: post.reaction_meh },
    { key: "bad", count: post.reaction_bad },
  ];

  const top = reactions.reduce((a, b) => (b.count > a.count ? b : a));
  if (top.count === 0) return null;
  return { icon: REACTION_ICONS[top.key], count: top.count };
}

function normalizeCategories(
  categories: PostCategory[] | { category: PostCategory }[]
): PostCategory[] {
  if (categories.length === 0) return [];
  const first = categories[0];
  if ("category" in first) {
    return (categories as { category: PostCategory }[]).map((c) => c.category);
  }
  return categories as PostCategory[];
}

export function PostCard({ post }: PostCardProps) {
  const totalReactions =
    post.reaction_pay +
    post.reaction_nice +
    post.reaction_meh +
    post.reaction_bad;

  const bodyPreview = stripHtml(post.body).slice(0, 150);
  const topReaction = getTopReaction(post);
  const categories = normalizeCategories(post.categories);
  const hasPainData = post.weekly_pay_usd || post.time_spent_weekly || post.current_solution || post.product_type;

  return (
    <Link href={`/post/${post.slug}`} className="block">
      <Card hover className="p-4">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar
            username={post.author.username || "Anonymous"}
            avatarUrl={post.author.avatar_url ?? undefined}
            size="sm"
          />
          <span className="text-sm font-medium text-content-secondary">
            {post.author.username || "Anonymous"}
          </span>
          <span className="text-content-muted text-xs">&middot;</span>
          <span className="text-xs text-content-muted" suppressHydrationWarning>
            {getRelativeTime(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-content-muted text-xs italic">
              If only there was a...
            </span>
            {post.is_solved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Solved
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-content mt-0.5 line-clamp-2">
            {post.title}
          </h3>
        </div>

        {/* Body preview */}
        {bodyPreview && (
          <p className="text-sm text-content-secondary mt-2 line-clamp-2">
            {bodyPreview}
          </p>
        )}

        {/* Pain point data chips */}
        {hasPainData && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.product_type && (
              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {PRODUCT_TYPE_LABELS[post.product_type]}
              </span>
            )}
            {!!post.weekly_pay_usd && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                ${post.weekly_pay_usd}/wk
              </span>
            )}
            {post.time_spent_weekly && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {post.time_spent_weekly}
              </span>
            )}
            {post.current_solution && (
              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 max-w-[200px] truncate">
                {post.current_solution}
              </span>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {categories.map((category) => (
              <Badge key={category.slug} color={category.color || "#666666"}>
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-content-muted">
          {totalReactions > 0 && (
            <span className="flex items-center gap-1.5">
              {topReaction && (
                <span className="text-lg">{topReaction.icon}</span>
              )}
              <span>{totalReactions}</span>
            </span>
          )}
          {post.comment_count > 0 && (
            <span className="text-content-secondary hover:text-content transition-colors">
              See {post.comment_count} comment{post.comment_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
