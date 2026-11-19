"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import { X, Palette, Moon, Sun, Sparkles, Trees, Timer, Check } from "lucide-react";

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
    icon: <Timer className="w-5 h-5" />,
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
    icon: <Sparkles className="w-5 h-5" />,
    bgHex: "#11081a",
    cardHex: "#231236",
    accentHex: "#c084fc",
    previewClass: "bg-[#11081a]",
  },
];

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  showGridPattern?: boolean;
  onSetGridPattern?: (enabled: boolean) => void;
}

export default function ThemeModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  showGridPattern = true,
  onSetGridPattern,
}: ThemeModalProps) {
  // Local drafts: ONLY modified within this modal, NOT applied to the browser until "Done"
  const [draftTheme, setDraftTheme] = useState<ThemeId>(currentTheme);
  const [draftGrid, setDraftGrid] = useState<boolean>(showGridPattern);

  // Sync draft whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setDraftTheme(currentTheme);
      setDraftGrid(showGridPattern);
    }
  }, [isOpen, currentTheme, showGridPattern]);

  const handleCancel = () => {
    sound.playClick();
    // Discard any draft changes without touching the browser
    setDraftTheme(currentTheme);
    setDraftGrid(showGridPattern);
    onClose();
  };

  const handleSave = () => {
    sound.playClick();
    // Apply changes to the browser only now
    if (draftTheme !== currentTheme) {
      onSelectTheme(draftTheme);
    }
    if (onSetGridPattern && draftGrid !== showGridPattern) {
      onSetGridPattern(draftGrid);
    }
    onClose();
  };

  const handlePickTheme = (themeId: ThemeId) => {
    sound.playClick();
    // Only update local draft selection (does NOT apply to browser yet)
    setDraftTheme(themeId);
  };

  const handleToggleGrid = () => {
    sound.playClick();
    // Only update local draft toggle (does NOT apply to browser yet)
    setDraftGrid((prev) => !prev);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, currentTheme, showGridPattern]);

  if (!isOpen) return null;

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
                Themes & Appearance
              </h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                Personalize workspace color palettes and background patterns
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close themes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {THEME_OPTIONS.map((option) => {
              const isActive = draftTheme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handlePickTheme(option.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text)] shadow-sm ring-1 ring-[var(--accent)]/40"
                      : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="p-1.5 bg-[var(--bg-card)] rounded-lg text-[var(--accent)] shrink-0 border border-[var(--border)]">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{option.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{option.badge}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[var(--accent)] shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>

          {/* Background Grid Pattern Toggle */}
          {onSetGridPattern && (
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">Background Grid Pattern</p>
                <p className="text-[11px] text-[var(--text-muted)]">Subtle structural engineering matrix lines on background</p>
              </div>
              <button
                onClick={handleToggleGrid}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  draftGrid
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
                }`}
              >
                {draftGrid ? "Enabled" : "Disabled"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between text-[12px] text-[var(--text-muted)] shrink-0">
          <span>Click Done to apply changes.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-[13px] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-[13px] transition-all cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
