import { z } from "zod";

export const createDeveloperProfileSchema = z.object({
  bio: z.string().max(1000, "Bio must be at most 1,000 characters").trim().optional().or(z.literal("")),
  github_username: z
    .string()
    .max(39, "GitHub username is too long")
    .regex(/^[a-zA-Z0-9-]*$/, "Invalid GitHub username")
    .optional()
    .or(z.literal("")),
  technology_ids: z
    .array(z.number().int().positive())
    .max(20, "Select at most 20 technologies"),
});

export const updateDeveloperProfileSchema = createDeveloperProfileSchema;

export const createSearchIndexSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").trim(),
  product_types: z.array(
    z.enum(["website", "app", "desktop_app", "hardware", "physical_product"])
  ),
  category_ids: z.array(z.number().int().positive()),
  keyword_patterns: z
    .array(z.string().max(100).trim())
    .max(10, "At most 10 keyword patterns"),
  min_pay_reactions: z.number().int().min(0).optional().nullable(),
  min_weekly_pay_usd: z.number().int().min(0).optional().nullable(),
});

export type CreateDeveloperProfileInput = z.infer<typeof createDeveloperProfileSchema>;
export type CreateSearchIndexInput = z.infer<typeof createSearchIndexSchema>;
