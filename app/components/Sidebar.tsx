"use client";

import React from "react";
import Image from "next/image";
import { sound } from "../audio";
import { TabKey } from "./Navbar";
import { UserProfile } from "./AuthModal";
import {
  LayoutDashboard, CheckSquare, Timer, BookOpen,
  Calculator, Compass, Calendar, FileText,
  LogOut, Palette, Zap, GraduationCap,
} from "lucide-react";

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  taskCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenSettings: () => void;
}

const nav: {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  badge?: "task";
  iconActive: string;
  iconInactive: string;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-indigo-400/70 group-hover:text-indigo-300",
  },
  {
    key: "tasks",
    label: "Tasks & Homework",
    icon: <CheckSquare className="w-[15px] h-[15px]" />,
    badge: "task",
    iconActive: "text-white",
    iconInactive: "text-rose-400/70 group-hover:text-rose-300",
  },
  {
    key: "pomodoro",
    label: "Focus Lab",
    icon: <Timer className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-amber-400/70 group-hover:text-amber-300",
  },
  {
    key: "flashcards",
    label: "Study & Quiz",
    icon: <BookOpen className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-cyan-400/70 group-hover:text-cyan-300",
  },
  {
    key: "gpa",
    label: "GPA Analytics",
    icon: <Calculator className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-emerald-400/70 group-hover:text-emerald-300",
  },
  {
    key: "stem",
    label: "STEM Toolkit",
    icon: <Compass className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-purple-400/70 group-hover:text-purple-300",
  },
  {
    key: "schedule",
    label: "Class Schedule",
    icon: <Calendar className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-blue-400/70 group-hover:text-blue-300",
  },
  {
    key: "notes",
    label: "Scratchpad",
    icon: <FileText className="w-[15px] h-[15px]" />,
    iconActive: "text-white",
    iconInactive: "text-pink-400/70 group-hover:text-pink-300",
  },
];

export default function Sidebar({
  activeTab, setActiveTab, taskCount,
  user, onOpenAuth, onSignOut,
  isOpen, setIsOpen, onOpenSettings,
}: SidebarProps) {

  const go = (key: TabKey) => {
    setActiveTab(key);
    sound.playClick();
    setIsOpen(false);
  };

  const sidebarBody = (
    <div className="flex flex-col h-full">

      {/* ── Logo ───────────────────────────────────── */}
      <div
        onClick={() => go("dashboard")}
        className="flex items-center gap-3 px-5 h-[var(--topbar-h)] border-b border-[var(--border)] cursor-pointer group shrink-0"
      >
        <div className="relative w-9 h-9 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-indigo-500/30 group-hover:ring-indigo-500/60 transition-all duration-300 shadow-lg shadow-indigo-500/10">
            <Image
              src={user?.avatar || "/scholar_avatar.jpg"}
              alt="Logo"
              width={36} height={36}
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[14px] text-[var(--text)] leading-tight tracking-tight">ScholarSync</p>
          <p className="text-[11px] text-[var(--text-subtle)] mt-0.5 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-indigo-400" />
            Academic Hub
          </p>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-bold tracking-[0.14em] text-[var(--text-subtle)] uppercase">
          Navigation
        </p>
        {nav.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                text-[13px] font-medium transition-all duration-150 group cursor-pointer
                relative
                ${active
                  ? "sidebar-active-item bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-neutral-800/60 dark:hover:bg-zinc-800/70"
                }
              `}
            >
              <span className="flex items-center gap-2.5">
                <span className={`transition-all duration-150 ${active ? item.iconActive : item.iconInactive}`}>
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge === "task" && taskCount > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-lg text-[10px] font-bold leading-none
                  ${active
                    ? "bg-white/25 text-white"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  }
                `}>
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Theme Toggle ───────────────────────────── */}
      <div className="px-2.5 pt-2 pb-1 border-t border-[var(--border)] shrink-0">
        <button
          onClick={() => { sound.playClick(); onOpenSettings(); setIsOpen(false); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-neutral-800/60 dark:hover:bg-zinc-800/70 transition-all duration-150 group cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <span className="text-[var(--text-subtle)] group-hover:text-indigo-400 group-hover:rotate-12 transition-all duration-200">
              <Palette className="w-[15px] h-[15px]" />
            </span>
            Theme & Colors
          </span>
          <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            5 Styles
          </span>
        </button>
      </div>

      {/* ── User Footer ────────────────────────────── */}
      <div className="border-t border-[var(--border)] p-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-[var(--border)] hover:border-[var(--border-focus)]/20 transition-colors">
            <div className="status-online shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-500/30">
              <Image src={user.avatar} alt="Avatar" width={32} height={32} unoptimized className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--text)] truncate leading-none">{user.name}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={() => { onSignOut(); sound.playClick(); }}
              className="p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { onOpenAuth(); sound.playClick(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-[13px] font-semibold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Sign In to ScholarSync
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[var(--sidebar-w)] shrink-0 h-screen sticky top-0 bg-[var(--bg-sidebar)] border-r border-[var(--border)] z-30 transition-colors duration-300">
        {sidebarBody}
      </aside>

      {/* ── Mobile Overlay ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-[var(--sidebar-w)]
          bg-[var(--bg-sidebar)] border-r border-[var(--border)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden
          ${isOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "-translate-x-full"}
        `}
      >
        {sidebarBody}
      </aside>
    </>
  );
}
