"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface Category {
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">

      {/* All pill */}
      <Link href="/" className="flex-shrink-0">
        <Badge
          color={!activeSlug ? "#FFFFFF" : undefined}
          className={
            !activeSlug
              ? "bg-accent/20 text-accent border-accent/30"
              : "bg-surface-raised text-content-muted border-surface-border hover:text-content"
          }
        >
          All
        </Badge>
      </Link>

      {/* Category pills */}
      {categories.map((category) => {
        const isActive = activeSlug === category.slug;

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="flex-shrink-0"
          >
            <Badge
              color={isActive ? category.color : undefined}
              className={
                isActive
                  ? "border-transparent"
                  : "bg-surface-raised text-content-muted border-surface-border hover:text-content"
              }
            >
              {category.name}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
