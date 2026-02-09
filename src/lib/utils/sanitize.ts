/**
 * Sanitize HTML content from Tiptap editor.
 * Uses DOMPurify on the client side for full sanitization.
 * On the server side, strips all HTML tags as a fallback.
 */

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "span",
  "div",
  "img",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "data-mention",
  "data-id",
  "src",
  "alt",
  "title",
];

/**
 * Sanitize HTML string for safe rendering.
 * Client-side: uses DOMPurify with allowed tags/attributes.
 * Server-side: strips all HTML tags.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: strip all HTML tags
    return stripHtml(dirty);
  }

  // Client-side: use DOMPurify
  try {
    // Dynamic import to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require("dompurify");
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: true,
    });
  } catch {
    // Fallback if DOMPurify is not available
    return stripHtml(dirty);
  }
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Truncate text to a specified length, adding ellipsis if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + "...";
}
