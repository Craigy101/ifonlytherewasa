"use client";

import { useAdBlockDetection } from "@/hooks/useAdBlockDetection";

export function AdBlockDetector() {
  const { isBlocked, dismissed, dismiss } = useAdBlockDetection();

  if (!isBlocked || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface/95 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-surface-border bg-surface-overlay p-8 text-center shadow-2xl">
        {/* Shield icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised">
          <svg
            className="h-8 w-8 text-content-secondary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-content">
          Ad blocker detected
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-content-secondary">
          We rely on non-intrusive ads to keep this platform free. Please
          consider disabling your ad blocker to support us.
        </p>

        <button
          onClick={dismiss}
          className="mt-6 w-full rounded-lg border border-surface-border bg-surface-raised px-5 py-2.5 text-sm font-medium text-content transition-colors hover:bg-surface-hover"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
