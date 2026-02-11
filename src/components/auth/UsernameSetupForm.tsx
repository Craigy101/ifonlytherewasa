"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";
import { checkUsernameAvailability } from "@/app/actions/usernames";

const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

type ValidationState = {
  message: string;
  type: "error" | "success" | "idle";
};

export function UsernameSetupForm() {
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState<ValidationState>({
    message: "",
    type: "idle",
  });
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseRef = useRef(createClient());

  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  // Validate username locally and check uniqueness with debounce
  useEffect(() => {
    // 1. INSTANT LOCAL VALIDATION
    // No debounce for things we can check in the browser
    if (username.length === 0) {
      setValidation({ message: "", type: "idle" });
      setChecking(false);
      return;
    }

    if (username.length < USERNAME_MIN) {
      setValidation({ message: "Too short", type: "error" });
      setChecking(false);
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setValidation({ message: "Invalid characters", type: "error" });
      setChecking(false);
      return;
    }

    // 2. TRIGGER SERVER CHECK (Reduced to 300ms)
    setChecking(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const { available, error } = await checkUsernameAvailability(username);

        // Safety check: ensure the user hasn't typed more since this request started
        if (username !== username) return;

        if (error) throw new Error();

        setValidation({
          message: available ? "Available!" : "Taken",
          type: available ? "success" : "error",
        });
      } catch {
        setValidation({ message: "Error checking name", type: "error" });
      } finally {
        setChecking(false);
      }
    }, 300); // 300ms is the "Goldilocks" zone for snappiness

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || validation.type !== "success" || submitting) return;

    setSubmitting(true);

    try {
      const { error } = await supabaseRef.current
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) {
        setValidation({
          message:
            error.code === "23505"
              ? "Username is already taken"
              : "Something went wrong. Please try again.",
          type: "error",
        });
        setSubmitting(false);
        return;
      }

      // Refresh profile in the background — don't let it block navigation
      refreshProfile().catch(() => { });
      router.replace("/");
    } catch {
      setValidation({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting || checking || validation.type !== "success";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-sm font-medium text-content-secondary"
        >
          Username
        </label>

        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="cool_username"
            maxLength={USERNAME_MAX}
            autoFocus
            className={cn(
              "w-full rounded-lg border bg-surface px-4 py-2.5 text-content",
              "placeholder:text-content-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface",
              "transition-colors",
              validation.type === "error" && "border-red-500",
              validation.type === "success" && "border-green-500",
              validation.type === "idle" && "border-surface-border"
            )}
          />

          {checking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-4 w-4 animate-spin text-content-muted"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}

          {!checking && validation.type === "success" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {validation.message && (
          <p
            className={cn(
              "text-xs",
              validation.type === "error" && "text-red-400",
              validation.type === "success" && "text-green-400",
              validation.type === "idle" && "text-content-muted"
            )}
          >
            {validation.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={cn(
          "flex items-center justify-center rounded-lg px-4 py-2.5",
          "text-sm font-medium transition-colors",
          isSubmitDisabled
            ? "bg-surface-hover text-content-muted cursor-not-allowed border border-surface-border"
            : "bg-accent text-surface hover:bg-accent-dim cursor-pointer"
        )}
      >
        {submitting ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          "Claim Username"
        )}
      </button>
    </form>
  );
}
