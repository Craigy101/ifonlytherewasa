"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface NotificationActor {
  username: string;
}

interface NotificationPost {
  title: string;
  slug: string;
}

export interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  recipient_id: string;
  actor_id: string;
  post_id: string;
  actor: NotificationActor;
  post: NotificationPost;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const supabase = createClient();

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "*, actor:profiles!actor_id(username), post:posts!post_id(title, slug)"
        )
        .eq("recipient_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    }

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("notifications")
            .select(
              "*, actor:profiles!actor_id(username), post:posts!post_id(title, slug)"
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setNotifications((prev) => [data as Notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;

      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("recipient_id", user.id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    },
    [user]
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
