"use client";

import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const barColors: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <div className="bg-surface-overlay border border-surface-border rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px]">
      {/* Color bar */}
      <div
        className={cn("w-1 rounded-full self-stretch", barColors[type])}
      />

      {/* Message */}
      <p className="text-sm text-content flex-1">{message}</p>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="text-content-muted hover:text-content transition-colors flex-shrink-0"
        aria-label="Dismiss toast"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export { Toast };
export type { ToastProps, ToastType };
