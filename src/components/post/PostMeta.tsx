import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui";
import { formatDate } from "@/lib/utils/formatDate";

interface PostMetaProps {
  author: {
    username: string | null;
    avatar_url: string | null;
  };
  createdAt: string;
  editedAt?: string | null;
  className?: string;
}

export function PostMeta({ author, createdAt, editedAt, className }: PostMetaProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar username={author.username || "Anonymous"} avatarUrl={author.avatar_url ?? undefined} size="sm" />
      <span className="text-sm text-content-secondary font-medium">
        {author.username || "Anonymous"}
      </span>
      <span className="text-content-muted text-xs">&middot;</span>
      <span className="text-sm text-content-muted">{formatDate(createdAt)}</span>
      {editedAt && (
        <span className="text-content-muted text-xs">(edited)</span>
      )}
    </div>
  );
}
