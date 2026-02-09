/**
 * Convert a string to a URL-safe slug.
 * Lowercases, replaces spaces with hyphens, removes special characters,
 * collapses multiple hyphens, and trims leading/trailing hyphens.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word characters (except hyphens)
    .replace(/--+/g, "-") // Collapse multiple hyphens
    .replace(/^-+/, "") // Trim leading hyphens
    .replace(/-+$/, ""); // Trim trailing hyphens
}
