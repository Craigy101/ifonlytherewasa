"use client";

import { useState, useEffect, useRef, useMemo, useCallback, type FormEvent } from "react";
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
  const [validation, setValidation] = useState<ValidationState>({ message: "", type: "idle" });
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  // Create Supabase client once per component instance
  const supabase = useMemo(() => createClient(), []);

  // Debounce + stale-response guard
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCheckIdRef = useRef(0);

  // Validate username locally + check server availability (debounced)
  useEffect(() => {
    const value = username.trim();

    // cancel any in-flight debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // bump check id so older async responses can’t win
    latestCheckIdRef.current += 1;
    const checkId = latestCheckIdRef.current;

    // Local validation (instant)
    if (value.length === 0) {
      setValidation({ message: "", type: "idle" });
      setChecking(false);
      return;
    }

    if (value.length < USERNAME_MIN) {
      setValidation({ message: "Too short", type: "error" });
      setChecking(false);
      return;
    }

    if (value.length > USERNAME_MAX) {
      setValidation({ message: "Too long", type: "error" });
      setChecking(false);
      return;
    }

    if (!USERNAME_REGEX.test(value)) {
      setValidation({ message: "Invalid characters", type: "error" });
      setChecking(false);
      return;
    }

    // Server check (debounced)
    setChecking(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(value);

        // stale response guard
        if (checkId !== latestCheckIdRef.current) return;

        if (res?.error) throw new Error("availability check failed");

        setValidation({
          message: res.available ? "Available!" : "Taken",
          type: res.available ? "success" : "error",
        });
      } catch {
        if (checkId !== latestCheckIdRef.current) return;
        setValidation({ message: "Error checking name", type: "error" });
      } finally {
        if (checkId === latestCheckIdRef.current) setChecking(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const handleSubmit = useCallback(

    async (e: FormEvent) => {
      e.preventDefault();

      const value = username.trim().toLowerCase();

      // block if not ready
      if (!user || submitting || checking || validation.type !== "success") return;

      setSubmitting(true);

      try {
        // Upsert guards against missing profile rows if trigger/profile creation failed.
        const { data, error } = await supabase
          .from("profiles")
          .upsert({ id: user.id, username: value }, { onConflict: "id" })
          .select("id, username")
          .single();

        if (error) {
          setValidation({
            message:
              error.code === "23505"
                ? "Username is already taken"
                : "Something went wrong. Please try again.",
            type: "error",
          });
          return;
        }

        if (!data) {
          setValidation({
            message: "Profile not found. Please refresh and try again.",
            type: "error",
          });
          return;
        }

        // IMPORTANT: await this so your “needs username” guard doesn’t bounce you back
        try {
          await refreshProfile();
        } catch {
          // If refresh fails, still navigate — DB is updated
        }

        router.replace("/");
        router.refresh();
      } catch {
        setValidation({ message: "Something went wrong. Please try again.", type: "error" });
      } finally {
        setSubmitting(false);
      }
    },
    [username, user, submitting, checking, validation.type, supabase, refreshProfile, router]
  );

  const isSubmitDisabled = submitting || checking || validation.type !== "success";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-content-secondary">
          Username
        </label>

        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // don’t trim here; trim on validate/submit
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
          <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          "Claim Username"
        )}
      </button>
    </form>
  );
}
