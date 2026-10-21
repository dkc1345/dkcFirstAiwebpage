"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sound } from "../audio";
import { Task } from "../schoolData";
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TasksTab({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TasksTabProps) {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Pending" | "Completed">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Calculus");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Urgent" | "High" | "Normal" | "Low">("High");
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [notes, setNotes] = useState("");

  const subjects = [
    { name: "Calculus", color: "#6366f1" },
    { name: "Physics", color: "#06b6d4" },
    { name: "Literature", color: "#ec4899" },
    { name: "History", color: "#f59e0b" },
    { name: "CompSci", color: "#10b981" },
    { name: "Chemistry", color: "#8b5cf6" },
    { name: "General", color: "#94a3b8" },
  ];

  const handleToggle = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target && !target.completed) {
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#06b6d4", "#10b981", "#ec4899"],
      });
    } else {
      sound.playClick();
    }
    onToggleTask(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedSubject = subjects.find((s) => s.name === subject) || subjects[0];

    onAddTask({
      title: title.trim(),
      subject,
      subjectColor: matchedSubject.color,
      dueDate: dueDate.trim() || "This Week",
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      completed: false,
      notes: notes.trim(),
    });

    sound.playSuccess();
    setIsModalOpen(false);
    setTitle("");
    setDueDate("");
    setNotes("");
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesSubject = selectedSubject === "All" || t.subject === selectedSubject;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Pending" && !t.completed) ||
      (selectedStatus === "Completed" && t.completed);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Homework & Assignment Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-scale-sm text-slate-400 mt-1">
            Organize coursework, track deadlines, and crush your academic goals.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            sound.playClick();
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-scale-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between text-scale-xs sm:text-scale-sm font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-white">Completion Progress</span>
          </div>
          <span className="text-cyan-400">
            {completedCount} of {tasks.length} assignments finished ({progressPercent}%)
          </span>
        </div>
        <div className="mt-3 w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search homework, topics, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-scale-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-500"
            />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 shrink-0">
            {(["All", "Pending", "Completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  sound.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${selectedStatus === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-scale-xs">
          <span className="text-slate-500 font-medium shrink-0">Subject:</span>
          <button
            onClick={() => {
              setSelectedSubject("All");
              sound.playClick();
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedSubject === "All"
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.08]"
              }`}
          >
            All Subjects
          </button>
          {subjects.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setSelectedSubject(s.name);
                sound.playClick();
              }}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedSubject === s.name
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.08]"
                }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`glass-panel p-4 transition-all duration-200 group flex items-start justify-between gap-4 ${task.completed ? "opacity-60 bg-white/[0.02]" : "hover:border-indigo-500/30"
              }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <button
                onClick={() => handleToggle(task.id)}
                className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${task.completed
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "border-slate-500 hover:border-indigo-400 bg-white/[0.03]"
                  }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-base font-semibold transition-all ${task.completed ? "line-through text-slate-400" : "text-white"
                      }`}
                  >
                    {task.title}
                  </span>

                  <span
                    className="text-2xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${task.subjectColor}20`,
                      color: task.subjectColor,
                      border: `1px solid ${task.subjectColor}40`,
                    }}
                  >
                    {task.subject}
                  </span>

                  <span
                    className={`text-2xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.priority === "Urgent"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : task.priority === "High"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.notes && (
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed font-normal">
                    {task.notes}
                  </p>
                )}

                <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Due: <strong className="text-slate-300">{task.dueDate}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Est: {task.estimatedMinutes} minutes
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(`Delete assignment "${task.title}"?`)) {
                  onDeleteTask(task.id);
                  sound.playClick();
                }
              }}
              title="Delete task"
              className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors opacity-60 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="glass-panel p-12 text-center">
            <CheckSquare className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No assignments found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no tasks matching your filters. Try clearing the search or adding a new task!
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-[#0f172a] border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add New Assignment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP Bio Chapter 9 Practice Questions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e293b] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400"
                  >
                    {subjects.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "Urgent" | "High" | "Normal" | "Low")
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1e293b] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow 11:59 PM"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific problem numbers, rubric criteria, or reference links..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
