import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z
    .string()
    .min(1, "Display name cannot be empty")
    .max(50, "Display name must be at most 50 characters")
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .trim()
    .optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional().nullable(),
});

export type UsernameInput = z.infer<typeof usernameSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
