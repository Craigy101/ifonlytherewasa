"use client";

import { useRouter } from "next/navigation";
import { SearchIndexForm } from "@/components/developer/SearchIndexForm";
import { updateSearchIndex } from "@/actions/search-indices";

interface EditIndexClientProps {
  indexId: string;
  initialData: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions: number | null;
    min_weekly_pay_usd?: number | null;
  };
  categories: Array<{ id: number; name: string; color: string | null }>;
}

export function EditIndexClient({ indexId, initialData, categories }: EditIndexClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions?: number | null;
    min_weekly_pay_usd?: number | null;
  }) => {
    await updateSearchIndex(indexId, data);
    router.push("/profile/developer");
  };

  return <SearchIndexForm initialData={initialData} onSubmit={handleSubmit} categories={categories} />;
}
