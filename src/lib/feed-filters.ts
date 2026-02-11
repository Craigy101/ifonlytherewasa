// Shared types + parser for feed sort/filter — used by both server pages and client components
export type FeedSort = "popular" | "recent";
export type ProductType = "website" | "app" | "desktop_app" | "hardware" | "physical_product" | "automation" | "ai_model";

export interface FeedFilters {
  sort: FeedSort;
  minInterested: number;
  minSpend: number;
  productType: ProductType | "";
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  website: "Website",
  app: "App",
  desktop_app: "Desktop App",
  hardware: "Hardware",
  physical_product: "Physical Product",
  automation: "Automation",
  ai_model: "AI Model",
};

export function parseFeedFilters(searchParams: Record<string, string | string[] | undefined>): FeedFilters {
  const sort = (searchParams.sort === "recent" ? "recent" : "popular") as FeedSort;
  const minInterested = Math.max(0, parseInt(String(searchParams.min_interested ?? "0"), 10) || 0);
  const minSpend = Math.max(0, parseInt(String(searchParams.min_spend ?? "0"), 10) || 0);
  const rawType = String(searchParams.product_type ?? "");
  const productType = (Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).includes(rawType as ProductType)
    ? (rawType as ProductType)
    : "";
  return { sort, minInterested, minSpend, productType };
}
