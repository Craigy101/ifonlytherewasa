export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from "./database";

import type { Tables } from "./database";

// Convenience row type aliases
export type ProfileRow = Tables<"profiles">;
export type CategoryRow = Tables<"categories">;
export type PostRow = Tables<"posts">;
export type PostCategoryRow = Tables<"post_categories">;
export type ReactionRow = Tables<"reactions">;
export type CommentRow = Tables<"comments">;
export type BookmarkRow = Tables<"bookmarks">;
export type NotificationRow = Tables<"notifications">;
export type CommentLikeRow = Tables<"comment_likes">;
export type DeveloperProfileRow = Tables<"developer_profiles">;
export type DeveloperTechnologyRow = Tables<"developer_technologies">;
export type TechnologyRow = Tables<"technologies">;
export type SolvedVoteRow = Tables<"solved_votes">;
export type SearchIndexRow = Tables<"search_indices">;
export type SearchIndexMatchRow = Tables<"search_index_matches">;

/** Profile with all fields */
export type Profile = ProfileRow;

/** Post with joined author profile and categories */
export interface Post extends PostRow {
  author: Profile;
  categories: CategoryRow[];
  user_reaction?: string | null;
  is_bookmarked?: boolean;
}

/** Comment with joined author profile */
export interface Comment extends CommentRow {
  author: Profile;
  replies?: Comment[];
}

/** Notification with the actor's profile joined */
export interface Notification extends NotificationRow {
  actor: Profile;
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

/** Sort options for post feeds */
export type PostSortOption = "newest" | "oldest" | "most_reactions" | "most_comments";

/** Reaction counts object stored as JSON in posts */
export interface ReactionCounts {
  pay: number;
  nice: number;
  meh: number;
  bad: number;
}
