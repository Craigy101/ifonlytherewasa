export const PRODUCT_TYPES = [
  { value: "website" as const, label: "Website" },
  { value: "app" as const, label: "Mobile App" },
  { value: "desktop_app" as const, label: "Desktop App" },
  { value: "hardware" as const, label: "Hardware" },
  { value: "physical_product" as const, label: "Physical Product" },
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number]["value"];
