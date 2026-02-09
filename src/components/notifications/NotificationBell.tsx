"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-2 rounded-lg",
          "text-content-muted hover:text-content hover:bg-surface-hover",
          "transition-colors"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "bg-red-500 text-white text-[10px]",
              "rounded-full min-w-[18px] h-[18px]",
              "flex items-center justify-center",
              "font-medium leading-none px-1"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </div>
  );
}
