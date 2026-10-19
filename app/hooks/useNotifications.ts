"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type NotificationType = "success" | "info" | "warning" | "error" | "focus" | "task" | "gpa" | "streak";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    tab?: string;
  };
}

interface StoredNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  emoji: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    tab?: string;
  };
}

export function useNotifications(userEmail?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const lastPushRef = useRef<{ key: string; time: number }>({ key: "", time: 0 });
  const isLoadedRef = useRef(false);

  const storageKey = userEmail
    ? `scholarsync_notifs_${userEmail.trim().toLowerCase()}`
    : "scholarsync_notifs_guest";

  // Load notifications specifically for this logged-in account
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredNotification[] = JSON.parse(raw);
        setNotifications(
          parsed.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
    isLoadedRef.current = true;
  }, [storageKey]);

  // Persist notifications specifically for this logged-in account
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      const serialized = JSON.stringify(
        notifications.map((n) => ({
          ...n,
          timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
        }))
      );
      localStorage.setItem(storageKey, serialized);
    } catch { }
  }, [notifications, storageKey]);

  const push = useCallback((
    type: NotificationType,
    title: string,
    body: string,
    emoji: string,
    action?: AppNotification["action"]
  ) => {
    const now = Date.now();
    const key = `${type}::${title}::${body}`;
    // Deduplicate identical notifications pushed within 500ms
    if (lastPushRef.current.key === key && now - lastPushRef.current.time < 500) {
      return;
    }
    lastPushRef.current = { key, time: now };

    const notif: AppNotification = {
      id: `notif-${now}-${Math.random().toString(36).slice(2)}`,
      type,
      title,
      body,
      emoji,
      timestamp: new Date(),
      read: false,
      action,
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 50));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(storageKey);
    } catch { }
  }, [storageKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, push, markRead, markAllRead, dismiss, clearAll, unreadCount };
}
