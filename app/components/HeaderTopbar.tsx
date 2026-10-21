"use client";

import React, { useState, useEffect } from "react";
import { Search, Menu, Command, Palette } from "lucide-react";
import { TabKey } from "./Navbar";
import { UserProfile } from "./AuthModal";
import { sound } from "../audio";
import NotificationCenter from "./NotificationCenter";
import { AppNotification, NotificationType } from "../hooks/useNotifications";

const pageInfo: Record<TabKey, { label: string; emoji: string; desc: string }> = {
  dashboard:  { label: "Dashboard",       emoji: "🏠", desc: "Your academic overview" },
  tasks:      { label: "Tasks & Homework", emoji: "📋", desc: "Manage your assignments" },
  pomodoro:   { label: "Focus Lab",        emoji: "⏱️", desc: "Pomodoro timer & sessions" },
  flashcards: { label: "Study & Quiz",     emoji: "📚", desc: "Flashcards & practice" },
  gpa:        { label: "GPA Analytics",    emoji: "📊", desc: "Track your performance" },
  stem:       { label: "STEM Toolkit",     emoji: "🔬", desc: "Science & math tools" },
  schedule:   { label: "Class Schedule",   emoji: "📅", desc: "Your timetable" },
  notes:      { label: "Scratchpad",       emoji: "📝", desc: "Quick notes & ideas" },
  aichat:     { label: "ScholarBot AI",    emoji: "🤖", desc: "CS · IT · CpE Copilot" },
};

interface HeaderTopbarProps {
  activeTab: TabKey;
  user: UserProfile | null;
  onToggleSidebar: () => void;
  onOpenAI?: () => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function HeaderTopbar({
  activeTab,
  user,
  onToggleSidebar,
  onOpenAI,
  onOpenPalette,
  onOpenSettings,
  onOpenAuth,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismissNotification,
  onClearAllNotifications,
  onNavigateTab,
}: HeaderTopbarProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const tick = () => setTimeStr(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { label, emoji, desc } = pageInfo[activeTab];

  return (
    <header className="
      sticky top-0 z-20 w-full
      h-[var(--topbar-h)] flex items-center gap-2 px-4 sm:px-6
      bg-[var(--bg-header)] border-b border-[var(--border)]
      backdrop-blur-xl min-w-0 transition-colors duration-300
    ">
      {/* ── Mobile menu ─── */}
      <button
        id="mobile-menu-btn"
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.06] transition-colors shrink-0"
        aria-label="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Page title ─── */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <span className="text-xl leading-none hidden sm:block animate-float">{emoji}</span>
        <div className="min-w-0">
          <h1 className="text-scale-md font-bold text-[var(--text)] truncate leading-none">
            {label}
          </h1>
          <p className="text-2xs text-[var(--text-subtle)] hidden sm:block mt-0.5 truncate">
            {desc}
            {timeStr && <span className="ml-2 font-mono text-[var(--text-subtle)]/70">· {timeStr}</span>}
          </p>
        </div>
      </div>

      {/* ── Search bar (desktop and mobile) ─── */}
      <button
        id="command-palette-btn-mobile"
        onClick={onOpenPalette}
        className="md:hidden shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:text-indigo-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
        title="Quick search (Cmd+K)"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      <button
        id="command-palette-btn"
        onClick={onOpenPalette}
        className="
          hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl shrink-0 w-52 cursor-pointer
          bg-white/[0.04] border border-[var(--border)] text-[var(--text-muted)] text-scale-xs
          hover:border-indigo-500/40 hover:text-[var(--text)] hover:bg-white/[0.06]
          transition-all duration-200
        "
      >
        <span className="flex-1 text-left truncate text-[13px]">Quick search…</span>
        <kbd className="flex items-center gap-0.5 text-[10px] bg-white/[0.07] border border-white/[0.08] rounded-md px-1.5 py-0.5 font-mono shrink-0">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
        <Search className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
      </button>



      {/* ── Settings / Themes ─── */}
      <button
        id="settings-btn"
        onClick={() => { sound.playClick(); onOpenSettings(); }}
        className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
        title="Appearance & Pomodoro Settings"
        aria-label="Settings"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* ── Notifications (functional bell) ─── */}
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onDismiss={onDismissNotification}
        onClearAll={onClearAllNotifications}
        onNavigateTab={onNavigateTab}
      />

      {/* ── Avatar / Account Switcher ─── */}
      {user ? (
        <button
          onClick={() => { sound.playClick(); onOpenAuth(); }}
          className="status-online shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/40 hover:ring-indigo-500/80 transition-all cursor-pointer focus:outline-none"
          title={`Signed in as ${user.name} (${user.email}). Click to switch or manage account.`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        </button>
      ) : (
        <button
          onClick={() => { sound.playClick(); onOpenAuth(); }}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
        >
          Sign In
        </button>
      )}
    </header>
  );
}
