"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sound } from "../audio";
import { TabKey } from "./Navbar";
import { UserProfile } from "./AuthModal";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BookOpen,
  Calculator,
  Compass,
  Calendar,
  FileText,
  Palette,
  ChevronRight,
  Menu,
  GraduationCap,
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
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

interface NavItemConfig {
  key: TabKey;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: "task" | "static";
  badgeCount?: number;
  badgeColor?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  taskCount,
  user,
  onOpenAuth,
  onSignOut,
  isOpen,
  setIsOpen,
  onOpenSettings,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: setControlledCollapsed,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = setControlledCollapsed || setInternalCollapsed;

  const go = (key: TabKey) => {
    setActiveTab(key);
    sound.playClick();
    setIsOpen(false);
  };

  const navGroups: {
    sectionTitle: string;
    items: NavItemConfig[];
  }[] = [
      {
        sectionTitle: "NAVIGATION",
        items: [
          {
            key: "dashboard",
            label: "Dashboard",
            icon: () => <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
          {
            key: "tasks",
            label: "Tasks & Homework",
            icon: () => <CheckSquare className="w-[18px] h-[18px]" strokeWidth={1.8} />,
            badge: "task",
            badgeColor: "amber",
          },
          {
            key: "pomodoro",
            label: "Focus Lab",
            icon: () => <Timer className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
          {
            key: "flashcards",
            label: "Study & Quiz",
            icon: () => <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
          {
            key: "gpa",
            label: "GPA Analytics",
            icon: () => <Calculator className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
          {
            key: "stem",
            label: "STEM Toolkit",
            icon: () => <Compass className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
        ],
      },
      {
        sectionTitle: "INSIGHT",
        items: [
          {
            key: "schedule",
            label: "Class Schedule",
            icon: () => <Calendar className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
          {
            key: "notes",
            label: "Scratchpad",
            icon: () => <FileText className="w-[18px] h-[18px]" strokeWidth={1.8} />,
          },
        ],
      },
    ];

  const getBadgeClasses = (color?: string) => {
    switch (color) {
      case "amber":
        return "bg-[#f59e0b] text-white";
      case "emerald":
        return "bg-[#10b981] text-white";
      case "cyan":
        return "bg-[#06b6d4] text-white";
      case "orange":
        return "bg-[#fb923c] text-white";
      case "blue":
        return "bg-[#3b82f6] text-white";
      case "rose":
        return "bg-[#f43f5e] text-white";
      case "purple":
        return "bg-[#8b5cf6] text-white";
      default:
        return "bg-[#6366f1] text-white";
    }
  };

  const getDotColor = (color?: string) => {
    switch (color) {
      case "amber":
        return "bg-[#f59e0b]";
      case "emerald":
        return "bg-[#10b981]";
      case "cyan":
        return "bg-[#06b6d4]";
      case "orange":
        return "bg-[#fb923c]";
      case "blue":
        return "bg-[#3b82f6]";
      case "rose":
        return "bg-[#f43f5e]";
      case "purple":
        return "bg-[#8b5cf6]";
      default:
        return "bg-[#6366f1]";
    }
  };

  const renderContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-[var(--bg-card)] text-[var(--text)] select-none">
      {/* ── Header: Brand Logo & Collapse Trigger ───────────────────── */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} h-[var(--topbar-h)] px-4 shrink-0 border-b border-[var(--border)]`}>
        {collapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex flex-col items-center gap-1 cursor-pointer group"
            title="Expand sidebar"
          >
            <div className="p-1.5 rounded-xl text-[var(--text-muted)] group-hover:text-[var(--text)] group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all">
              <Menu className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-scale-sm tracking-tight text-[var(--text)]">
              Sc<span className="text-indigo-400">.</span>
            </span>
          </button>
        ) : (
          <>
            <div
              onClick={() => go("dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-scale-md font-black tracking-tight text-[var(--text)] group-hover:text-indigo-400 transition-colors">
                ScholarSync
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-xl text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Collapse sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation Groups ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.sectionTitle} className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-2xs font-bold tracking-[0.14em] text-[var(--text-subtle)] uppercase">
                {group.sectionTitle}
              </p>
            )}

            {group.items.map((item) => {
              const active = activeTab === item.key;
              const hasBadge =
                item.badge === "task"
                  ? taskCount > 0
                  : item.badge === "static" && item.badgeCount !== undefined;
              const badgeValue =
                item.badge === "task" ? taskCount : item.badgeCount;

              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center ${collapsed ? "justify-center" : "justify-start gap-[10px]"}
                    ${collapsed ? "h-11 px-0" : "px-3.5 py-2.5"} rounded-xl
                    text-scale-sm font-medium transition-all duration-150 cursor-pointer relative group
                    ${active
                      ? "text-[var(--text)] font-semibold bg-indigo-500/10 dark:bg-white/[0.08] shadow-sm ring-1 ring-indigo-500/30 dark:ring-white/[0.12]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {/* Left Icon & Label */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 transition-colors ${active
                          ? "text-indigo-500 dark:text-indigo-400"
                          : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                        }`}
                    >
                      {item.icon(active)}
                    </span>
                    {!collapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>

                  {/* Badge or indicator */}
                  {!collapsed && hasBadge && badgeValue !== undefined && (
                    <span
                      className={`
                        ml-auto min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight text-center leading-tight
                        shadow-sm transition-transform group-hover:scale-105 shrink-0
                        ${getBadgeClasses(item.badgeColor)}
                      `}
                    >
                      {badgeValue}
                    </span>
                  )}

                  {/* Dot indicator when collapsed */}
                  {collapsed && hasBadge && (
                    <span
                      className={`
                        absolute top-2.5 right-2.5 w-2 h-2 rounded-full ring-2 ring-[var(--bg-card)]
                        ${getDotColor(item.badgeColor)}
                      `}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Theme Button ─────────────────────────── */}
      <div className={`px-3 py-2 border-t border-[var(--border)] shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
            setIsOpen(false);
          }}
          className={`
            flex items-center ${collapsed ? "justify-center w-11 h-11" : "justify-between w-full px-3 py-2"}
            rounded-xl text-scale-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group
          `}
          title="Themes & Appearance"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Palette className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Themes & Colors</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] font-bold text-indigo-400 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              5
            </span>
          )}
        </button>
      </div>

      {/* ── Profile Card ─────────────── */}
      <div className="p-3 border-t border-[var(--border)] shrink-0">
        {user ? (
          <div
            onClick={() => {
              onOpenAuth();
              sound.playClick();
            }}
            className={`
              flex items-center ${collapsed ? "justify-center p-1.5" : "gap-3 p-2.5"}
              rounded-xl bg-[var(--bg-input)] border border-[var(--border)] hover:border-indigo-500/30
              hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden
            `}
            title={`Account: ${user.name}`}
          >
            {/* Avatar */}
            <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/30 group-hover:ring-indigo-500/60 transition-all">
              <Image
                src={user.avatar || "/scholar_avatar.jpg"}
                alt="Avatar"
                width={32}
                height={32}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info & Action Arrow */}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-scale-sm font-bold text-[var(--text)] truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-2xs text-[var(--text-subtle)] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--bg-card)] group-hover:border-indigo-400 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors shrink-0">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              onOpenAuth();
              sound.playClick();
            }}
            className={`
              w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
              bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold
              transition-all shadow-md shadow-indigo-600/20 cursor-pointer
            `}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Straight Edge Full-Height Sidebar ────────────────────────── */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-30
          border-r border-[var(--border)] bg-[var(--bg-card)]
          transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-[width]
          ${isCollapsed ? "w-[72px]" : "w-[260px]"}
        `}
      >
        {renderContent(isCollapsed)}
      </aside>

      {/* ── Mobile Overlay & Drawer ─────────────────────────────────── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-[270px]
          bg-[var(--bg-card)] border-r border-[var(--border)] shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {renderContent(false)}
      </aside>
    </>
  );
}
