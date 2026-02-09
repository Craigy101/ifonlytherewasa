"use client";

import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold text-content">Something went wrong</h1>
      <p className="text-sm text-content-muted mt-3 max-w-md text-center">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-8">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
