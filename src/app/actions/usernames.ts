"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export async function checkUsernameAvailability(username: string) {
  const normalized = username.trim().toLowerCase();

  // 1. Server-side validation (never trust the client)
  if (
    !normalized ||
    normalized.length < 3 ||
    normalized.length > 20 ||
    !USERNAME_REGEX.test(normalized)
  ) {
    return { available: false, error: "Invalid username format" };
  }

  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username_lower", normalized)
      .maybeSingle();

    if (error) throw error;

    // If data is null, the username is available
    return { available: !data };
  } catch (err) {
    console.error("Username check error:", err);
    return { available: false, error: "Database error" };
  }
}
