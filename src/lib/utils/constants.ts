/** Application name */
export const APP_NAME = "If Only There Was A";

/** Number of posts to load per page / infinite scroll batch */
export const POSTS_PER_PAGE = 20;

/** Maximum nesting depth for threaded comments */
export const MAX_COMMENT_DEPTH = 5;

/** Time window (in ms) during which a post or comment can be edited (1 hour) */
export const EDIT_WINDOW_MS = 3_600_000;

/** Debounce delay (in ms) for search input */
export const SEARCH_DEBOUNCE_MS = 300;

/** Maximum file size for avatar uploads (2MB) */
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/** Accepted image MIME types for uploads */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
