/**
 * Parse @mentions from an HTML string.
 * Looks for both data-mention attributes from Tiptap's mention extension
 * and plain text @username patterns.
 *
 * Returns a deduplicated array of usernames found.
 */
export function parseMentions(html: string): string[] {
  const mentions = new Set<string>();

  // Match data-mention attributes (Tiptap mention nodes)
  // e.g., <span data-mention="username" data-id="uuid">@username</span>
  const dataMentionRegex = /data-mention="([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = dataMentionRegex.exec(html)) !== null) {
    const username = match[1].trim();
    if (username) {
      mentions.add(username);
    }
  }

  // Match plain text @mentions (fallback for simple text)
  // Matches @username where username is 3-20 alphanumeric/underscore chars
  const plainMentionRegex = /@([a-zA-Z0-9_]{3,20})\b/g;

  while ((match = plainMentionRegex.exec(html)) !== null) {
    const username = match[1];
    if (username) {
      mentions.add(username);
    }
  }

  return Array.from(mentions);
}
