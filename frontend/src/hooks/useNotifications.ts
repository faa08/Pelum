"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/backend/authService";
import {
  notificationService,
  type NotificationItem,
} from "@/backend/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async (uid: string | null) => {
    if (!uid) {
      setNotifications([]);
      return;
    }
    const items = await notificationService.getForUser(uid);
    setNotifications(items);
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUserId(user?.id_user ?? null);
    load(user?.id_user ?? null);

    const onStorage = () => {
      const u = authService.getCurrentUser();
      setUserId(u?.id_user ?? null);
      load(u?.id_user ?? null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, [load]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await notificationService.markAllRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = async () => {
    if (!userId) return;
    await notificationService.deleteAll(userId);
    setNotifications([]);
  };

  const handleToggleRead = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const nextUnread = !item.unread;
    await notificationService.markAsRead(id, !nextUnread);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: nextUnread } : n))
    );
  };

  const refresh = () => load(userId);

  return {
    notifications,
    unreadCount,
    handleMarkAllRead,
    handleClearAll,
    handleToggleRead,
    refresh,
  };
}
