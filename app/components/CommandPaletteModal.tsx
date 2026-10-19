"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import { TabKey } from "./Navbar";
import {
  Search,
  CheckSquare,
  Timer,
  BookOpen,
  Calculator,
  Compass,
  Calendar,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  Palette,
  Laptop,
  Moon,
  Sun,
  Trees,
} from "lucide-react";
import { ThemeId } from "./SettingsModal";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabKey) => void;
  onResetData: () => void;
  onOpenSettings: () => void;
  onSelectTheme: (theme: ThemeId) => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigateTab,
  onResetData,
  onOpenSettings,
  onSelectTheme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        sound.playClick();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands: {
    id: string;
    title: string;
    category: "Navigation" | "Appearance" | "Tools" | "Actions";
    icon: React.ReactNode;
    action: () => void;
  }[] = [
    {
      id: "theme-settings",
      title: "Open Appearance & Background Settings",
      category: "Appearance",
      icon: <Palette className="w-4 h-4 text-indigo-400" />,
      action: () => onOpenSettings(),
    },
    {
      id: "theme-system",
      title: "Theme: System Default (Auto Dark/Light)",
      category: "Appearance",
      icon: <Laptop className="w-4 h-4 text-slate-400" />,
      action: () => onSelectTheme("system"),
    },
    {
      id: "theme-dark",
      title: "Theme: Obsidian Dark (Midnight Zinc)",
      category: "Appearance",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => onSelectTheme("dark"),
    },
    {
      id: "theme-light",
      title: "Theme: Pure White (Daylight Mode)",
      category: "Appearance",
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      action: () => onSelectTheme("light"),
    },
    {
      id: "theme-midnight",
      title: "Theme: Midnight Navy (Cosmic Blue)",
      category: "Appearance",
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      action: () => onSelectTheme("midnight"),
    },
    {
      id: "theme-emerald",
      title: "Theme: Emerald Forest (Cyber Moss)",
      category: "Appearance",
      icon: <Trees className="w-4 h-4 text-emerald-400" />,
      action: () => onSelectTheme("emerald"),
    },
    {
      id: "theme-amethyst",
      title: "Theme: Sunset Velvet (Royal Plum)",
      category: "Appearance",
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      action: () => onSelectTheme("amethyst"),
    },
    {
      id: "nav-dash",
      title: "Go to Dashboard Overview",
      category: "Navigation",
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      action: () => onNavigateTab("dashboard"),
    },
    {
      id: "nav-tasks",
      title: "View Homework & Tasks Planner",
      category: "Navigation",
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      action: () => onNavigateTab("tasks"),
    },
    {
      id: "nav-pomo",
      title: "Launch Pomodoro Focus Lab & Ambient Sounds",
      category: "Navigation",
      icon: <Timer className="w-4 h-4 text-cyan-400" />,
      action: () => onNavigateTab("pomodoro"),
    },
    {
      id: "nav-flash",
      title: "Practice 3D Study Flashcards & Quiz Arena",
      category: "Navigation",
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      action: () => onNavigateTab("flashcards"),
    },
    {
      id: "nav-gpa",
      title: "Calculate GPA & Final Exam Target Score",
      category: "Navigation",
      icon: <Calculator className="w-4 h-4 text-emerald-400" />,
      action: () => onNavigateTab("gpa"),
    },
    {
      id: "nav-stem",
      title: "Open STEM Quadratic & Geometry Solvers",
      category: "Navigation",
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      action: () => onNavigateTab("stem"),
    },
    {
      id: "nav-sched",
      title: "Check Class Schedule & Bell Timetable",
      category: "Navigation",
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      action: () => onNavigateTab("schedule"),
    },
    {
      id: "nav-notes",
      title: "Open Markdown Study Scratchpad",
      category: "Navigation",
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      action: () => onNavigateTab("notes"),
    },
    {
      id: "action-reset",
      title: "Reset Application to Demo Data",
      category: "Actions",
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      action: () => {
        if (confirm("Reset to default school demo data?")) {
          onResetData();
        }
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl bg-[#0b101d] border border-white/15 shadow-2xl overflow-hidden rounded-3xl">
        {/* Search Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tools (e.g. 'GPA', 'Focus', 'Physics')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 font-medium"
          />
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white/10 rounded border border-white/10">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                sound.playClick();
                cmd.action();
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-white/[0.06] text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 group-hover:border-indigo-500/30">
                  {cmd.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                    {cmd.title}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {cmd.category}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </button>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300">
              Ctrl + K
            </kbd>
            to toggle palette anytime
          </span>
          <span className="text-indigo-400 font-semibold">ScholarSync OS v2.0</span>
        </div>
      </div>
    </div>
  );
}
