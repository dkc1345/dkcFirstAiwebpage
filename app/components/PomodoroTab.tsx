"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { sound } from "../audio";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Headphones,
  Volume2,
  Sparkles,
  Flame,
  Award,
  Zap,
  Infinity as InfinityIcon,
  Clock,
  Edit2,
  Check,
  X,
  Sliders,
  Settings,
} from "lucide-react";
import { PomodoroPresets, ThemeId } from "./SettingsModal";
import { NotificationType } from "../hooks/useNotifications";

interface PomodoroTabProps {
  todayFocusMinutes: number;
  onAddFocusMinutes: (minutes: number) => void;
  pomodoroPresets?: PomodoroPresets;
  onUpdatePomodoroPresets?: (presets: PomodoroPresets) => void;
  onOpenSettings?: () => void;
  currentTheme?: ThemeId;
  onNotify?: (type: NotificationType, title: string, body: string, emoji: string) => void;
}

type Mode = "focus" | "shortBreak" | "longBreak" | "unlimited";

const DEFAULT_STANDARD_DURATIONS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  unlimited: 60,
};

export default function PomodoroTab({
  todayFocusMinutes,
  onAddFocusMinutes,
  pomodoroPresets,
  onUpdatePomodoroPresets,
  onOpenSettings,
  currentTheme,
  onNotify,
}: PomodoroTabProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [unlimitedType, setUnlimitedType] = useState<"countup" | "countdown">(
    pomodoroPresets?.unlimitedDefaultType ?? "countup"
  );
  const [durations, setDurations] = useState({
    focus: pomodoroPresets?.focus ?? 25,
    shortBreak: pomodoroPresets?.shortBreak ?? 5,
    longBreak: pomodoroPresets?.longBreak ?? 15,
    unlimited: pomodoroPresets?.unlimitedTarget ?? 60,
  });

  const [timeLeft, setTimeLeft] = useState(
    (pomodoroPresets?.focus ?? 25) * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);

  // Custom time editing state
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(
    (pomodoroPresets?.unlimitedTarget ?? 60).toString()
  );
  const [editMinutesInput, setEditMinutesInput] = useState("25");
  const [editSecondsInput, setEditSecondsInput] = useState("00");

  // Feedback notification toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setFeedbackToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  };

  // Ambient sound generator state
  const [ambientType, setAmbientType] = useState<"rain" | "binaural" | "whitenoise">("rain");
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when presets change in SettingsModal
  useEffect(() => {
    if (pomodoroPresets) {
      setDurations({
        focus: pomodoroPresets.focus,
        shortBreak: pomodoroPresets.shortBreak,
        longBreak: pomodoroPresets.longBreak,
        unlimited: pomodoroPresets.unlimitedTarget,
      });
      setUnlimitedType(pomodoroPresets.unlimitedDefaultType);
      setCustomMinInput(pomodoroPresets.unlimitedTarget.toString());

      if (!isRunning) {
        if (mode === "unlimited") {
          if (pomodoroPresets.unlimitedDefaultType === "countup") {
            setTimeLeft(0);
          } else {
            setTimeLeft(pomodoroPresets.unlimitedTarget * 60);
          }
        } else {
          setTimeLeft(pomodoroPresets[mode] * 60);
        }
      }
    }
  }, [pomodoroPresets]);

  // Mode or preset change — resets duration back to standard defaults
  useEffect(() => {
    setIsRunning(false);
    setIsEditingTime(false);
    
    // Always restore the default standard duration when switching mode
    const defaultMins = DEFAULT_STANDARD_DURATIONS[mode];
    setDurations((prev) => ({ ...prev, [mode]: defaultMins }));

    if (mode === "unlimited") {
      if (unlimitedType === "countup") {
        setTimeLeft(0);
      } else {
        setTimeLeft(defaultMins * 60);
      }
    } else {
      setTimeLeft(defaultMins * 60);
    }
  }, [mode, unlimitedType]);

  // SVG Progress calculations
  const totalTimeForCurrentMode =
    mode === "unlimited"
      ? unlimitedType === "countup"
        ? 3600 // 1 hour per loop in countup
        : durations.unlimited * 60
      : durations[mode] * 60;

  const progressRatio =
    mode === "unlimited" && unlimitedType === "countup"
      ? Math.min(1, (timeLeft % 3600) / 3600)
      : Math.max(0, Math.min(1, (totalTimeForCurrentMode - timeLeft) / (totalTimeForCurrentMode || 1)));

  // Circle dimensions for SVG progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const completionPendingRef = useRef(false);

  // Main timer tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === "unlimited" && unlimitedType === "countup") {
          setTimeLeft((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              completionPendingRef.current = true;
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, unlimitedType, durations]);

  // Handle timer completion outside of the state updater to prevent setState-during-render errors
  useEffect(() => {
    if (completionPendingRef.current && timeLeft === 0) {
      completionPendingRef.current = false;
      handleComplete();
    }
  }, [timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    sound.playTimerBell();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#06b6d4", "#10b981", "#fbbf24"],
    });

    if (mode === "focus" || mode === "unlimited") {
      const minutesToAdd =
        mode === "unlimited" ? durations.unlimited : durations.focus;
      onAddFocusMinutes(minutesToAdd);
      setCompletedSessions((c) => c + 1);
      showToast(`Sprint complete! +${minutesToAdd}m added to total focus!`);
      onNotify?.("focus", "🎯 Focus Sprint Complete!", `You crushed a ${minutesToAdd}-minute deep work block. +${minutesToAdd}m added to today's total. Time for a break!`, "⏱️");
      if (mode === "focus") {
        setMode("shortBreak");
      }
    } else {
      setMode("focus");
      showToast("Break finished! Time for next deep sprint.");
      onNotify?.("success", "☕ Break Over — Back to Work!", "Your rest period ended. Time to start the next focus sprint!", "✅");
    }
  };

  const handleFinishCountUp = () => {
    setIsRunning(false);
    sound.playTimerBell();
    const minutesFocused = Math.max(1, Math.round(timeLeft / 60));
    onAddFocusMinutes(minutesFocused);
    setCompletedSessions((c) => c + 1);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#6366f1", "#06b6d4"],
    });
    showToast(`Great session! +${minutesFocused}m logged to your day!`);
    onNotify?.("streak", "🔥 Unlimited Session Logged!", `Incredible! You focused for ${minutesFocused} minutes non-stop. +${minutesFocused}m added to today's total!`, "∞");
    setTimeLeft(0);
  };

  const toggleTimer = () => {
    sound.playClick();
    const willRun = !isRunning;
    setIsRunning(willRun);
    if (!willRun) {
      // Pausing
      const elapsed =
        mode === "unlimited" && unlimitedType === "countup"
          ? timeLeft
          : (durations[mode === "unlimited" ? "unlimited" : mode] * 60) - timeLeft;
      const mins = Math.max(0, Math.floor(elapsed / 60));
      const modeLabel = mode === "focus" ? "Focus Sprint" : mode === "shortBreak" ? "Short Break" : mode === "longBreak" ? "Long Rest" : "Unlimited Session";
      onNotify?.("warning", `⏸ ${modeLabel} Paused`, `Timer paused after ${mins}m elapsed. Resume when you're ready to continue.`, "⏸");
    } else {
      const modeLabel = mode === "focus" ? "Focus Sprint" : mode === "shortBreak" ? "Short Break" : mode === "longBreak" ? "Long Rest" : "Unlimited Flow";
      onNotify?.("info", `▶ ${modeLabel} Started`, `Your ${modeLabel.toLowerCase()} timer is now running. Stay focused!`, "⏱️");
    }
  };

  const resetTimer = () => {
    sound.playClick();
    const wasRunning = isRunning;
    setIsRunning(false);

    // Reset current mode duration back to standard default
    const defaultMin = DEFAULT_STANDARD_DURATIONS[mode];
    setDurations((prev) => ({ ...prev, [mode]: defaultMin }));

    if (mode === "unlimited" && unlimitedType === "countup") {
      setTimeLeft(0);
      showToast("Timer reset to 00:00");
      if (wasRunning) onNotify?.("warning", "🔄 Session Reset", "Your unlimited flow timer was reset back to 00:00.", "🔄");
    } else {
      const targetSecs = defaultMin * 60;
      setTimeLeft(targetSecs);
      showToast(`Timer reset to default ${defaultMin}m`);
      if (wasRunning) onNotify?.("warning", "🔄 Timer Reset", `The ${mode === "focus" ? "focus sprint" : mode === "shortBreak" ? "short break" : "long rest"} timer was reset to default ${defaultMin} minutes.`, "🔄");
    }
  };

  const skipTimer = () => {
    sound.playClick();
    if (mode === "unlimited" && unlimitedType === "countup") {
      if (timeLeft >= 30) {
        handleFinishCountUp();
      } else {
        setTimeLeft(0);
        setIsRunning(false);
        showToast("Session ended");
        onNotify?.("info", "⏭ Session Ended", "Your unlimited flow session was ended early.", "∞");
      }
    } else {
      handleComplete();
    }
  };

  // Adjust time on the fly (+ / - buttons)
  const adjustTime = (deltaMinutes: number) => {
    sound.playClick();
    const deltaSeconds = deltaMinutes * 60;
    if (mode === "unlimited" && unlimitedType === "countup") {
      setTimeLeft((prev) => Math.max(0, prev + deltaSeconds));
      showToast(`${deltaMinutes > 0 ? `+${deltaMinutes}m` : `${deltaMinutes}m`} adjusted`);
    } else {
      const nextTime = Math.max(10, timeLeft + deltaSeconds);
      const nextMins = Math.max(1, Math.round(nextTime / 60));
      setTimeLeft(nextTime);
      setDurations((d) => ({ ...d, [mode]: nextMins }));
      showToast(`${deltaMinutes > 0 ? `+${deltaMinutes}m` : `${deltaMinutes}m`} (now ${Math.floor(nextTime / 60)}m ${nextTime % 60}s)`);
    }
  };

  // Direct edit time handlers
  const handleStartEditTime = () => {
    sound.playClick();
    setEditMinutesInput(Math.floor(timeLeft / 60).toString());
    setEditSecondsInput((timeLeft % 60).toString().padStart(2, "0"));
    setIsEditingTime(true);
  };

  const handleSaveEditTime = () => {
    sound.playClick();
    const mins = Math.max(0, parseInt(editMinutesInput, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(editSecondsInput, 10) || 0));
    const totalSecs = mins * 60 + secs;

    if (totalSecs < 1 && (mode !== "unlimited" || unlimitedType !== "countup")) {
      showToast("Please enter at least 1 second");
      return;
    }

    setTimeLeft(totalSecs);
    if (mode === "unlimited" && unlimitedType === "countup") {
      showToast(`Elapsed time adjusted to ${formatTime(totalSecs)}`);
    } else {
      const newDurationMins = Math.max(1, Math.ceil(totalSecs / 60));
      setDurations((prev) => ({ ...prev, [mode]: newDurationMins }));
      showToast(`Timer duration set to ${formatTime(totalSecs)}`);
    }
    setIsEditingTime(false);
  };

  // Preset selector in unlimited mode
  const handleSelectPreset = (mins: number) => {
    sound.playClick();
    setUnlimitedType("countdown");
    setDurations((prev) => ({ ...prev, unlimited: mins }));
    setTimeLeft(mins * 60);
    setIsRunning(false);
    if (onUpdatePomodoroPresets && pomodoroPresets) {
      onUpdatePomodoroPresets({
        ...pomodoroPresets,
        unlimitedTarget: mins,
        unlimitedDefaultType: "countdown",
      });
    }
    showToast(`Timer set to ${mins} minutes`);
  };

  const handleSelectCountUp = () => {
    sound.playClick();
    setUnlimitedType("countup");
    setTimeLeft(0);
    setIsRunning(false);
    if (onUpdatePomodoroPresets && pomodoroPresets) {
      onUpdatePomodoroPresets({
        ...pomodoroPresets,
        unlimitedDefaultType: "countup",
      });
    }
    showToast("Unlimited open flow session activated");
  };

  const handleSetCustomMinutes = () => {
    const mins = parseInt(customMinInput, 10);
    if (!mins || mins <= 0 || mins > 999) {
      showToast("Enter a valid duration (1-999 mins)");
      return;
    }
    handleSelectPreset(mins);
  };

  // Ambient sound handlers
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      sound.stopAmbient();
      setIsAmbientPlaying(false);
      onNotify?.("info", "🔇 Ambient Sound Stopped", "Soundscape paused. Click \"Start Sound\" to resume focus audio.", "🎵");
    } else {
      sound.startAmbient(ambientType, ambientVolume);
      setIsAmbientPlaying(true);
      const soundName = ambientType === "rain" ? "🌧️ Rainfall" : ambientType === "binaural" ? "🧠 Alpha 432Hz Binaural" : "💨 White Noise";
      onNotify?.("info", `🎵 Ambient Sound On — ${soundName}`, `${soundName} is now playing at ${Math.round(ambientVolume * 100)}% volume to boost your focus flow.`, "🎵");
    }
  };

  const handleAmbientChange = (type: "rain" | "binaural" | "whitenoise") => {
    setAmbientType(type);
    if (isAmbientPlaying) {
      sound.startAmbient(type, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    if (isAmbientPlaying) {
      sound.startAmbient(ambientType, vol);
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
            Pomodoro & Deep Focus Lab
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Lock into deep work with timed study sprints, custom & unlimited sessions, and scientifically-tuned ambient soundscapes.
          </p>
        </div>

        {/* Quick button to open Settings & Preset Presets */}
        {onOpenSettings && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-card-hover)] transition-all shadow-sm cursor-pointer"
            title="Open Appearance & Background Settings to adjust Pomodoro presets and webpage color"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Pomodoro Presets</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Center Clock */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-xl transition-colors duration-300">
          {/* Subtle toast alert */}
          {feedbackToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--accent)]/50 text-[var(--text)] text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* Mode Selector Tabs (Color-fit to webpage theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] mb-4 z-10 flex-wrap justify-center transition-colors duration-300">
            <button
              onClick={() => {
                setMode("focus");
                sound.playClick();
              }}
              style={
                mode === "focus"
                  ? { backgroundColor: "var(--accent)", color: "#ffffff" }
                  : undefined
              }
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === "focus"
                  ? "shadow-lg shadow-indigo-600/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              Focus Sprint ({durations.focus}m)
            </button>
            <button
              onClick={() => {
                setMode("shortBreak");
                sound.playClick();
              }}
              style={
                mode === "shortBreak"
                  ? { backgroundColor: "var(--cyan)", color: "#09090b" }
                  : undefined
              }
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === "shortBreak"
                  ? "shadow-lg shadow-cyan-600/20 font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              Short Break ({durations.shortBreak}m)
            </button>
            <button
              onClick={() => {
                setMode("longBreak");
                sound.playClick();
              }}
              style={
                mode === "longBreak"
                  ? { backgroundColor: "var(--accent)", color: "#ffffff" }
                  : undefined
              }
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === "longBreak"
                  ? "shadow-lg shadow-purple-600/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              Long Rest ({durations.longBreak}m)
            </button>
            <button
              onClick={() => {
                setMode("unlimited");
                sound.playClick();
              }}
              style={
                mode === "unlimited"
                  ? { backgroundColor: "var(--amber)", color: "#09090b" }
                  : undefined
              }
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === "unlimited"
                  ? "font-bold shadow-lg shadow-amber-500/25"
                  : "text-amber-500 hover:text-amber-400 hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              <InfinityIcon className="w-4 h-4" />
              <span>Unlimited (∞)</span>
            </button>
          </div>

          {/* Unlimited Preset Configuration Toolbar */}
          {mode === "unlimited" && (
            <div className="w-full max-w-xl mb-4 p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] backdrop-blur-sm animate-fadeIn flex flex-col gap-2.5 transition-colors duration-300">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Unlimited Preset Options:</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                  <button
                    onClick={handleSelectCountUp}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      unlimitedType === "countup"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    Count Up (∞ Endless)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setUnlimitedType("countdown");
                      setTimeLeft(durations.unlimited * 60);
                      setIsRunning(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      unlimitedType === "countdown"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    Custom Countdown
                  </button>
                </div>
              </div>

              {/* Quick Presets & Time Changer */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">Presets:</span>
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSelectPreset(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      unlimitedType === "countdown" && durations.unlimited === mins
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold"
                        : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}

                {/* Custom Minutes Input */}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customMinInput}
                    onChange={(e) => setCustomMinInput(e.target.value)}
                    placeholder="Min"
                    className="w-16 px-2 py-1 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text)] text-center focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSetCustomMinutes}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SVG Circular Timer (Color fitted to webpage background) */}
          <div className="relative flex items-center justify-center my-2 max-w-full">
            <svg
              viewBox="0 0 280 280"
              className="w-64 h-64 xs:w-72 xs:h-72 sm:w-80 sm:h-80 max-w-[85vw] max-h-[85vw] -rotate-90 transform"
            >
              {/* Track Ring fitted to webpage theme border */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="var(--border)"
                strokeWidth="12"
                fill="transparent"
                className="transition-colors duration-300 opacity-70"
              />
              {/* Animated Progress Ring fitted to theme accent/color */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="transition-all duration-500 timer-circle"
                stroke={
                  mode === "focus"
                    ? "var(--accent)"
                    : mode === "shortBreak"
                    ? "var(--cyan)"
                    : mode === "longBreak"
                    ? "var(--accent)"
                    : "var(--amber)"
                }
                strokeWidth="12"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Central Time Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              {isEditingTime ? (
                <div className="flex items-center gap-2 z-20 bg-[var(--bg-card)] border border-[var(--accent)]/40 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md animate-fadeIn">
                  <div className="flex items-center gap-1 font-mono text-2xl font-bold">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={editMinutesInput}
                      onChange={(e) => setEditMinutesInput(e.target.value)}
                      className="w-16 px-2 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[var(--text)] text-center focus:outline-none focus:border-[var(--accent)]"
                      placeholder="MM"
                      autoFocus
                    />
                    <span className="text-[var(--text)]">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editSecondsInput}
                      onChange={(e) => setEditSecondsInput(e.target.value)}
                      className="w-16 px-2 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[var(--text)] text-center focus:outline-none focus:border-[var(--accent)]"
                      placeholder="SS"
                    />
                  </div>
                  <button
                    onClick={handleSaveEditTime}
                    className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
                    title="Apply Time"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingTime(false)}
                    className="p-2 bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] rounded-xl transition-all cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleStartEditTime}
                  className="group cursor-pointer relative flex flex-col items-center"
                  title="Click to manually edit timer time"
                >
                  <span className="font-mono text-4xl xs:text-5xl sm:text-6xl font-black text-[var(--text)] tracking-tight group-hover:text-[var(--accent)] transition-colors">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5">
                    <Edit2 className="w-3 h-3 text-[var(--accent)]" /> Click to edit time
                  </span>
                </div>
              )}

              <span className="text-xs uppercase tracking-widest font-semibold mt-2 text-[var(--text-muted)] flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning
                      ? mode === "unlimited"
                        ? "bg-amber-400 animate-ping"
                        : "bg-emerald-400 animate-ping"
                      : "bg-slate-400 opacity-60"
                  }`}
                />
                {mode === "focus"
                  ? "Deep Study Block"
                  : mode === "shortBreak"
                  ? "Recharge Time"
                  : mode === "longBreak"
                  ? "Rest & Hydrate"
                  : unlimitedType === "countup"
                  ? "∞ Unlimited Flow Stream"
                  : `Custom Focus (${durations.unlimited}m)`}
              </span>
            </div>
          </div>

          {/* Quick Time Adjusters (+ / - buttons) */}
          <div className="flex items-center gap-1.5 my-3 z-10 flex-wrap justify-center">
            <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-muted)]" /> Adjust:
            </span>
            {[-10, -5, -1, 1, 5, 10, 15].map((delta) => (
              <button
                key={delta}
                onClick={() => adjustTime(delta)}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title={`${delta > 0 ? "Add" : "Subtract"} ${Math.abs(delta)} minutes`}
              >
                {delta > 0 ? `+${delta}m` : `${delta}m`}
              </button>
            ))}
            <button
              onClick={handleStartEditTime}
              className="p-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-all hover:scale-105 cursor-pointer"
              title="Type custom time"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timer Controls (Color fitted to webpage theme) */}
          <div className="flex items-center gap-4 mt-3 z-10">
            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] transition-all hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              style={{
                backgroundColor: isRunning
                  ? "var(--amber)"
                  : mode === "unlimited"
                  ? "var(--amber)"
                  : "var(--accent)",
                color: isRunning || mode === "unlimited" ? "#09090b" : "#ffffff",
              }}
              className="px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 cursor-pointer hover:opacity-90"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>
                    {mode === "unlimited" && unlimitedType === "countup"
                      ? "Pause Flow"
                      : "Pause Timer"}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {mode === "unlimited" && unlimitedType === "countup"
                      ? timeLeft > 0
                        ? "Resume Flow"
                        : "Start Unlimited Flow"
                      : "Start Focus"}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={skipTimer}
              title={
                mode === "unlimited" && unlimitedType === "countup"
                  ? "Finish & Log Session"
                  : "Skip / Complete Sprint"
              }
              className={`p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                mode === "unlimited" && unlimitedType === "countup" && timeLeft >= 30
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/30"
                  : "bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              {mode === "unlimited" && unlimitedType === "countup" && timeLeft >= 30 ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <SkipForward className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Sprints completed banner */}
          <div className="mt-7 flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              {completedSessions} Sprints Done Today
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-500" />
              {todayFocusMinutes} min total focus
            </span>
          </div>
        </div>

        {/* Right 1 Col: Ambient Audio Generator & Study Techniques */}
        <div className="space-y-6">
          {/* Ambient Audio Lab */}
          <div className="glass-panel p-6 space-y-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[var(--cyan)]" />
                <h3 className="text-base font-bold text-[var(--text)]">Ambient Soundscape</h3>
              </div>
              <button
                onClick={toggleAmbientSound}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isAmbientPlaying
                    ? "bg-[var(--cyan)] text-slate-950"
                    : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                {isAmbientPlaying ? "Playing" : "Start Sound"}
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Web Audio synthesis creates immersive, real-time noise masking without distracting loop artifacts.
            </p>

            {/* Sound options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "rain", label: "🌧️ Rainfall" },
                { id: "binaural", label: "🧠 Alpha 432Hz" },
                { id: "whitenoise", label: "💨 White Noise" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAmbientChange(s.id as "rain" | "binaural" | "whitenoise")}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                    ambientType === s.id
                      ? "border-[var(--cyan)] bg-[var(--cyan)]/15 text-[var(--cyan)] font-bold"
                      : "bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Volume control */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Volume
                </span>
                <span>{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--cyan)]"
              />
            </div>
          </div>

          {/* Proven School Study Frameworks */}
          <div className="glass-panel p-6 space-y-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl transition-colors duration-300">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-[var(--text)]">Study Power Principles</h3>
            </div>

            <div className="space-y-3 text-xs text-[var(--text)]">
              <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                <p className="font-bold text-[var(--accent)]">The 5-Minute Rule</p>
                <p className="text-[var(--text-muted)] mt-1">
                  If starting feels impossible, commit to working for just 5 minutes. 80% of resistance dissolves once motion begins.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                <p className="font-bold text-[var(--cyan)]">Active Recall over Rereading</p>
                <p className="text-[var(--text-muted)] mt-1">
                  Close your notes and write everything you remember from memory. Testing produces 300% higher retention than passive highlight reading.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]">
                <p className="font-bold text-purple-400">Interleaved Practice</p>
                <p className="text-[var(--text-muted)] mt-1">
                  Alternate between problem types (e.g., trig vs integration) rather than massing one type, sharpening exam pattern recognition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
