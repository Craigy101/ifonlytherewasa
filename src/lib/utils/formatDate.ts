const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;

/**
 * Format a date string or Date object into a human-readable relative time.
 * Returns "just now", "5m ago", "2h ago", "3d ago", or a formatted date like "Jan 15".
 */
export function formatDate(date: string | Date): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return "just now";
  }

  if (diffInSeconds < MINUTE) {
    return "just now";
  }

  if (diffInSeconds < HOUR) {
    const minutes = Math.floor(diffInSeconds / MINUTE);
    return `${minutes}m ago`;
  }

  if (diffInSeconds < DAY) {
    const hours = Math.floor(diffInSeconds / HOUR);
    return `${hours}h ago`;
  }

  if (diffInSeconds < WEEK) {
    const days = Math.floor(diffInSeconds / DAY);
    return `${days}d ago`;
  }

  const currentYear = now.getFullYear();
  const thenYear = then.getFullYear();

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(currentYear !== thenYear ? { year: "numeric" } : {}),
  });

  return formatter.format(then);
}

/**
 * Format a date for full display (e.g., tooltips).
 */
export function formatDateFull(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
