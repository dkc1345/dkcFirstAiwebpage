"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import HeaderTopbar from "./components/HeaderTopbar";
import { TabKey } from "./components/Navbar";
import DashboardTab from "./components/DashboardTab";
import TasksTab from "./components/TasksTab";
import PomodoroTab from "./components/PomodoroTab";
import FlashcardsTab from "./components/FlashcardsTab";
import GpaTab from "./components/GpaTab";
import StemTab from "./components/StemTab";
import ScheduleTab from "./components/ScheduleTab";
import NotesTab from "./components/NotesTab";
import AuthModal, { UserProfile } from "./components/AuthModal";
import AiAssistantDrawer from "./components/AiAssistantDrawer";
import AiChatTab from "./components/AiChatTab";
import CommandPaletteModal from "./components/CommandPaletteModal";
import SettingsModal, { ThemeId, PomodoroPresets, POMODORO_PRESET_PACKS } from "./components/SettingsModal";
import { useNotifications } from "./hooks/useNotifications";
import {
  initialTasks,
  initialCourses,
  initialDecks,
  Task,
  CourseGrade,
} from "./schoolData";
import { loadAccountData, saveAccountData, getFreshAccountData } from "./accountsStorage";

const gradeScale: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, F: 0.0,
};

const DEFAULT_POMODORO_PRESETS: PomodoroPresets = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  unlimitedTarget: 60,
  unlimitedDefaultType: "countup",
  presetName: "Classic Pomodoro",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [courses, setCourses] = useState<CourseGrade[]>(initialCourses);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(75);
  const [pomodoroPresets, setPomodoroPresets] = useState<PomodoroPresets>(DEFAULT_POMODORO_PRESETS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("dark");
  const [showGridPattern, setShowGridPattern] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { notifications, push: pushNotif, markRead, markAllRead, dismiss: dismissNotif, clearAll: clearAllNotifs, unreadCount } = useNotifications(user?.email);

  const applyThemeToDOM = useCallback((theme: ThemeId) => {
    try {
      let resolved = theme;
      if (theme === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-theme-setting", theme);
    } catch { }
  }, []);

  const handleSelectTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    try {
      localStorage.setItem("scholarsync_theme", theme);
    } catch { }
  };

  const handleToggleGridPattern = () => {
    setShowGridPattern((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("scholarsync_grid", next.toString());
      } catch { }
      return next;
    });
  };

  useEffect(() => {
    try {
      // Always reset pomodoro presets to standard defaults on page load/restart
      setPomodoroPresets(DEFAULT_POMODORO_PRESETS);
      localStorage.removeItem("scholarsync_pomodoro_presets");

      const savedTheme = (localStorage.getItem("scholarsync_theme") as ThemeId) || "dark";
      setCurrentTheme(savedTheme);
      applyThemeToDOM(savedTheme);

      const savedGrid = localStorage.getItem("scholarsync_grid");
      if (savedGrid !== null) {
        setShowGridPattern(savedGrid !== "false");
      }

      const savedUserStr = localStorage.getItem("scholarsync_user");
      let currentUser: UserProfile;
      if (savedUserStr) {
        currentUser = JSON.parse(savedUserStr);
        setUser(currentUser);
      } else {
        currentUser = {
          name: "Alex Chen",
          email: "alex.chen@student.edu",
          avatar: "/scholar_avatar.jpg",
          role: "AP Scholar • Grade 11",
          provider: "google",
        };
        setUser(currentUser);
      }

      // Load data specifically for this user's account
      const accountData = loadAccountData(currentUser.email);
      setTasks(accountData.tasks);
      setCourses(accountData.courses);
      setTodayFocusMinutes(accountData.focusMinutes);
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
    setIsLoaded(true);
  }, [applyThemeToDOM]);

  // System theme changes listener
  useEffect(() => {
    if (currentTheme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyThemeToDOM("system");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [currentTheme, applyThemeToDOM]);

  // Auto-save active account's tasks, courses, and focus time
  useEffect(() => {
    if (!isLoaded || !user) return;
    try {
      saveAccountData(user.email, { tasks });
    } catch { }
  }, [tasks, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    try {
      saveAccountData(user.email, { courses });
    } catch { }
  }, [courses, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    try {
      saveAccountData(user.email, { focusMinutes: todayFocusMinutes });
    } catch { }
  }, [todayFocusMinutes, user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (user) localStorage.setItem("scholarsync_user", JSON.stringify(user));
      else localStorage.removeItem("scholarsync_user");
    } catch { }
  }, [user, isLoaded]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  const handleLoginSuccess = (p: UserProfile) => {
    // 1. Set the new active account
    setUser(p);
    setIsAuthOpen(false);

    // 2. Load the specific content saved for this account (or clean reset for new account)
    const accountData = loadAccountData(p.email);
    setTasks(accountData.tasks);
    setCourses(accountData.courses);
    setTodayFocusMinutes(accountData.focusMinutes);

    pushNotif(
      "success",
      `Switched to ${p.name}`,
      `Workspace loaded for ${p.email} (${accountData.tasks.length} tasks, ${accountData.courses.length} courses).`,
      "✓",
      { label: "Go to Dashboard", tab: "dashboard" }
    );
  };

  const handleSignOut = () => {
    setUser(null);
    // Reset state to empty guest view
    setTasks([]);
    setCourses([]);
    setTodayFocusMinutes(0);
    pushNotif("info", "Signed out", "You have been signed out. Account workspace cleared.", "—");
  };

  const handleAddTask = (newTask: Omit<Task, "id">) => {
    setTasks((prev) => [{ ...newTask, id: `task-${Date.now()}` }, ...prev]);
    pushNotif("task", "Task Added", `"${newTask.title}" added to your task list.`, "+", { label: "View Tasks", tab: "tasks" });
  };
  const handleToggleTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target && !target.completed) {
      pushNotif("success", "Task Completed", `"${target.title}" marked as done. Great work!`, "✓", { label: "View Tasks", tab: "tasks" });
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };
  const handleDeleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (task) pushNotif("warning", "Task Deleted", `"${task.title}" was removed from your list.`, "✕");
  };

  const handleAddCourse = (newCourse: Omit<CourseGrade, "id">) => {
    setCourses((prev) => [...prev, { ...newCourse, id: `course-${Date.now()}` }]);
    pushNotif("gpa", "Course Added", `${newCourse.name} (${newCourse.type}) added to your GPA tracker.`, "+", { label: "View GPA", tab: "gpa" });
  };
  const handleDeleteCourse = (id: string) => {
    const course = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (course) pushNotif("warning", "Course Removed", `${course.name} was removed from your GPA tracker.`, "✕");
  };
  const handleUpdateCourseGrade = (id: string, grade: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      pushNotif("gpa", "Grade Updated", `${course.name} grade updated to ${grade}.`, "↗", { label: "View GPA", tab: "gpa" });
    }
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade } : c)));
  };
  const handleUpdateCourseType = (id: string, type: "AP" | "Honors" | "Regular") => setCourses((prev) => prev.map((c) => c.id === id ? { ...c, type } : c));
  const handleAddFocusMinutes = (minutes: number) => {
    setTodayFocusMinutes((prev) => prev + minutes);
    pushNotif("focus", "Focus Session Logged", `+${minutes} min added to deep focus.`, "●", { label: "Go to Focus Lab", tab: "pomodoro" });
  };
  const handleUpdatePomodoroPresets = useCallback((presets: PomodoroPresets) => {
    setPomodoroPresets(presets);
    pushNotif("info", "Pomodoro Preset Updated", `Timer set to "${presets.presetName}" — ${presets.focus}m focus, ${presets.shortBreak}m break.`, "⚙", { label: "Open Focus Lab", tab: "pomodoro" });
    try {
      localStorage.setItem("scholarsync_pomodoro_presets", JSON.stringify(presets));
    } catch { }
  }, [pushNotif]);
  const handleResetData = () => {
    setTasks(initialTasks); setCourses(initialCourses); setTodayFocusMinutes(75);
    setPomodoroPresets(DEFAULT_POMODORO_PRESETS);
    localStorage.removeItem("scholarsync_tasks");
    localStorage.removeItem("scholarsync_courses");
    localStorage.removeItem("scholarsync_focus");
    localStorage.removeItem("scholarsync_pomodoro_presets");
    pushNotif("warning", "Data Reset", "All tasks, courses, and focus data have been reset to defaults.", "↺");
  };

  // GPA calculation
  let totalCredits = 0, totalUnweightedPoints = 0, totalWeightedPoints = 0;
  courses.forEach((c) => {
    const base = gradeScale[c.grade] ?? 4.0;
    const boost = base > 0 ? (c.type === "AP" ? 1.0 : c.type === "Honors" ? 0.5 : 0) : 0;
    totalCredits += c.credits;
    totalUnweightedPoints += base * c.credits;
    totalWeightedPoints += (base + boost) * c.credits;
  });
  const unweightedGpa = totalCredits > 0 ? (totalUnweightedPoints / totalCredits).toFixed(2) : "4.00";
  const weightedGpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "4.00";
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div
      className={`flex min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 ${showGridPattern ? "bg-grid-pattern" : ""
        }`}
    >
      {/* ── Sidebar ────────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskCount={pendingTasksCount}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ── Content area ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <HeaderTopbar
          activeTab={activeTab}
          user={user}
          onToggleSidebar={() => {
            // If on mobile, toggle mobile drawer. If on desktop, toggle collapsed state
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
              setIsSidebarOpen(!isSidebarOpen);
            }
          }}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDismissNotification={dismissNotif}
          onClearAllNotifications={clearAllNotifs}
          onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
        />

        {/* Main content — tabs are always mounted; hidden via CSS so stateful
             components like the Pomodoro timer keep running across tab switches. */}
        <main
          onClick={() => {
            if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
            if (isSidebarOpen) setIsSidebarOpen(false);
          }}
          className={`flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${activeTab === "aichat" ? "p-0 overflow-hidden" : "page-content"}`}
        >

          {/* dashboard */}
          <div
            style={{ display: activeTab === "dashboard" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <DashboardTab
              tasks={tasks}
              onToggleTask={handleToggleTask}
              setActiveTab={setActiveTab}
              weightedGpa={weightedGpa}
              unweightedGpa={unweightedGpa}
              todayFocusMinutes={todayFocusMinutes}
              user={user}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>

          {/* tasks */}
          <div
            style={{ display: activeTab === "tasks" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <TasksTab
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* pomodoro — always mounted so timer survives tab switches */}
          <div
            style={{ display: activeTab === "pomodoro" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <PomodoroTab
              todayFocusMinutes={todayFocusMinutes}
              onAddFocusMinutes={handleAddFocusMinutes}
              pomodoroPresets={pomodoroPresets}
              onUpdatePomodoroPresets={handleUpdatePomodoroPresets}
              onOpenSettings={() => setIsSettingsOpen(true)}
              currentTheme={currentTheme}
              onNotify={pushNotif}
            />
          </div>

          {/* flashcards */}
          <div
            style={{ display: activeTab === "flashcards" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <FlashcardsTab decks={initialDecks} />
          </div>

          {/* gpa */}
          <div
            style={{ display: activeTab === "gpa" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <GpaTab
              courses={courses}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
              onUpdateCourseGrade={handleUpdateCourseGrade}
              onUpdateCourseType={handleUpdateCourseType}
              weightedGpa={weightedGpa}
              unweightedGpa={unweightedGpa}
            />
          </div>

          {/* stem */}
          <div
            style={{ display: activeTab === "stem" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <StemTab />
          </div>

          {/* schedule */}
          <div
            style={{ display: activeTab === "schedule" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <ScheduleTab />
          </div>

          {/* notes */}
          <div
            style={{ display: activeTab === "notes" ? undefined : "none" }}
            className="max-w-7xl mx-auto w-full flex flex-col animate-fadeIn"
          >
            <NotesTab userEmail={user?.email} />
          </div>

          {/* aichat — full-page ChatGPT-style bot */}
          <div
            style={{ display: activeTab === "aichat" ? undefined : "none", padding: 0 }}
            className="w-full flex flex-col animate-fadeIn"
          >
            <AiChatTab onExit={() => setActiveTab("dashboard")} />
          </div>

        </main>

        {/* Footer — hidden when inside full-screen AI chat */}
        {activeTab !== "aichat" && (
          <footer className="border-t border-[var(--border)] mt-auto" style={{ padding: 'var(--content-py) var(--content-px)' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[12px] text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-subtle)]">ScholarSync Academic Hub</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Theme: <span className="capitalize text-[var(--text)] font-medium">{currentTheme}</span>
                </button>
                <span>•</span>
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] text-[var(--text-muted)] font-mono text-[11px]">⌘K</kbd> for quick nav</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* ── Overlays ─── */}
      {activeTab !== "aichat" && <AiAssistantDrawer onNavigateTab={setActiveTab} />}

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onResetData={handleResetData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectTheme={handleSelectTheme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        showGridPattern={showGridPattern}
        onToggleGridPattern={handleToggleGridPattern}
        pomodoroPresets={pomodoroPresets}
        onUpdatePomodoroPresets={handleUpdatePomodoroPresets}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
