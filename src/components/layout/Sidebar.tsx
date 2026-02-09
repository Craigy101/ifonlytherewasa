import Link from "next/link";
import { Button } from "@/components/ui";
import { CATEGORIES } from "@/lib/config/categories";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-3 border-r border-surface-border",
        className
      )}
    >
      {/* New Post Button */}
      <Link href="/post/new">
        <Button variant="primary" className="w-full mb-6">
          + New Post
        </Button>
      </Link>

      {/* Categories */}
      <div>
        <h3 className="text-xs uppercase text-content-muted tracking-wider mb-3 px-3">
          Categories
        </h3>
        <nav className="flex flex-col gap-0.5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                "text-content-secondary hover:bg-surface-hover hover:text-content transition-colors"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
