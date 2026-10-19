"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { sound } from "../audio";
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
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  LogOut,
  Search,
  Bot,
} from "lucide-react";

export type TabKey =
  | "dashboard"
  | "tasks"
  | "pomodoro"
  | "flashcards"
  | "gpa"
  | "stem"
  | "schedule"
  | "notes"
  | "aichat";

interface NavbarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onResetData: () => void;
  taskCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenCommandPalette: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onResetData,
  taskCount,
  user,
  onOpenAuth,
  onSignOut,
  onOpenCommandPalette,
}: NavbarProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.setSoundEnabled(nextState);
    if (nextState) {
      sound.playClick();
    }
  };

  const navItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      key: "tasks",
      label: "Homework & Tasks",
      icon: <CheckSquare className="w-4 h-4" />,
      badge: taskCount,
    },
    { key: "pomodoro", label: "Focus Lab", icon: <Timer className="w-4 h-4" /> },
    { key: "flashcards", label: "Study & Quiz", icon: <BookOpen className="w-4 h-4" /> },
    { key: "gpa", label: "GPA Simulator", icon: <Calculator className="w-4 h-4" /> },
    { key: "stem", label: "STEM Toolkit", icon: <Compass className="w-4 h-4" /> },
    { key: "schedule", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
    { key: "notes", label: "Scratchpad", icon: <FileText className="w-4 h-4" /> },
    { key: "aichat", label: "ScholarBot AI", icon: <Bot className="w-4 h-4" />, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070a12]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo Brand */}
          <div
            onClick={() => {
              setActiveTab("dashboard");
              sound.playClick();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40 group-hover:ring-indigo-400 group-hover:scale-105 transition-all duration-300">
              <Image
                src={user?.avatar || "/scholar_avatar.jpg"}
                alt="ScholarSync Avatar"
                width={40}
                height={40}
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  ScholarSync
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  OS v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Academic Command Center
              </p>
            </div>
          </div>

          {/* Center Ctrl+K Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCommandPalette();
            }}
            className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-medium w-64 shadow-inner"
          >
            <span className="truncate flex-1 text-left">Search commands & tools...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300 border border-white/10">
              ⌘K
            </kbd>
            <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Clock & Online Students Pill */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">4,210 Scholars Online</span>
              </div>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-cyan-300 font-medium">
                {timeStr || "12:00:00 PM"}
              </span>
            </div>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio effects" : "Unmute audio effects"}
              className={`p-2 rounded-xl transition-all border ${
                soundEnabled
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Reset to Demo Data */}
            <button
              onClick={() => {
                if (confirm("Reset assignments, courses, and timer to school demo data?")) {
                  onResetData();
                  sound.playClick();
                }
              }}
              title="Reset to default school demo data"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Auth Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    sound.playClick();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 transition-all text-xs font-semibold text-white"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden relative ring-1 ring-cyan-400">
                    <Image src={user.avatar} alt="Avatar" width={24} height={24} unoptimized className="object-cover" />
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f172a] border border-white/15 p-3 shadow-2xl z-50 animate-fadeIn">
                    <div className="pb-2 mb-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAuth();
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none no-scrollbar border-t border-white/[0.04]">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  sound.playClick();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-indigo-400/50"
                    : item.highlight && !isActive
                    ? "text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white text-indigo-950"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
