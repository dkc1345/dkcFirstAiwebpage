"use client";

import React, { useState } from "react";
import { sound } from "../audio";
import { Task, motivationalQuotes } from "../schoolData";
import { TabKey } from "./Navbar";
import { UserProfile } from "./AuthModal";
import {
  Sparkles, Award, Clock, ArrowRight,
  BookOpen, CheckCircle2, Calendar, Compass,
  BellRing, Lightbulb, CheckSquare, LogIn,
  TrendingUp, ChevronRight, Flame, Zap, RotateCcw,
} from "lucide-react";

interface DashboardProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  setActiveTab: (tab: TabKey) => void;
  weightedGpa: string;
  unweightedGpa: string;
  todayFocusMinutes: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export default function DashboardTab({
  tasks, onToggleTask, setActiveTab,
  weightedGpa, unweightedGpa, todayFocusMinutes,
  user, onOpenAuth,
}: DashboardProps) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const currentQuote = motivationalQuotes[quoteIdx % motivationalQuotes.length];

  const go = (tab: TabKey) => { setActiveTab(tab); sound.playClick(); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

  const studyProgress = Math.min((todayFocusMinutes / 90) * 100, 100);
  const taskProgress = tasks.length ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col min-w-0 animate-fadeIn" style={{ gap: 'var(--section-gap)' }}>

      {/* ── Hero Welcome Banner ───────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-indigo-950/60 via-[var(--bg-card)] to-[var(--bg-card)]">
        {/* Decorative ambient glows */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 bottom-0 w-48 h-48 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            {/* Left content */}
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold tracking-widest uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-dot" />
                  {user?.role ?? "Academic Dashboard"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-[28px] font-black leading-tight mb-2.5 text-white">
                {greeting},{" "}
                <span className="animate-shimmer-text">{user?.name ?? "Scholar"}</span>{" "}
                <span className="inline-block animate-float">{greetingEmoji}</span>
              </h1>

              <p className="text-scale-sm sm:text-scale-base text-zinc-400 leading-relaxed mb-5">
                You have{" "}
                <span className="font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  {pendingTasks.length} tasks
                </span>{" "}
                pending and a weighted GPA of{" "}
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  {weightedGpa}
                </span>
                . Let&apos;s crush it today.
              </p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  id="start-focus-btn"
                  onClick={() => go("pomodoro")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-scale-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" /> Start Focus Session
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
                {!user ? (
                  <button
                    id="sign-in-btn"
                    onClick={() => { onOpenAuth(); sound.playClick(); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-scale-sm font-semibold border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                ) : (
                  <button
                    id="review-homework-btn"
                    onClick={() => go("tasks")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-scale-sm font-semibold border border-white/[0.08] hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Review Homework ({pendingTasks.length})
                  </button>
                )}
              </div>
            </div>

            {/* Right: Mini stats summary */}
            <div className="flex sm:flex-col gap-5 sm:gap-3 sm:items-end shrink-0">
              {/* Streak */}
              <div className="text-center sm:text-right">
                <p className="text-2xs font-bold uppercase tracking-widest text-zinc-600 mb-1">Study Streak</p>
                <div className="flex items-center gap-1 justify-center sm:justify-end">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-black text-white">7</span>
                  <span className="text-scale-xs text-zinc-500 ml-0.5">days</span>
                </div>
              </div>
              {/* Daily progress */}
              <div className="text-center sm:text-right">
                <p className="text-2xs font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Today&apos;s Goal</p>
                <div className="w-28 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar-gradient transition-all duration-1000"
                    style={{ width: `${studyProgress}%` }}
                  />
                </div>
                <p className="text-2xs text-zinc-500 mt-1">{todayFocusMinutes}/90 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--card-gap)' }}>
        {[
          {
            label: "Pending Tasks", value: String(pendingTasks.length),
            sub: `${completedTasks.length} of ${tasks.length} done`,
            icon: <CheckSquare className="w-4 h-4" />,
            iconCls: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            tab: "tasks" as TabKey, progress: taskProgress, barCls: "from-indigo-500 to-violet-400",
          },
          {
            label: "Weighted GPA", value: weightedGpa,
            sub: `Unweighted: ${unweightedGpa}`,
            icon: <Award className="w-4 h-4" />,
            iconCls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            tab: "gpa" as TabKey,
          },
          {
            label: "Study Time", value: `${todayFocusMinutes}m`,
            sub: "Target: 90 min/day",
            icon: <Clock className="w-4 h-4" />,
            iconCls: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            tab: "pomodoro" as TabKey, progress: studyProgress, barCls: "from-cyan-500 to-sky-400",
          },
          {
            label: "Next Class", value: "AP Calc BC",
            sub: "Period 1 · Room 304",
            icon: <Calendar className="w-4 h-4" />,
            iconCls: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            tab: "schedule" as TabKey,
          },
        ].map((card) => (
          <div
            key={card.label}
            id={`stat-card-${card.tab}`}
            onClick={() => go(card.tab)}
            className="glass-panel glass-panel-hover p-4 sm:p-5 cursor-pointer group hover-lift relative overflow-hidden"
          >
            {/* Subtle background accent */}
            <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full blur-2xl opacity-25 pointer-events-none ${card.iconCls.split(" ")[1]}`} />

            <div className="flex items-start justify-between mb-3">
              <p className="text-2xs font-bold tracking-wider text-zinc-500 uppercase">{card.label}</p>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 ${card.iconCls}`}>
                {card.icon}
              </span>
            </div>

            <p className="text-[26px] font-black text-white leading-none mb-1.5">{card.value}</p>
            <p className="text-scale-xs text-zinc-500">{card.sub}</p>

            {card.progress !== undefined && (
              <div className="mt-3.5 w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${card.barCls}`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-w-0" style={{ gap: 'var(--section-gap)' }}>

        {/* ── Priority Homework (2-col) ─── */}
        <div className="lg:col-span-2 glass-panel min-w-0 overflow-hidden" style={{ padding: 0 }}>
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-white leading-none">Priority Homework</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">{completedTasks.length} of {tasks.length} completed</p>
              </div>
              <span className="ml-1 px-2 py-0.5 rounded-lg text-[11px] bg-indigo-500/12 text-indigo-400 border border-indigo-500/20 font-bold">
                {pendingTasks.length}
              </span>
            </div>
            <button
              id="view-all-tasks-btn"
              onClick={() => go("tasks")}
              className="text-scale-xs text-zinc-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task list */}
          <div className="p-4 space-y-2">
            {pendingTasks.slice(0, 5).map((task, i) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.04] hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group stagger-item animate-slide-up"
              >
                {/* Checkbox */}
                <button
                  id={`toggle-task-${task.id}`}
                  onClick={() => { onToggleTask(task.id); sound.playSuccess(); }}
                  className={`
                    w-5 h-5 shrink-0 rounded-[6px] flex items-center justify-center
                    transition-all cursor-pointer
                    ${task.completed
                      ? "bg-emerald-500 border-0"
                      : "border-[1.5px] border-zinc-600/80 hover:border-indigo-400 hover:bg-indigo-500/10"
                    }
                  `}
                >
                  {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-scale-sm font-medium truncate transition-all ${task.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span
                      className="text-2xs font-bold px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: `${task.subjectColor}18`, color: task.subjectColor }}
                    >
                      {task.subject}
                    </span>
                    <span className="text-2xs text-zinc-600">{task.dueDate}</span>
                    <span className="text-2xs text-zinc-600 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> ~{task.estimatedMinutes}m
                    </span>
                  </div>
                </div>

                {/* Priority badge */}
                <span className={`shrink-0 text-2xs font-black px-2 py-1 rounded-lg uppercase tracking-widest ${task.priority === "Urgent"
                  ? "bg-rose-500/12 text-rose-400 border border-rose-500/20"
                  : task.priority === "High"
                    ? "bg-amber-500/12 text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/12 text-blue-400 border border-blue-500/20"
                  }`}>
                  {task.priority}
                </span>
              </div>
            ))}

            {pendingTasks.length === 0 && (
              <div className="py-12 text-center animate-scaleIn">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-scale-base font-bold text-white mb-1">All caught up!</p>
                <p className="text-scale-xs text-zinc-500">No pending homework tasks. Great work!</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ─── */}
        <div className="space-y-4 min-w-0">

          {/* Daily Mindset */}
          <div className="glass-panel relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-400/8 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-2xs font-bold uppercase tracking-[0.1em] text-zinc-500">Daily Mindset</span>
              </div>
              <button
                id="shuffle-quote-btn"
                onClick={() => { sound.playClick(); setQuoteIdx((p) => (p + 1) % motivationalQuotes.length); }}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all cursor-pointer group"
                title="Shuffle quote"
              >
                <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <blockquote className="text-[13px] text-zinc-300 italic leading-relaxed border-l-2 border-indigo-500/50 pl-3.5 mb-2.5">
              &ldquo;{currentQuote.text}&rdquo;
            </blockquote>
            <p className="text-right text-scale-xs font-semibold text-indigo-400">— {currentQuote.author}</p>
          </div>

          {/* Campus Bulletin */}
          <div className="glass-panel overflow-hidden" style={{ padding: 0 }}>
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <BellRing className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className="text-[13px] font-bold text-white">Campus Bulletin</h3>
              <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" />
            </div>

            <div className="p-3 space-y-2">
              {[
                { title: "Science Fair Signups", date: "Oct 15", color: "#818cf8", desc: "Submit lab proposals to Room 108 by 4 PM Friday." },
                { title: "Extended Library Hours", date: "Midterms", color: "#22d3ee", desc: "Open until 9 PM with peer tutoring tables." },
                { title: "AP Pre-Registration", date: "Counseling", color: "#fbbf24", desc: "Verify AP student IDs with your counselor." },
              ].map((a) => (
                <div
                  key={a.title}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.09] hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-bold" style={{ color: a.color }}>{a.title}</p>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ color: a.color, background: `${a.color}18` }}
                    >
                      {a.date}
                    </span>
                  </div>
                  <p className="text-2xs text-zinc-500 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Access Cards ────────────────────────── */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3.5">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <p className="text-2xs font-bold tracking-[0.12em] uppercase text-zinc-600">Quick Access</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--card-gap)' }}>
          {[
            { label: "Study & Quiz", icon: <BookOpen className="w-5 h-5" />, tab: "flashcards" as TabKey, color: "indigo", iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", hoverBorder: "hover:border-indigo-500/35", hoverBg: "hover:bg-indigo-500/5" },
            { label: "GPA Analytics", icon: <TrendingUp className="w-5 h-5" />, tab: "gpa" as TabKey, color: "emerald", iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", hoverBorder: "hover:border-emerald-500/35", hoverBg: "hover:bg-emerald-500/5" },
            { label: "STEM Toolkit", icon: <Compass className="w-5 h-5" />, tab: "stem" as TabKey, color: "cyan", iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400", hoverBorder: "hover:border-cyan-500/35", hoverBg: "hover:bg-cyan-500/5" },
            { label: "Scratchpad", icon: <Sparkles className="w-5 h-5" />, tab: "notes" as TabKey, color: "purple", iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-400", hoverBorder: "hover:border-purple-500/35", hoverBg: "hover:bg-purple-500/5" },
          ].map((q) => (
            <button
              id={`quick-access-${q.tab}`}
              key={q.label}
              onClick={() => go(q.tab)}
              className={`glass-panel flex flex-col items-center gap-3 p-5 text-center cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97] ${q.hoverBorder} ${q.hoverBg} group`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 group-hover:rotate-3 ${q.iconBg}`}>
                {q.icon}
              </div>
              <span className="text-scale-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
