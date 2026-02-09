"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { NotificationItem } from "@/components/notifications/NotificationItem";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const displayedNotifications = notifications.slice(0, 20);

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute right-0 top-full mt-2",
        "w-96 max-h-[480px] overflow-y-auto",
        "bg-surface-overlay border border-surface-border",
        "rounded-xl shadow-2xl z-50"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between",
          "p-4 border-b border-surface-border"
        )}
      >
        <h3 className="text-sm font-semibold text-content">Notifications</h3>
        <button
          type="button"
          onClick={markAllRead}
          className={cn(
            "text-xs text-content-muted hover:text-content",
            "transition-colors"
          )}
        >
          Mark all read
        </button>
      </div>

      {displayedNotifications.length === 0 ? (
        <div className="flex items-center justify-center py-12 px-4">
          <p className="text-sm text-content-muted">No notifications yet</p>
        </div>
      ) : (
        <div>
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))}
        </div>
      )}

      <Link
        href="/notifications"
        onClick={onClose}
        className={cn(
          "block text-center text-xs text-content-muted hover:text-content",
          "py-3 border-t border-surface-border",
          "transition-colors"
        )}
      >
        View all
      </Link>
    </div>
  );
}
