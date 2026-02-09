"use client";

import { useAdBlockDetection } from "@/hooks/useAdBlockDetection";
import { Card } from "@/components/ui/Card";

export function AdBlockDetector() {
  const { isBlocked, dismissed, dismiss } = useAdBlockDetection();

  if (!isBlocked || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-surface-overlay border border-surface-border rounded-xl p-4 shadow-2xl max-w-sm">
        <h3 className="text-sm font-medium text-content">
          Ad blocker detected
        </h3>
        <p className="text-xs text-content-secondary mt-1">
          We rely on non-intrusive ads to keep this platform free. Please
          consider disabling your ad blocker.
        </p>
        <button
          onClick={dismiss}
          className="text-xs text-content-muted hover:text-content mt-3 transition-colors"
        >
          Dismiss
        </button>
      </Card>
    </div>
  );
}
