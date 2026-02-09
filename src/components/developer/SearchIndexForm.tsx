"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PRODUCT_TYPES } from "@/lib/config/product-types";

interface SearchIndexFormProps {
  initialData?: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions: number | null;
    min_weekly_pay_usd: number | null;
  };
  onSubmit: (data: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions?: number | null;
    min_weekly_pay_usd?: number | null;
  }) => Promise<void>;
  categories: Array<{ id: number; name: string; color: string | null }>;
}

export function SearchIndexForm({ initialData, onSubmit, categories }: SearchIndexFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [productTypes, setProductTypes] = useState<string[]>(initialData?.product_types ?? []);
  const [categoryIds, setCategoryIds] = useState<number[]>(initialData?.category_ids ?? []);
  const [keywords, setKeywords] = useState<string[]>(initialData?.keyword_patterns ?? [""]);
  const [minPay, setMinPay] = useState<string>(initialData?.min_pay_reactions?.toString() ?? "");
  const [minWeeklyPay, setMinWeeklyPay] = useState<string>(initialData?.min_weekly_pay_usd?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleProductType = (pt: string) => {
    setProductTypes((prev) =>
      prev.includes(pt) ? prev.filter((t) => t !== pt) : [...prev, pt]
    );
  };

  const toggleCategory = (id: number) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const updateKeyword = (index: number, value: string) => {
    setKeywords((prev) => prev.map((k, i) => (i === index ? value : k)));
  };

  const addKeyword = () => {
    if (keywords.length < 10) setKeywords([...keywords, ""]);
  };

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        product_types: productTypes,
        category_ids: categoryIds,
        keyword_patterns: keywords.filter(Boolean),
        min_pay_reactions: minPay ? parseInt(minPay) : null,
        min_weekly_pay_usd: minWeeklyPay ? parseInt(minWeeklyPay) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Index Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. React Web Apps" />
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Product Types</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_TYPES.map((pt) => (
              <button key={pt.value} type="button" onClick={() => toggleProductType(pt.value)}>
                <Badge
                  color={productTypes.includes(pt.value) ? "#FFFFFF" : undefined}
                  className={cn(
                    "cursor-pointer transition-all",
                    productTypes.includes(pt.value) ? "ring-1 ring-offset-1 ring-offset-surface" : "opacity-50 hover:opacity-75"
                  )}
                >
                  {pt.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}>
                <Badge
                  color={categoryIds.includes(cat.id) ? (cat.color || "#666") : undefined}
                  className={cn(
                    "cursor-pointer transition-all",
                    categoryIds.includes(cat.id) ? "ring-1 ring-offset-1 ring-offset-surface" : "opacity-50 hover:opacity-75"
                  )}
                >
                  {cat.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">
            Keyword Patterns <span className="text-content-muted">(posts matching any keyword)</span>
          </label>
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div key={i} className="flex gap-2">
                <Input value={kw} onChange={(e) => updateKeyword(i, e.target.value)} placeholder="e.g. react, dashboard" className="flex-1" />
                {keywords.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeKeyword(i)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
            {keywords.length < 10 && (
              <Button type="button" variant="ghost" size="sm" onClick={addKeyword}>+ Add keyword</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Min &quot;I&apos;d Pay&quot; Reactions
            </label>
            <Input type="number" min="0" value={minPay} onChange={(e) => setMinPay(e.target.value)} placeholder="0" />
            <p className="text-xs text-content-muted mt-1">How many people said they&apos;d pay</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Min $ per Week (USD)
            </label>
            <Input type="number" min="0" value={minWeeklyPay} onChange={(e) => setMinWeeklyPay(e.target.value)} placeholder="0" />
            <p className="text-xs text-content-muted mt-1">Minimum the poster would pay weekly</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Index" : "Create Index"}
        </Button>
      </Card>
    </form>
  );
}
