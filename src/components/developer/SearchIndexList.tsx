"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SearchIndexCard } from "./SearchIndexCard";
import { deleteSearchIndex } from "@/actions/search-indices";

interface SearchIndex {
  id: string;
  name: string;
  product_types: string[];
  category_ids: number[];
  keyword_patterns: string[];
  min_pay_reactions: number | null;
  min_weekly_pay_usd?: number | null;
  is_active: boolean;
  is_free: boolean;
}

interface SearchIndexListProps {
  indices: SearchIndex[];
  categories: Array<{ id: number; name: string; color: string | null }>;
}

export function SearchIndexList({ indices, categories }: SearchIndexListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteSearchIndex(deletingId);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-content">Search Indices</h2>
        <Link href="/profile/developer/indices/new">
          <Button size="sm">Add Index</Button>
        </Link>
      </div>

      {indices.length === 0 ? (
        <p className="text-sm text-content-muted py-8 text-center">
          No search indices yet. Create one to get notified about matching posts.
        </p>
      ) : (
        <div className="space-y-3">
          {indices.map((index) => (
            <SearchIndexCard
              key={index.id}
              index={index}
              categories={categories}
              onEdit={() => router.push(`/profile/developer/indices/${index.id}/edit`)}
              onDelete={() => setDeletingId(index.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Search Index">
        <p className="text-sm text-content-muted">
          Are you sure you want to delete this search index? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="secondary" size="sm" onClick={() => setDeletingId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
