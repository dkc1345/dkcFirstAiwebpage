"use client";

import React, { useEffect } from "react";
import { sound } from "../audio";
import {
  X,
  Check,
  Laptop,
  Moon,
  Sun,
  Sparkles,
  Trees,
  Palette,
  Timer,
  Clock,
  Zap,
  Sliders,
  Infinity as InfinityIcon,
  Plus,
  Minus,
} from "lucide-react";

export type ThemeId = "system" | "dark" | "light" | "midnight" | "emerald" | "amethyst";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  previewClass: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "system",
    name: "System Default",
    badge: "Auto Sync",
    description: "Automatically matches your operating system's dark or light appearance.",
    icon: <Laptop className="w-5 h-5" />,
    bgHex: "#09090b / #f8fafc",
    cardHex: "#16181c / #ffffff",
    accentHex: "#6366f1",
    previewClass: "bg-gradient-to-r from-[#09090b] via-[#111113] to-[#f8fafc]",
  },
  {
    id: "dark",
    name: "Obsidian Dark",
    badge: "Default Dark",
    description: "Pitch midnight zinc with indigo neon accents. Easy on the eyes at night.",
    icon: <Moon className="w-5 h-5" />,
    bgHex: "#09090b",
    cardHex: "#16181c",
    accentHex: "#6366f1",
    previewClass: "bg-[#09090b]",
  },
  {
    id: "light",
    name: "Pure White",
    badge: "Daylight Mode",
    description: "Crisp, bright, high-contrast daylight theme for focused study and reading.",
    icon: <Sun className="w-5 h-5" />,
    bgHex: "#f8fafc",
    cardHex: "#ffffff",
    accentHex: "#4f46e5",
    previewClass: "bg-[#f8fafc]",
  },
  {
    id: "midnight",
    name: "Midnight Navy",
    badge: "Cosmic Blue",
    description: "Deep oceanic midnight blue with luminous cyan and sapphire glass panels.",
    icon: <Sparkles className="w-5 h-5" />,
    bgHex: "#070d1e",
    cardHex: "#0e1b38",
    accentHex: "#38bdf8",
    previewClass: "bg-[#070d1e]",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    badge: "Cyber Moss",
    description: "Organic deep pine and cypress background with energizing mint accents.",
    icon: <Trees className="w-5 h-5" />,
    bgHex: "#05140d",
    cardHex: "#0c2b1c",
    accentHex: "#10b981",
    previewClass: "bg-[#05140d]",
  },
  {
    id: "amethyst",
    name: "Sunset Velvet",
    badge: "Royal Plum",
    description: "Luxurious deep violet night with glowing amethyst and rose highlights.",
    icon: <Palette className="w-5 h-5" />,
    bgHex: "#11081a",
    cardHex: "#231236",
    accentHex: "#c084fc",
    previewClass: "bg-[#11081a]",
  },
];

export interface PomodoroPresets {
  focus: number;
  shortBreak: number;
  longBreak: number;
  unlimitedTarget: number;
  unlimitedDefaultType: "countup" | "countdown";
  presetName: string;
}

