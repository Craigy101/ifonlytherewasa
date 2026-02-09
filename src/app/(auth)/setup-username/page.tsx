import type { Metadata } from "next";
import { UsernameSetupForm } from "@/components/auth/UsernameSetupForm";

export const metadata: Metadata = {
  title: "Choose Username - If Only There Was A",
};

export default function SetupUsernamePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-content">
            Choose your anonymous username
          </h1>
          <p className="mt-2 text-sm text-content-secondary">
            This is how others will see you
          </p>
        </div>

        <UsernameSetupForm />
      </div>
    </div>
  );
}
