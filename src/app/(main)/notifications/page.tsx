"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { NotificationItem } from "@/components/notifications/NotificationItem";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllRead } = useNotifications();

  useEffect(() => {
    document.title = "Notifications | If Only There Was A";
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-content">Notifications</h1>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className={cn(
              "text-sm text-content-muted hover:text-content",
              "transition-colors"
            )}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            "py-20 px-4",
            "bg-surface-raised border border-surface-border rounded-xl"
          )}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-content-muted mb-4"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-content-muted text-sm">No notifications yet</p>
        </div>
      ) : (
        <div
          className={cn(
            "bg-surface-raised border border-surface-border rounded-xl",
            "divide-y divide-surface-border overflow-hidden"
          )}
        >
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
