import { z } from "zod";

export const TIME_SPENT_OPTIONS = [
  "Less than 1 hour",
  "1-3 hours",
  "3-5 hours",
  "5-10 hours",
  "10+ hours",
] as const;

export const createPostSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(300, "Title must be at most 300 characters")
    .trim(),
  body: z
    .string()
    .min(20, "Body must be at least 20 characters")
    .trim(),
  category_ids: z
    .array(z.number().int().positive())
    .min(1, "Select at least one category")
    .max(3, "Select at most 3 categories"),
  product_type: z.enum(["website", "app", "desktop_app", "hardware", "physical_product"]).optional().nullable(),
  weekly_pay_usd: z.number().int().min(1, "Must be at least $1").max(10000).optional().nullable(),
  time_spent_weekly: z.string().optional().nullable(),
  current_solution: z.string().max(1000).optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
