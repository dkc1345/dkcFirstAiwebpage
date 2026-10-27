"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sound } from "../audio";
import { CourseGrade } from "../schoolData";
import {
  Award,
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface GpaTabProps {
  courses: CourseGrade[];
  onAddCourse: (course: Omit<CourseGrade, "id">) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateCourseGrade: (id: string, grade: string) => void;
  onUpdateCourseType: (id: string, type: "AP" | "Honors" | "Regular") => void;
  weightedGpa: string;
  unweightedGpa: string;
}

const gradeScale: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export default function GpaTab({
  courses,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourseGrade,
  onUpdateCourseType,
  weightedGpa,
  unweightedGpa,
}: GpaTabProps) {
  // Course creation state
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseType, setNewCourseType] = useState<"AP" | "Honors" | "Regular">("AP");
  const [newCourseGrade, setNewCourseGrade] = useState("A");
  const [newCourseCredits, setNewCourseCredits] = useState(4);

  // Final Exam Target Calculator state
  const [currentGradePct, setCurrentGradePct] = useState(91.5);
  const [desiredGradePct, setDesiredGradePct] = useState(90.0);
  const [examWeightPct, setExamWeightPct] = useState(20);

  // Final exam needed score formula
  // Desired = (Current * (1 - Weight)) + (Needed * Weight)
  // Needed = (Desired - Current * (1 - Weight)) / Weight
  const weightDecimal = examWeightPct / 100;
  const neededScore =
    weightDecimal > 0
      ? (desiredGradePct - currentGradePct * (1 - weightDecimal)) / weightDecimal
      : 0;

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    onAddCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim() || "CRS-100",
      type: newCourseType,
      grade: newCourseGrade,
      credits: Number(newCourseCredits) || 3,
    });

    sound.playSuccess();
    setNewCourseName("");
    setNewCourseCode("");
  };

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);

  const getStanding = (wGpa: number) => {
    if (wGpa >= 4.2) return { title: "Summa Cum Laude / Highest Honors", color: "text-emerald-400" };
    if (wGpa >= 3.8) return { title: "Magna Cum Laude / High Honors", color: "text-cyan-400" };
    if (wGpa >= 3.5) return { title: "Cum Laude / Dean's Honor Roll", color: "text-indigo-400" };
    if (wGpa >= 3.0) return { title: "Good Academic Standing", color: "text-amber-400" };
    return { title: "Academic Support Recommended", color: "text-rose-400" };
  };

  const standing = getStanding(parseFloat(weightedGpa));

  return (
    <div className="flex flex-col min-w-0" style={{ gap: 'var(--section-gap)' }}>
      {/* Header */}
      <div>
        <h1 className="text-scale-3xl font-extrabold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </span>
          GPA Analytics &amp; Final Exam Simulator
        </h1>
        <p className="text-scale-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
          Calculate unweighted and weighted grade point averages with AP/Honors scaling, and predict final exam targets.
        </p>
      </div>

      {/* GPA Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--card-gap)' }}>
        {/* Weighted GPA */}
        <div className="glass-panel relative overflow-hidden" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-bold text-indigo-400 uppercase tracking-widest whitespace-nowrap">
              Weighted GPA (5.0 Scale)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-scale-4xl font-black text-white">{weightedGpa}</span>
            <span className="text-scale-xs text-indigo-300 font-semibold">+1.0 AP / +0.5 Hon</span>
          </div>
          <p className={`mt-2.5 text-scale-xs font-bold ${standing.color}`}>★ {standing.title}</p>
        </div>

        {/* Unweighted GPA */}
        <div className="glass-panel relative overflow-hidden" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-bold text-cyan-400 uppercase tracking-widest whitespace-nowrap">
              Unweighted GPA (4.0 Scale)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-scale-4xl font-black text-cyan-300">{unweightedGpa}</span>
            <span className="text-scale-xs text-[var(--text-muted)]">Standard 4.0</span>
          </div>
          <p className="mt-2.5 text-scale-xs text-[var(--text-muted)]">Pure raw academic average</p>
        </div>

        {/* Total Credits */}
        <div className="glass-panel relative overflow-hidden" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xs font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">
              Course Credits
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-scale-4xl font-black text-white">{totalCredits}</span>
            <span className="text-scale-xs text-[var(--text-muted)]">across {courses.length} courses</span>
          </div>
          <p className="mt-2.5 text-scale-xs text-emerald-400 font-medium">Full course load met</p>
        </div>
      </div>

      {/* Main Grid: Course Manager & Final Exam Target Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--section-gap)' }}>
        {/* Left 2 Cols: Course Roster & Grade Editor */}
        <div className="lg:col-span-2 glass-panel space-y-4" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-scale-lg font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Active Course Roster
            </h2>
            <span className="text-scale-xs text-[var(--text-muted)]">{courses.length} active classes</span>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left" style={{ fontSize: 'var(--text-sm)', minWidth: '520px' }}>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.1em' }}>
                  <th className="pb-3 pl-3">Course Name</th>
                  <th className="pb-3 px-2">Level</th>
                  <th className="pb-3 px-2">Grade</th>
                  <th className="pb-3 px-2 text-center">Credits</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 pl-3 font-medium text-[var(--text)]">
                      <div className="text-scale-sm font-semibold">{course.name}</div>
                      <div className="text-2xs text-[var(--text-subtle)] font-mono mt-0.5">{course.code}</div>
                    </td>

                    <td className="py-3 px-2">
                      <select
                        value={course.type}
                        onChange={(e) =>
                          onUpdateCourseType(
                            course.id,
                            e.target.value as "AP" | "Honors" | "Regular"
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs font-semibold text-indigo-400 focus:outline-none focus:border-[var(--border-focus)]"
                      >
                        <option value="AP" className="bg-slate-900 text-white">AP (+1.0)</option>
                        <option value="Honors" className="bg-slate-900 text-white">Honors (+0.5)</option>
                        <option value="Regular" className="bg-slate-900 text-white">Regular (+0.0)</option>
                      </select>
                    </td>

                    <td className="py-3 px-2">
                      <select
                        value={course.grade}
                        onChange={(e) => onUpdateCourseGrade(course.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs font-bold text-emerald-400 focus:outline-none focus:border-[var(--border-focus)]"
                      >
                        {Object.keys(gradeScale).map((g) => (
                          <option key={g} value={g} className="bg-slate-900 text-white">
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-2 text-center font-mono text-[var(--text-muted)] text-scale-sm">
                      {course.credits}
                    </td>

                    <td className="py-3 pr-2 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove course "${course.name}"?`)) {
                            onDeleteCourse(course.id);
                            sound.playClick();
                          }
                        }}
                        className="text-[var(--text-subtle)] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Course Inline Form */}
          <form
            onSubmit={handleAddCourse}
            className="mt-2 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-2xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Course Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AP Chemistry"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-scale-xs focus:outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-subtle)]"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Level</label>
              <select
                value={newCourseType}
                onChange={(e) =>
                  setNewCourseType(e.target.value as "AP" | "Honors" | "Regular")
                }
                className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-scale-xs focus:outline-none focus:border-[var(--border-focus)]"
              >
                <option value="AP">AP</option>
                <option value="Honors">Honors</option>
                <option value="Regular">Regular</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Grade</label>
              <select
                value={newCourseGrade}
                onChange={(e) => setNewCourseGrade(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-scale-xs focus:outline-none focus:border-[var(--border-focus)]"
              >
                {Object.keys(gradeScale).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-scale-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Final Exam Target Simulator */}
        <div className="glass-panel space-y-5 bg-gradient-to-br from-indigo-950/30 to-cyan-950/20" style={{ padding: 'var(--card-padding)' }}>
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-scale-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Final Exam Target Solver
            </h3>
            <p className="text-scale-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Find out exactly what score you need on your final exam to reach your target course grade.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-scale-xs text-[var(--text-muted)] font-semibold mb-2">
                <span>Current Class Grade</span>
                <span className="text-cyan-400 font-bold">{currentGradePct.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="0.5"
                value={currentGradePct}
                onChange={(e) => setCurrentGradePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-scale-xs text-[var(--text-muted)] font-semibold mb-2">
                <span>Desired Final Grade</span>
                <span className="text-emerald-400 font-bold">{desiredGradePct.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                step="0.5"
                value={desiredGradePct}
                onChange={(e) => setDesiredGradePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-scale-xs text-[var(--text-muted)] font-semibold mb-2">
                <span>Final Exam Weight</span>
                <span className="text-indigo-400 font-bold">{examWeightPct}% of total</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={examWeightPct}
                onChange={(e) => setExamWeightPct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] text-center space-y-2.5">
            <span className="text-2xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Required Score on Final Exam
            </span>
            <div
              className={`text-scale-4xl font-black ${
                neededScore <= 70
                  ? "text-emerald-400"
                  : neededScore <= 90
                  ? "text-cyan-400"
                  : neededScore <= 100
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {neededScore.toFixed(1)}%
            </div>

            <p className="text-scale-xs text-[var(--text-muted)] leading-relaxed">
              {neededScore <= 0
                ? "You have already secured your desired grade, even with a 0% on the final."
                : neededScore <= 75
                ? "Very achievable. Regular review will easily get you there."
                : neededScore <= 90
                ? "Realistic target. Focus on weak problem sets and practice tests."
                : neededScore <= 100
                ? "High target required. Prioritize active recall and mock exams."
                : "Mathematically over 100%. Speak with your instructor about extra credit options."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
