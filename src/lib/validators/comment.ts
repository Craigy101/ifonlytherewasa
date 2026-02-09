import { z } from "zod";

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment must be at most 10,000 characters")
    .trim(),
  post_id: z.string().uuid("Invalid post ID"),
  parent_id: z.string().uuid("Invalid parent comment ID").optional(),
});

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment must be at most 10,000 characters")
    .trim(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
