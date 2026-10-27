"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../audio";
import {
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  BookOpen,
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

interface NotesTabProps {
  userEmail?: string;
}

export default function NotesTab({ userEmail }: NotesTabProps) {
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const notesStorageKey = userEmail
    ? `scholarsync_notes_${userEmail.trim().toLowerCase()}`
    : "scholarsync_notes";

  useEffect(() => {
    const saved = localStorage.getItem(notesStorageKey);
    if (saved !== null) {
      setContent(saved);
    } else {
      setContent(templates.cornell);
    }
  }, [notesStorageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem(notesStorageKey, val);
  };

  const loadTemplate = (key: string) => {
    sound.playClick();
    if (content.length > 50 && !confirm("Replace current scratchpad with this template?")) {
      return;
    }
    const tmpl = templates[key] || "";
    setContent(tmpl);
    localStorage.setItem(notesStorageKey, tmpl);
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
        <div className="flex items-center gap-2">
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

      {/* Editor Panel */}
      <div className="glass-panel space-y-4" style={{ padding: 'var(--card-padding)' }}>
        <textarea
          value={content}
          onChange={handleChange}
          rows={18}
          placeholder="Jot down formulas, lecture insights, essay outlines, or study reminders..."
          className="w-full p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text)] font-mono text-scale-xs sm:text-scale-sm leading-relaxed focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] resize-y"
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

          <span className="text-emerald-400 text-2xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Auto-saved locally
          </span>
        </div>
      </div>
    </div>
  );
}
