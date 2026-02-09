import { cn } from "@/lib/utils/cn";

const PALETTE = [
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
] as const;

function hashUsername(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const sizeMap = {
  sm: {
    container: "h-8 w-8",
    text: "text-xs",
  },
  md: {
    container: "h-10 w-10",
    text: "text-sm",
  },
  lg: {
    container: "h-14 w-14",
    text: "text-lg",
  },
} as const;

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Avatar({ username, avatarUrl, size = "md", className }: AvatarProps) {
  const { container, text } = sizeMap[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={cn(
          "rounded-full object-cover flex-shrink-0",
          container,
          className
        )}
      />
    );
  }

  const colorIndex = hashUsername(username) % PALETTE.length;
  const bgColor = PALETTE[colorIndex];
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-medium text-white select-none",
        container,
        text,
        className
      )}
      style={{ backgroundColor: bgColor }}
      aria-label={username}
    >
      {initial}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };
