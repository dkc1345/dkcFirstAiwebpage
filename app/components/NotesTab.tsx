"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import {
  FileText,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Pencil,
  Save,
} from "lucide-react";

const templates: Record<string, string> = {
  cornell: `# Cornell Method Lecture Notes
**Course:** AP Calculus BC
**Date:** September 28, 2026
**Topic:** Integration by Parts & Trig Substitution

---
### Cues & Keywords
- Integration by Parts formula: ∫ u dv = uv - ∫ v du
- LIATE rule for choosing u:
  L = Logarithmic
  I = Inverse Trig
  A = Algebraic
  T = Trigonometric
  E = Exponential

---
### Main Lecture Notes
1. When dealing with product of two functions, check if substitution u = g(x) works first.
2. If u-sub fails, select u according to LIATE.
   - Example: ∫ x * e^(2x) dx
     u = x        => du = dx
     dv = e^(2x) dx => v = (1/2) e^(2x)
     Result = (1/2)x e^(2x) - ∫ (1/2) e^(2x) dx
            = (1/2)x e^(2x) - (1/4) e^(2x) + C

---
### Summary
Integration by parts is the calculus counterpart of the product rule. Memorize LIATE priority order.`,

  cheatsheet: `# Midterm Exam Rapid Review Sheet
**Key Science & Math Formulas**

1. **Newton's Second Law:** F_net = m * a
2. **Kinetic Energy:** KE = 0.5 * m * v²
3. **Gravitational Potential Energy:** PE = m * g * h
4. **Quadratic Formula:** x = (-b ± √(b² - 4ac)) / (2a)
5. **Pythagorean Identity:** sin²(θ) + cos²(θ) = 1
6. **Derivative of Exponential:** d/dx [e^(kx)] = k * e^(kx)
7. **Cellular Respiration:** C6H12O6 + 6O2 → 6CO2 + 6H2O + 36-38 ATP`,

  lab: `# Scientific Lab Report Framework
**Title:** Harmonic Motion & Pendulum Period Determination
**Investigator:** Alex Chen
**Lab Partner:** Jamie Lee

### 1. Objective / Hypothesis
Determine the relationship between pendulum string length (L) and oscillation period (T).
*Hypothesis:* T is proportional to the square root of L (T ∝ √L).

### 2. Materials
- Metric measuring tape (±0.1 cm)
- Stop clock (±0.01 s)
- 50g brass bob & monofilament nylon string

### 3. Data Collection Table
- Trial 1 (L = 0.20m): T_avg = 0.90s
- Trial 2 (L = 0.40m): T_avg = 1.27s
- Trial 3 (L = 0.60m): T_avg = 1.55s
- Trial 4 (L = 0.80m): T_avg = 1.79s

### 4. Sources of Error
- Air resistance dampening at larger angles
- Reaction time latency on stopwatch release`,
};

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface NotesTabProps {
  userEmail?: string;
}

