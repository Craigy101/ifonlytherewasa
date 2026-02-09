"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPES } from "@/lib/config/product-types";

interface SearchIndexCardProps {
  index: {
    id: string;
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions: number | null;
    min_weekly_pay_usd: number | null;
    is_active: boolean;
    is_free: boolean;
  };
  categories: Array<{ id: number; name: string; color: string | null }>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SearchIndexCard({ index, categories, onEdit, onDelete }: SearchIndexCardProps) {
  const productTypeLabels = index.product_types
    .map((pt) => PRODUCT_TYPES.find((p) => p.value === pt)?.label)
    .filter(Boolean);

  const matchedCategories = categories.filter((c) => index.category_ids.includes(c.id));

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-content">{index.name}</h3>
          {index.is_active ? (
            <Badge color="#22c55e">Active</Badge>
          ) : (
            <Badge color="#666666">Inactive</Badge>
          )}
          {index.is_free && <Badge color="#3b82f6">Free</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300">Delete</Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {productTypeLabels.map((label) => (
          <Badge key={label} color="#2A2A2A">{label}</Badge>
        ))}
        {matchedCategories.map((cat) => (
          <Badge key={cat.id} color={cat.color || "#666"}>{cat.name}</Badge>
        ))}
        {index.keyword_patterns.map((kw) => (
          <Badge key={kw} color="#1C1C1C">&quot;{kw}&quot;</Badge>
        ))}
      </div>

      <div className="flex gap-4 text-xs text-content-muted">
        {index.min_pay_reactions != null && index.min_pay_reactions > 0 && (
          <span>Min &quot;I&apos;d pay&quot;: {index.min_pay_reactions}</span>
        )}
        {index.min_weekly_pay_usd != null && index.min_weekly_pay_usd > 0 && (
          <span>Min $/week: ${index.min_weekly_pay_usd}</span>
        )}
      </div>
    </Card>
  );
}
