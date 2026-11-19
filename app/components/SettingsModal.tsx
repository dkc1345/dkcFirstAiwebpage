"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import { X, Settings, Palette, Check, RefreshCw, LayoutGrid } from "lucide-react";
import { ThemeId, THEME_OPTIONS } from "./ThemeModal";
export type { ThemeId, ThemeOption } from "./ThemeModal";
export type { PomodoroPresets } from "./PomodoroSettingsModal";
export { POMODORO_PRESET_PACKS } from "./PomodoroSettingsModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  showGridPattern: boolean;
  onSetGridPattern: (enabled: boolean) => void;
  onResetAll?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  showGridPattern,
  onSetGridPattern,
  onResetAll,
}: SettingsModalProps) {
  // Local draft state — only applies upon clicking "Done"
  const [draftTheme, setDraftTheme] = useState<ThemeId>(currentTheme);
  const [draftGrid, setDraftGrid] = useState<boolean>(showGridPattern);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDraftTheme(currentTheme);
      setDraftGrid(showGridPattern);
      setResetConfirm(false);
    }
  }, [isOpen, currentTheme, showGridPattern]);

  const handleCancel = () => {
    sound.playClick();
    setDraftTheme(currentTheme);
    setDraftGrid(showGridPattern);
    setResetConfirm(false);
    onClose();
  };

  const handleSave = () => {
    sound.playClick();
    if (draftTheme !== currentTheme) {
      onSelectTheme(draftTheme);
    }
    if (draftGrid !== showGridPattern) {
      onSetGridPattern(draftGrid);
    }
    onClose();
  };

  const handleTriggerReset = () => {
    sound.playClick();
    if (onResetAll) {
      onResetAll();
    }
    // Reset theme to Pure White (light) and grid pattern to enabled
    setDraftTheme("light");
    onSelectTheme("light"); // apply immediately
    setDraftGrid(true);
    onSetGridPattern && onSetGridPattern(true);
    setResetConfirm(false);
    onClose();
  };
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

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
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] leading-none">
                Settings
              </h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                Manage webpage appearance, themes, and global preferences
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Themes & Colors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Themes & Appearance</span>
              </span>
              <span className="text-[11px] text-[var(--accent)] font-semibold">
                6 Curated Palettes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_OPTIONS.map((option) => {
                const isActive = draftTheme === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      sound.playClick();
                      setDraftTheme(option.id);
                    }}
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
          </div>

          {/* Section: Background Matrix Pattern */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] flex items-center justify-between my-[5px]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)]">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">Background Grid Pattern</p>
                <p className="text-[11px] text-[var(--text-muted)]">Subtle structural engineering matrix lines on workspace background</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setDraftGrid(!draftGrid);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                draftGrid
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              {draftGrid ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Section: Reset to Default Settings */}
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-[5px]">
            <div>
              <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Webpage Settings
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Restore theme and UI settings back to factory defaults without affecting your signed-in user session.
              </p>
            </div>
            {resetConfirm ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerReset}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setResetConfirm(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                Reset to Defaults
              </button>
            )}
          </div>
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
