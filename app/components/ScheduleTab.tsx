"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import { weeklySchedule, SchedulePeriod } from "../schoolData";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Mail,
  GraduationCap,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const SCHEDULE_STORAGE_KEY = "scholarsync_schedule_v1";

export default function ScheduleTab() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [simulatedPeriod, setSimulatedPeriod] = useState<number | null>(1);
  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<SchedulePeriod | null>(null);
  const [schedulesByDay, setSchedulesByDay] = useState<Record<string, SchedulePeriod[]>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [classNavPage, setClassNavPage] = useState(0);
  const [editingPeriodNum, setEditingPeriodNum] = useState<number | null>(null);
  const [formCourse, setFormCourse] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formDay, setFormDay] = useState<string>("Monday");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setSchedulesByDay(parsed);
          return;
        }
      }
    } catch {
      // Fallback to default weeklySchedule
    }
    const initial: Record<string, SchedulePeriod[]> = {};
    days.forEach((d) => {
      initial[d] = weeklySchedule.map((p) => ({ ...p }));
    });
    setSchedulesByDay(initial);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(initial));
  }, []);

  const persistSchedule = (updated: Record<string, SchedulePeriod[]>) => {
    setSchedulesByDay(updated);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(updated));
  };

  const currentDaySchedule = [...(schedulesByDay[selectedDay] || weeklySchedule)].sort(
    (a, b) => a.period - b.period
  );
  const activePeriodObj = currentDaySchedule.find((p) => p.period === (simulatedPeriod || 1));

  const openAddForm = () => {
    sound.playClick();
    setEditingPeriodNum(null);
    setFormCourse("");
    setFormTime("");
    setFormTeacher("");
    setFormRoom("");
    setFormDay(selectedDay);
    setIsFormOpen(true);
  };

  const openEditForm = (item: SchedulePeriod, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setEditingPeriodNum(item.period);
    setFormCourse(item.course);
    setFormTime(item.time);
    setFormTeacher(item.teacher);
    setFormRoom(item.room);
    setFormDay(selectedDay);
    setIsFormOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourse.trim()) return;
    sound.playClick();

    const targetDay = formDay || selectedDay;
    const targetList = [...(schedulesByDay[targetDay] || weeklySchedule)];

    if (editingPeriodNum !== null && targetDay === selectedDay) {
      const updatedDay = targetList.map((p) =>
        p.period === editingPeriodNum
          ? {
              ...p,
              course: formCourse.trim(),
              time: formTime.trim() || "TBA",
              teacher: formTeacher.trim() || "TBA",
              room: formRoom.trim() || "TBA",
            }
          : p
      );
      persistSchedule({ ...schedulesByDay, [targetDay]: updatedDay });
    } else {
      const nextPeriod = targetList.length > 0 ? Math.max(...targetList.map((p) => p.period)) + 1 : 1;
      const newPeriod: SchedulePeriod = {
        period: nextPeriod,
        course: formCourse.trim(),
        time: formTime.trim() || "TBA",
        teacher: formTeacher.trim() || "TBA",
        room: formRoom.trim() || "TBA",
        category: "STEM",
        days: [targetDay],
      };
      const updatedSchedules = { ...schedulesByDay, [targetDay]: [...targetList, newPeriod] };
      if (editingPeriodNum !== null && targetDay !== selectedDay) {
        updatedSchedules[selectedDay] = currentDaySchedule.filter((p) => p.period !== editingPeriodNum);
      }
      persistSchedule(updatedSchedules);
      setSelectedDay(targetDay);
    }
    setIsFormOpen(false);
  };

  const handleDeletePeriod = (periodNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const updatedDay = currentDaySchedule.filter((p) => p.period !== periodNum);
    persistSchedule({ ...schedulesByDay, [selectedDay]: updatedDay });
  };

  const handleDeleteAll = () => {
    sound.playClick();
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    sound.playClick();
    const cleared: Record<string, SchedulePeriod[]> = {};
    days.forEach((d) => {
      cleared[d] = [];
    });
    persistSchedule(cleared);
    setSimulatedPeriod(null);
    setShowDeleteAllConfirm(false);
  };

  const teachers = [
    { name: "Mr. Henderson", subject: "AP Calculus BC", email: "henderson@campus.edu", officeHours: "Mon/Wed 3:15 PM" },
    { name: "Dr. Alistair Vance", subject: "AP Physics C", email: "avance@campus.edu", officeHours: "Tue/Thu 3:30 PM" },
    { name: "Mrs. Katherine Adams", subject: "Honors US History", email: "kadams@campus.edu", officeHours: "Friday 11:30 AM" },
    { name: "Ms. Rebecca Thorne", subject: "AP English Literature", email: "rthorne@campus.edu", officeHours: "Daily 7:45 AM" },
    { name: "Prof. David Lin", subject: "Honors Computer Science", email: "dlin@campus.edu", officeHours: "Mon/Thu 3:15 PM" },
  ];

  return (
    <div className="flex flex-col min-w-0" style={{ gap: 'var(--section-gap)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-scale-3xl font-extrabold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-purple-400" />
            </span>
            Class Schedule
          </h1>
          <p className="text-scale-sm text-[var(--text-muted)] mt-1.5">
            Manage your daily class schedule by day / time / professor / and room.
          </p>
        </div>

        {/* Day of Week Selector + Add Class */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-[var(--border)] overflow-x-auto scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  sound.playClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-scale-xs font-semibold whitespace-nowrap transition-all ${selectedDay === day
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All</span>
          </button>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Live / Simulated Current Period Banner */}
      <div className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900" style={{ padding: 'var(--card-padding)' }}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-2xs font-bold text-emerald-400 uppercase tracking-widest">
              Class Schedule
            </span>
            <p className="text-scale-sm font-semibold text-[var(--text)] mt-0.5">
              Currently Highlighting: Class {simulatedPeriod || 1} — {activePeriodObj?.course || "No Class"}
            </p>
          </div>
        </div>

        {/* Class Navigation Bar (5 per page with prev/next arrows when > 5) */}
        <div className="flex items-center gap-1.5 text-scale-xs">
          <span className="text-[var(--text-muted)] shrink-0">Class:</span>
          {currentDaySchedule.length > 5 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setClassNavPage((p) => Math.max(0, p - 1));
              }}
              disabled={classNavPage === 0}
              aria-label="Previous classes"
              style={{ padding: 0 }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-35 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {currentDaySchedule
            .slice(classNavPage * 5, classNavPage * 5 + 5)
            .map((item) => (
              <button
                key={item.period}
                onClick={() => {
                  setSimulatedPeriod(item.period);
                  sound.playClick();
                  document
                    .getElementById(`schedule-period-${item.period}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`w-7 h-7 rounded-lg font-mono font-bold shrink-0 transition-all ${simulatedPeriod === item.period
                  ? "bg-indigo-600 text-white"
                  : "bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
              >
                {item.period}
              </button>
            ))}
          {currentDaySchedule.length > 5 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                const maxPage = Math.ceil(currentDaySchedule.length / 5) - 1;
                setClassNavPage((p) => Math.min(maxPage, p + 1));
              }}
              disabled={(classNavPage + 1) * 5 >= currentDaySchedule.length}
              aria-label="Next classes"
              style={{ padding: 0 }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-35 transition-all shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowDeleteAllConfirm(false)}
        >
          <div
            className="glass-panel w-full max-w-sm space-y-4 border border-rose-500/30"
            style={{ padding: "var(--card-padding)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-scale-base font-bold text-[var(--text)]">
              Delete All Schedules?
            </h3>
            <p className="text-scale-xs text-[var(--text-muted)]">
              This will remove all classes across Monday–Friday. You can add new classes anytime.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowDeleteAllConfirm(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[var(--text-muted)] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveClass}
          className="glass-panel space-y-4 border-indigo-500/30"
          style={{ padding: 'var(--card-padding)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-scale-base font-bold text-[var(--text)]">
              {editingPeriodNum !== null ? `Edit Class ${editingPeriodNum} (${selectedDay})` : `Add Class to ${selectedDay}`}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              required
              value={formCourse}
              onChange={(e) => setFormCourse(e.target.value)}
              placeholder="Subject (e.g. AP Biology)"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs text-[var(--text)]"
            />
            <input
              type="text"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              placeholder="Time (e.g. 9:00 - 9:50 AM)"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs text-[var(--text)]"
            />
            <input
              type="text"
              value={formTeacher}
              onChange={(e) => setFormTeacher(e.target.value)}
              placeholder="Professor Name (e.g. Dr. Smith)"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs text-[var(--text)]"
            />
            <input
              type="text"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              placeholder="Room Name (e.g. Room 204)"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs text-[var(--text)]"
            />
            <select
              value={formDay}
              onChange={(e) => setFormDay(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-scale-xs text-[var(--text)]"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[var(--text-muted)] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingPeriodNum !== null ? "Update Class" : "Save Class"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Timetable Period Cards */}
      <div className="space-y-3">
        {currentDaySchedule.map((item) => {
          const isCurrent = simulatedPeriod === item.period;
          return (
            <div
              key={item.period}
              id={`schedule-period-${item.period}`}
              onClick={() => {
                setSelectedPeriodDetail(item);
                sound.playClick();
              }}
              className={`glass-panel p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group ${isCurrent
                ? "border-indigo-500/50 bg-indigo-950/30 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/40"
                : "hover:border-white/20"
                }`}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-400 to-cyan-400" />
              )}

              <div className="flex items-start sm:items-center gap-4">
                {/* Period Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${isCurrent
                    ? "bg-indigo-600 border-indigo-400 text-white"
                    : "bg-white/[0.04] border-white/10 text-slate-300"
                    }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
                    Class
                  </span>
                  <span className="text-lg font-black leading-tight">{item.period}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {item.course}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {item.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {item.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {item.teacher}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <button
                  type="button"
                  onClick={(e) => openEditForm(item, e)}
                  title="Edit class"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-500/15 text-[var(--text-muted)] hover:text-indigo-400 border border-[var(--border)] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeletePeriod(item.period, e)}
                  title="Delete class"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-[var(--text-muted)] hover:text-rose-400 border border-[var(--border)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPeriodDetail(item);
                    sound.playClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/5 transition-colors flex items-center gap-1.5"
                >
                  <span>Class Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Directory & Office Hours */}
      <div className="glass-panel space-y-4" style={{ padding: 'var(--card-padding)' }}>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-scale-lg font-bold text-[var(--text)]">Faculty Directory &amp; Help Hours</h3>
          </div>
          <span className="text-scale-xs text-[var(--text-muted)]">Semester 1 Faculty</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teachers.map((t, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <span className="text-[10px] text-indigo-300 font-medium">{t.subject}</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1 text-slate-300">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <a href={`mailto:${t.email}`} className="hover:underline">
                    {t.email}
                  </a>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Office Hours: {t.officeHours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Detail Modal */}
      {selectedPeriodDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-[#0f172a] border border-white/15 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Period {selectedPeriodDetail.period} • {selectedPeriodDetail.category}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedPeriodDetail.course}</h3>
              </div>
              <button
                onClick={() => setSelectedPeriodDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Schedule Time:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {selectedPeriodDetail.time}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Location:</span>
                <span className="text-white font-medium">{selectedPeriodDetail.room}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Instructor:</span>
                <span className="text-white font-medium">{selectedPeriodDetail.teacher}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Meeting Days:</span>
                <span className="text-slate-300">{selectedPeriodDetail.days.join(", ")}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
              <strong>Upcoming:</strong> Midterm exam review materials available on the student portal. Don&apos;t forget your scientific calculator!
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPeriodDetail(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
