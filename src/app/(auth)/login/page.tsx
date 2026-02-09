import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Sign In - If Only There Was A",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-content">Welcome</h1>
          <p className="mt-2 text-sm text-content-secondary">
            Sign in to share your ideas
          </p>
        </div>

        <GoogleSignInButton />

        <p className="mt-6 text-center text-xs text-content-muted">
          Your identity stays anonymous
        </p>
      </div>
    </div>
  );
}
