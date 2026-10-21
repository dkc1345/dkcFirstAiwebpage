"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function ScheduleTab() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [simulatedPeriod, setSimulatedPeriod] = useState<number | null>(1);
  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<SchedulePeriod | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const teachers = [
    { name: "Mr. Henderson", subject: "AP Calculus BC", email: "henderson@campus.edu", officeHours: "Mon/Wed 3:15 PM" },
    { name: "Dr. Alistair Vance", subject: "AP Physics C", email: "avance@campus.edu", officeHours: "Tue/Thu 3:30 PM" },
    { name: "Mrs. Katherine Adams", subject: "Honors US History", email: "kadams@campus.edu", officeHours: "Friday 11:30 AM" },
    { name: "Ms. Rebecca Thorne", subject: "AP English Literature", email: "rthorne@campus.edu", officeHours: "Daily 7:45 AM" },
    { name: "Prof. David Lin", subject: "Honors Computer Science", email: "dlin@campus.edu", officeHours: "Mon/Thu 3:15 PM" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-purple-400" />
            Class Schedule & Bell Timetable
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily classroom rotations, teacher contact information, and active study periods.
          </p>
        </div>

        {/* Day of Week Selector */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                sound.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedDay === day
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Live / Simulated Current Period Banner */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Simulated Bell Schedule
            </span>
            <p className="text-sm font-semibold text-white">
              Currently Highlighting: Period {simulatedPeriod || 1} — AP Calculus BC
            </p>
          </div>
        </div>

        {/* Simulation switcher for testing */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Simulate Period:</span>
          {[1, 2, 3, 4, 5, 6, 7].map((p) => (
            <button
              key={p}
              onClick={() => {
                setSimulatedPeriod(p);
                sound.playClick();
              }}
              className={`w-7 h-7 rounded-lg font-mono font-bold transition-all ${simulatedPeriod === p
                  ? "bg-indigo-600 text-white"
                  : "bg-white/[0.05] text-slate-400 hover:text-white"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Period Cards */}
      <div className="space-y-3">
        {weeklySchedule.map((item) => {
          const isCurrent = simulatedPeriod === item.period;
          return (
            <div
              key={item.period}
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
                    Period
                  </span>
                  <span className="text-lg font-black leading-tight">{item.period}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {item.course}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.category === "STEM"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : item.category === "Humanities"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                    >
                      {item.category}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        In Session
                      </span>
                    )}
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
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Faculty Directory & Help Hours</h3>
          </div>
          <span className="text-xs text-slate-400">Semester 1 Faculty</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
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
              💡 <strong>Upcoming:</strong> Midterm exam review materials available on the student portal. Don't forget your scientific calculator!
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