export default function NotesTab({ userEmail }: NotesTabProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const notesStorageKey = userEmail
    ? `scholarsync_notes_${userEmail.trim().toLowerCase()}`
    : "scholarsync_notes";
  const notesListKey = `${notesStorageKey}_list`;

  useEffect(() => {
    try {
      const savedList = localStorage.getItem(notesListKey);
      if (savedList) {
        const parsed: NoteItem[] = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Fallback to legacy single note or template
    }

    const legacy = localStorage.getItem(notesStorageKey);
    const initialNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: "Cornell Method Lecture Notes",
      content: legacy !== null ? legacy : templates.cornell,
      updatedAt: Date.now(),
    };
    setNotes([initialNote]);
    setActiveNoteId(initialNote.id);
    localStorage.setItem(notesListKey, JSON.stringify([initialNote]));
  }, [notesStorageKey, notesListKey]);

  const persistNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    localStorage.setItem(notesListKey, JSON.stringify(updated));
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  const content = isEditing ? draftContent : (activeNote?.content ?? "");
  const titleValue = isEditing ? draftTitle : (activeNote?.title ?? "");

  const handleSelectNote = (note: NoteItem) => {
    sound.playClick();
    setActiveNoteId(note.id);
    setIsEditing(false);
    setDraftTitle(note.title);
    setDraftContent(note.content);
  };

  const handleStartEdit = (note: NoteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setActiveNoteId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;
    sound.playClick();
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? { ...n, title: draftTitle.trim() || "Untitled Note", content: draftContent, updatedAt: Date.now() }
        : n
    );
    persistNotes(updated);
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleAddNote = () => {
    sound.playClick();
    const newNote: NoteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: "Untitled Note",
      content: "",
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    persistNotes(updated);
    setActiveNoteId(newNote.id);
    setDraftTitle(newNote.title);
    setDraftContent(newNote.content);
    setIsEditing(true);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === 0) {
      const fallback: NoteItem = {
        id: `note_${Date.now()}`,
        title: "Untitled Note",
        content: "",
        updatedAt: Date.now(),
      };
      persistNotes([fallback]);
      setActiveNoteId(fallback.id);
      setIsEditing(false);
      return;
    }
    persistNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
      setIsEditing(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    setDraftTitle(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isEditing) return;
    setDraftContent(e.target.value);
  };

  const loadTemplate = (key: string) => {
    sound.playClick();
    if (!activeNote) return;
    if (content.length > 50 && !confirm("Replace current note with this template?")) {
      return;
    }
    const tmpl = templates[key] || "";
    setDraftTitle(activeNote.title);
    setDraftContent(tmpl);
    setIsEditing(true);
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playClick();
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "ScholarSync_Study_Notes.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readTimeMin = Math.ceil(words / 200);

  return (
    <div className="flex flex-col min-w-0" style={{ gap: 'var(--section-gap)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-scale-3xl font-extrabold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </span>
            Study Scratchpad &amp; Notes
          </h1>
          <p className="text-scale-sm text-[var(--text-muted)] mt-1.5">
            Markdown-ready note taker with automatic cloud-local synchronization and academic templates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Notes"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Template Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-scale-xs">
        <span className="text-[var(--text-muted)] font-semibold shrink-0">Study Templates:</span>
        <button
          onClick={() => loadTemplate("cornell")}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 whitespace-nowrap transition-colors"
        >
          Cornell Method
        </button>
        <button
          onClick={() => loadTemplate("cheatsheet")}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 whitespace-nowrap transition-colors"
        >
          Exam Formula Sheet
        </button>
        <button
          onClick={() => loadTemplate("lab")}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 whitespace-nowrap transition-colors"
        >
          Science Lab Framework
        </button>
      </div>

      {/* Notes List + Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Saved Notes Sidebar */}
        <div className="lg:col-span-4 glass-panel space-y-3" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-scale-sm font-bold text-[var(--text)]">
              Saved Notes ({notes.length})
            </h2>
          </div>

          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {notes.map((note) => {
              const isActive = activeNote?.id === note.id;
              const preview = note.content.replace(/[#*_`>-]/g, "").trim().slice(0, 60);
              return (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectNote(note)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectNote(note);
                    }
                  }}
                  className={`group flex items-center justify-between gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/40"
                      : "bg-[var(--bg-input)] border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-scale-xs font-bold text-[var(--text)] truncate">
                      {note.title || "Untitled Note"}
                    </p>
                    <p className="text-2xs text-[var(--text-muted)] truncate mt-0.5">
                      {preview || "Empty note..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      title="Delete note"
                      aria-label={`Delete ${note.title || "note"}`}
                      className="p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-rose-400 hover:bg-rose-500/10 opacity-70 group-hover:opacity-100 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-8 glass-panel space-y-4" style={{ padding: 'var(--card-padding)' }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={titleValue}
              onChange={handleTitleChange}
              readOnly={!isEditing}
              placeholder="Note title..."
              className={`flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text)] font-bold text-scale-base focus:outline-none ${
                isEditing ? "focus:border-[var(--border-focus)]" : "opacity-85 cursor-default"
              }`}
            />
            {isEditing ? (
              <button
                type="button"
                onClick={handleSaveNote}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            ) : (
              activeNote && (
                <button
                  type="button"
                  onClick={(e) => handleStartEdit(activeNote, e)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )
            )}
          </div>

          <textarea
            value={content}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={16}
            placeholder={
              isEditing
                ? "Jot down formulas, lecture insights, essay outlines, or study reminders..."
                : "Click Edit to modify this note..."
            }
            className={`w-full p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text)] font-mono text-scale-xs sm:text-scale-sm leading-relaxed focus:outline-none resize-y ${
              isEditing
                ? "focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]"
                : "opacity-85 cursor-default"
            }`}
          />

          <div className="flex items-center justify-between text-scale-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span>
                Words: <strong className="text-[var(--text)]">{words}</strong>
              </span>
              <span>
                Characters: <strong className="text-[var(--text)]">{chars}</strong>
              </span>
              <span>
                Reading Time: ~<strong className="text-[var(--text)]">{readTimeMin} min</strong>
              </span>
            </div>

            {isEditing ? (
              <span className="text-amber-400 text-2xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                Editing — click Save to keep changes
              </span>
            ) : (
              <span className="text-emerald-400 text-2xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                {justSaved ? "Saved!" : "Saved locally"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
