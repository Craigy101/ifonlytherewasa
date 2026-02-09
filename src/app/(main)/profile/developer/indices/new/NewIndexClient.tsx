"use client";

import { useRouter } from "next/navigation";
import { SearchIndexForm } from "@/components/developer/SearchIndexForm";
import { createSearchIndex } from "@/actions/search-indices";
import { createCheckoutSession } from "@/actions/stripe";

interface NewIndexClientProps {
  categories: Array<{ id: number; name: string; color: string | null }>;
}

export function NewIndexClient({ categories }: NewIndexClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    product_types: string[];
    category_ids: number[];
    keyword_patterns: string[];
    min_pay_reactions?: number | null;
    min_weekly_pay_usd?: number | null;
  }) => {
    const result = await createSearchIndex(data);
    if (result.isFree) {
      router.push("/profile/developer");
    } else {
      await createCheckoutSession(result.id);
    }
  };

  return <SearchIndexForm onSubmit={handleSubmit} categories={categories} />;
}