export const POMODORO_PRESET_PACKS: Array<{
  name: string;
  badge: string;
  description: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
  unlimitedTarget: number;
  unlimitedDefaultType: "countup" | "countdown";
}> = [
  {
    name: "Classic Pomodoro",
    badge: "25 / 5 / 15m",
    description: "Standard interval for balanced, fatigue-free study sprints.",
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    unlimitedTarget: 60,
    unlimitedDefaultType: "countup",
  },
  {
    name: "Deep Work Sprint",
    badge: "50 / 10 / 30m",
    description: "Extended double blocks ideal for complex STEM problems and essays.",
    focus: 50,
    shortBreak: 10,
    longBreak: 30,
    unlimitedTarget: 90,
    unlimitedDefaultType: "countup",
  },
  {
    name: "Quick Drill",
    badge: "15 / 3 / 10m",
    description: "Fast high-intensity bursts for flashcards and rapid memorization.",
    focus: 15,
    shortBreak: 3,
    longBreak: 10,
    unlimitedTarget: 45,
    unlimitedDefaultType: "countup",
  },
  {
    name: "Ultradian Flow",
    badge: "90 / 15 / 30m",
    description: "Synchronized with 90-minute human biological peak cognitive cycles.",
    focus: 90,
    shortBreak: 15,
    longBreak: 30,
    unlimitedTarget: 120,
    unlimitedDefaultType: "countup",
  },
  {
    name: "Unlimited Stopwatch",
    badge: "∞ Open Flow",
    description: "Open-ended stopwatch session with zero time limits or pressure.",
    focus: 60,
    shortBreak: 10,
    longBreak: 20,
    unlimitedTarget: 60,
    unlimitedDefaultType: "countup",
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomodoroPresets: PomodoroPresets;
  onUpdatePomodoroPresets: (presets: PomodoroPresets) => void;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  showGridPattern?: boolean;
  onToggleGridPattern?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentTheme = "dark",
  onSelectTheme,
  showGridPattern = true,
  onToggleGridPattern,
  pomodoroPresets,
  onUpdatePomodoroPresets,
}: SettingsModalProps) {
  // ESC key listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPresetPack = (pack: typeof POMODORO_PRESET_PACKS[number]) => {
    sound.playClick();
    onUpdatePomodoroPresets({
      focus: pack.focus,
      shortBreak: pack.shortBreak,
      longBreak: pack.longBreak,
      unlimitedTarget: pack.unlimitedTarget,
      unlimitedDefaultType: pack.unlimitedDefaultType,
      presetName: pack.name,
    });
  };

  const handleAdjustPreset = (
    field: "focus" | "shortBreak" | "longBreak" | "unlimitedTarget",
    delta: number
  ) => {
    sound.playClick();
    const current = pomodoroPresets[field];
    const next = Math.max(1, Math.min(180, current + delta));
    onUpdatePomodoroPresets({
      ...pomodoroPresets,
      [field]: next,
      presetName: "Custom Preset",
    });
  };

  const handleToggleUnlimitedType = (type: "countup" | "countdown") => {
    sound.playClick();
    onUpdatePomodoroPresets({
      ...pomodoroPresets,
      unlimitedDefaultType: type,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl glass-panel bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[var(--accent)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] leading-none">
                Appearance & Pomodoro Settings
              </h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                Customize theme colors, background appearance, and study sprint intervals
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Theme & Appearance Section ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Appearance & Color Themes (5 Styles)</span>
              </span>
              <span className="text-[11px] text-[var(--accent)] font-semibold capitalize">
                Active: {currentTheme}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectTheme?.(theme.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 shadow-sm ring-1 ring-[var(--accent)]/50"
                        : "border-[var(--border)] bg-[var(--bg-input)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-black/20 border border-white/5 text-[var(--accent)]">
                          {theme.icon}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)] leading-tight">
                            {theme.name}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {theme.badge}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/60 text-[10px] text-[var(--text-subtle)]">
                      <span className="truncate max-w-[170px]">{theme.description}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.accentHex }}
                          title={`Accent: ${theme.accentHex}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.bgHex.split(" / ")[0] }}
                          title={`Bg: ${theme.bgHex}`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Background Grid Pattern Toggle */}
            {onToggleGridPattern && (
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between mt-2">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text)]">Background Grid Pattern</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Subtle structural engineering matrix lines on background</p>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleGridPattern();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    showGridPattern
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  {showGridPattern ? "Enabled" : "Disabled"}
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>POMODORO PRESETS</span>
              </span>
              <span className="text-[11px] text-[var(--accent)] font-semibold">
                Active: {pomodoroPresets.presetName}
              </span>
            </div>

            {/* Quick Preset Packs */}
            <div>
              <span className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block">
                Quick Preset Packs:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POMODORO_PRESET_PACKS.map((pack) => {
                  const isPackActive = pomodoroPresets.presetName === pack.name;
                  return (
                    <button
                      key={pack.name}
                      onClick={() => handleSelectPresetPack(pack)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isPackActive
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text)] shadow-sm"
                          : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text)]">
                          {pack.name}
                        </span>
                        {isPackActive && <Check className="w-3 h-3 text-[var(--accent)] stroke-[3]" />}
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-[var(--accent)] mt-0.5">
                        {pack.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Preset Durations */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                Fine-Tune Preset Durations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Focus Duration */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text)]">Focus Sprint</p>
                    <span className="text-[10px] text-[var(--text-muted)]">Work block</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdjustPreset("focus", -5)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="-5 min"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[var(--text)] w-9 text-center">
                      {pomodoroPresets.focus}m
                    </span>
                    <button
                      onClick={() => handleAdjustPreset("focus", 5)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="+5 min"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Short Break Duration */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text)]">Short Break</p>
                    <span className="text-[10px] text-[var(--text-muted)]">Rest block</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdjustPreset("shortBreak", -1)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="-1 min"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[var(--text)] w-9 text-center">
                      {pomodoroPresets.shortBreak}m
                    </span>
                    <button
                      onClick={() => handleAdjustPreset("shortBreak", 1)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="+1 min"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Long Rest Duration */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text)]">Long Rest</p>
                    <span className="text-[10px] text-[var(--text-muted)]">Deep recharge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdjustPreset("longBreak", -5)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="-5 min"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[var(--text)] w-9 text-center">
                      {pomodoroPresets.longBreak}m
                    </span>
                    <button
                      onClick={() => handleAdjustPreset("longBreak", 5)}
                      className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                      title="+5 min"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Unlimited Preset Default Mode */}
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <InfinityIcon className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text)]">
                      Unlimited Preset Default
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Choose between infinite stopwatch count-up or custom target
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                    <button
                      onClick={() => handleToggleUnlimitedType("countup")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        pomodoroPresets.unlimitedDefaultType === "countup"
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      Count Up (∞)
                    </button>
                    <button
                      onClick={() => handleToggleUnlimitedType("countdown")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        pomodoroPresets.unlimitedDefaultType === "countdown"
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      Custom ({pomodoroPresets.unlimitedTarget}m)
                    </button>
                  </div>

                  {pomodoroPresets.unlimitedDefaultType === "countdown" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustPreset("unlimitedTarget", -15)}
                        className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                        title="-15m"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustPreset("unlimitedTarget", 15)}
                        className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                        title="+15m"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between text-[12px] text-[var(--text-muted)] shrink-0">
          <span>Pomodoro presets save instantly to your browser.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-[13px] transition-all cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
