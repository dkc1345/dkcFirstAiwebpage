"use client";

import React, { useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Trash2, Clock } from "lucide-react";
import { AppNotification, NotificationType } from "../hooks/useNotifications";
import { sound } from "../audio";

interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onNavigateTab?: (tab: string) => void;
}

const typeColors: Record<NotificationType, { dot: string; bg: string; border: string; icon: string }> = {
  success:  { dot: "bg-emerald-400",  bg: "bg-emerald-500/10",  border: "border-emerald-500/30",  icon: "text-emerald-400" },
  info:     { dot: "bg-blue-400",     bg: "bg-blue-500/10",     border: "border-blue-500/30",     icon: "text-blue-400" },
  warning:  { dot: "bg-amber-400",    bg: "bg-amber-500/10",    border: "border-amber-500/30",    icon: "text-amber-400" },
  error:    { dot: "bg-rose-400",     bg: "bg-rose-500/10",     border: "border-rose-500/30",     icon: "text-rose-400" },
  focus:    { dot: "bg-indigo-400",   bg: "bg-indigo-500/10",   border: "border-indigo-500/30",   icon: "text-indigo-400" },
  task:     { dot: "bg-cyan-400",     bg: "bg-cyan-500/10",     border: "border-cyan-500/30",     icon: "text-cyan-400" },
  gpa:      { dot: "bg-purple-400",   bg: "bg-purple-500/10",   border: "border-purple-500/30",   icon: "text-purple-400" },
  streak:   { dot: "bg-orange-400",   bg: "bg-orange-500/10",   border: "border-orange-500/30",   icon: "text-orange-400" },
};

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClearAll,
  onNavigateTab,
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    sound.playClick();
    setOpen((v) => !v);
  };

  const handleMarkRead = (id: string) => {
    sound.playClick();
    onMarkRead(id);
  };

  const handleMarkAllRead = () => {
    sound.playClick();
    onMarkAllRead();
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(id);
  };

  const handleClearAll = () => {
    sound.playClick();
    onClearAll();
  };

  const handleAction = (notif: AppNotification) => {
    onMarkRead(notif.id);
    if (notif.action?.tab && onNavigateTab) {
      onNavigateTab(notif.action.tab);
    }
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notifications-btn"
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-all cursor-pointer ${
          open
            ? "text-[var(--accent)] bg-[var(--accent)]/10"
            : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05]"
        }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        title="Notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 && !open ? "animate-[wiggle_0.5s_ease-in-out]" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 bg-indigo-500 rounded-full ring-2 ring-[var(--bg-header)] flex items-center justify-center text-[9px] font-black text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[520px] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-header)] shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm font-bold text-[var(--text)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black bg-indigo-500 text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-[var(--text-muted)]">
                <Bell className="w-10 h-10 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-[var(--text-subtle)]">Events from tasks, timer, GPA & more appear here</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const colors = typeColors[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`relative group flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                      notif.read
                        ? "bg-transparent hover:bg-white/[0.025]"
                        : "bg-[var(--accent)]/[0.04] hover:bg-[var(--accent)]/[0.07]"
                    }`}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className={`absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                    )}

                    {/* Emoji icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base ${colors.bg} border ${colors.border}`}>
                      <span role="img" aria-label={notif.type}>{notif.emoji}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[12px] font-bold leading-tight truncate ${notif.read ? "text-[var(--text-muted)]" : "text-[var(--text)]"}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-[var(--text-subtle)] flex items-center gap-0.5 whitespace-nowrap">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                          <button
                            onClick={(e) => handleDismiss(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--text-subtle)] hover:text-rose-400 transition-all cursor-pointer"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                      {notif.action && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(notif); }}
                          className={`mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${colors.bg} ${colors.border} ${colors.icon} hover:opacity-80`}
                        >
                          {notif.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg-header)] shrink-0">
              <p className="text-[10px] text-[var(--text-subtle)] text-center">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · {unreadCount} unread
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
