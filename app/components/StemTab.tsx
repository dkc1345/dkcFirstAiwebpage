"use client";

import React, { useState } from "react";
import { sound } from "../audio";
import {
  Compass,
  Variable,
  Triangle,
  Percent,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from "lucide-react";

export default function StemTab() {
  const [tool, setTool] = useState<"quadratic" | "triangle" | "curve" | "units">("quadratic");

  // Quadratic state
  const [qa, setQa] = useState(1);
  const [qb, setQb] = useState(-5);
  const [qc, setQc] = useState(6);

  // Triangle state
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);

  // Curve state
  const [rawScore, setRawScore] = useState(72);
  const [totalPoints, setTotalPoints] = useState(85);
  const [curveType, setCurveType] = useState<"linear" | "sqrt">("sqrt");
  const [flatBonus, setFlatBonus] = useState(5);

  // Units state
  const [unitCategory, setUnitCategory] = useState<"temp" | "speed" | "energy">("temp");
  const [unitInputVal, setUnitInputVal] = useState(100);

  // Copied toast state
  const [copied, setCopied] = useState(false);

  // Quadratic calculations
  const discriminant = qb * qb - 4 * qa * qc;
  let root1 = "";
  let root2 = "";
  if (qa !== 0) {
    if (discriminant > 0) {
      const r1 = (-qb + Math.sqrt(discriminant)) / (2 * qa);
      const r2 = (-qb - Math.sqrt(discriminant)) / (2 * qa);
      root1 = `x₁ = ${r1.toFixed(3)}`;
      root2 = `x₂ = ${r2.toFixed(3)}`;
    } else if (discriminant === 0) {
      const r = -qb / (2 * qa);
      root1 = `x = ${r.toFixed(3)} (Double Root)`;
      root2 = "";
    } else {
      const realPart = (-qb / (2 * qa)).toFixed(3);
      const imagPart = (Math.sqrt(-discriminant) / (2 * qa)).toFixed(3);
      root1 = `x₁ = ${realPart} + ${imagPart}i`;
      root2 = `x₂ = ${realPart} - ${imagPart}i`;
    }
  }
  const vertexX = qa !== 0 ? (-qb / (2 * qa)).toFixed(2) : "0";
  const vertexY = qa !== 0 ? (qc - (qb * qb) / (4 * qa)).toFixed(2) : "0";

  // Triangle calculations
  const hypotenuse = Math.sqrt(sideA * sideA + sideB * sideB);
  const triangleArea = 0.5 * sideA * sideB;
  const trianglePerimeter = sideA + sideB + hypotenuse;
  const angleDeg = (Math.atan(sideA / sideB) * (180 / Math.PI)).toFixed(1);
  const otherAngleDeg = (90 - parseFloat(angleDeg)).toFixed(1);

  // Grade Curve calculations
  const rawPct = totalPoints > 0 ? (rawScore / totalPoints) * 100 : 0;
  let curvedPct = rawPct;
  if (curveType === "sqrt") {
    // Square root curve: curved = 10 * sqrt(rawScore / totalPoints * 100)
    curvedPct = Math.min(100, 10 * Math.sqrt(rawPct));
  } else {
    // Linear flat bump
    curvedPct = Math.min(100, rawPct + flatBonus);
  }

  const copyToClipboard = (text: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Compass className="w-8 h-8 text-cyan-400" />
          STEM Quick Toolkit & Solvers
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interactive mathematical solvers, geometric calculators, and exam grading assistants to verify homework steps.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "quadratic", label: "Quadratic Solver (ax²+bx+c)", icon: <Variable className="w-4 h-4" /> },
          { id: "triangle", label: "Right Triangle & Pythagoras", icon: <Triangle className="w-4 h-4" /> },
          { id: "curve", label: "Test Grade Curve Analyzer", icon: <Percent className="w-4 h-4" /> },
          { id: "units", label: "Scientific Unit Converter", icon: <RefreshCw className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTool(t.id as any);
              sound.playClick();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${tool === t.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* QUADRATIC SOLVER */}
      {tool === "quadratic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Variable className="w-5 h-5 text-indigo-400" />
              Quadratic Equation Inputs
            </h2>
            <p className="text-xs text-slate-400">
              Standard form: <span className="font-mono text-cyan-300">ax² + bx + c = 0</span>
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coefficient a
                </label>
                <input
                  type="number"
                  value={qa}
                  onChange={(e) => setQa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Coefficient b
                </label>
                <input
                  type="number"
                  value={qb}
                  onChange={(e) => setQb(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Constant c
                </label>
                <input
                  type="number"
                  value={qc}
                  onChange={(e) => setQc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-sm text-center text-cyan-300">
              {qa}x² {qb >= 0 ? `+ ${qb}` : `- ${Math.abs(qb)}`}x {qc >= 0 ? `+ ${qc}` : `- ${Math.abs(qc)}`} = 0
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Solution & Properties</h3>
              <button
                onClick={() => copyToClipboard(`${root1} ${root2}`)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Roots"}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                  Roots / Solutions
                </span>
                <div className="text-xl font-mono font-bold text-white mt-1">
                  {root1} {root2 && <span className="mx-2 text-slate-400">|</span>} {root2}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block">Discriminant (Δ)</span>
                  <span className="font-mono text-base font-bold text-white mt-0.5 block">
                    {discriminant.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {discriminant > 0
                      ? "2 distinct real roots"
                      : discriminant === 0
                        ? "1 repeated real root"
                        : "2 complex conjugate roots"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block">Parabola Vertex (h, k)</span>
                  <span className="font-mono text-base font-bold text-cyan-300 mt-0.5 block">
                    ({vertexX}, {vertexY})
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Opens {qa > 0 ? "Upward (Minimum)" : "Downward (Maximum)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT TRIANGLE & PYTHAGORAS */}
      {tool === "triangle" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Triangle className="w-5 h-5 text-indigo-400" />
              Right Triangle Sides
            </h2>
            <p className="text-xs text-slate-400">
              Pythagorean Theorem: <span className="font-mono text-cyan-300">a² + b² = c²</span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Leg a (Altitude)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={sideA}
                  onChange={(e) => setSideA(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Leg b (Base)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={sideB}
                  onChange={(e) => setSideB(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Visual SVG Triangle */}
            <div className="flex items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
              <svg width="220" height="150" viewBox="0 0 220 150">
                <polygon
                  points="30,120 190,120 30,20"
                  fill="rgba(99, 102, 241, 0.15)"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                />
                <rect x="30" y="105" width="15" height="15" fill="none" stroke="#94a3b8" />
                <text x="12" y="70" fill="#a5b4fc" fontSize="12" fontFamily="monospace">
                  a={sideA}
                </text>
                <text x="100" y="140" fill="#a5b4fc" fontSize="12" fontFamily="monospace">
                  b={sideB}
                </text>
                <text x="120" y="60" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  c={hypotenuse.toFixed(2)}
                </text>
              </svg>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Calculated Geometric Properties
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-cyan-300 font-semibold uppercase tracking-wider block">
                  Hypotenuse (c)
                </span>
                <span className="text-2xl font-mono font-black text-white mt-1 block">
                  {hypotenuse.toFixed(3)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-300 font-semibold uppercase tracking-wider block">
                  Triangle Area (½ab)
                </span>
                <span className="text-2xl font-mono font-black text-white mt-1 block">
                  {triangleArea.toFixed(3)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 font-semibold block">Perimeter (a + b + c)</span>
                <span className="text-xl font-mono font-bold text-white mt-1 block">
                  {trianglePerimeter.toFixed(3)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 font-semibold block">Acute Angles</span>
                <span className="text-sm font-mono font-bold text-indigo-300 mt-1 block">
                  α = {angleDeg}° | β = {otherAngleDeg}°
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRADE CURVE ANALYZER */}
      {tool === "curve" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" />
              Exam Score Parameters
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Raw Points Earned
                </label>
                <input
                  type="number"
                  value={rawScore}
                  onChange={(e) => setRawScore(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Max Points
                </label>
                <input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Curve Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurveType("sqrt")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${curveType === "sqrt"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-white/[0.02] border-white/5 text-slate-400"
                    }`}
                >
                  Square Root Curve (10 × √Score)
                </button>
                <button
                  onClick={() => setCurveType("linear")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${curveType === "linear"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-white/[0.02] border-white/5 text-slate-400"
                    }`}
                >
                  Flat Point Curve (+pts)
                </button>
              </div>
            </div>

            {curveType === "linear" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Flat Bonus Added: +{flatBonus}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={flatBonus}
                  onChange={(e) => setFlatBonus(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            )}
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Curved vs Raw Comparison
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Raw Percentage
                </span>
                <span className="text-3xl font-black text-slate-200 mt-2 block">
                  {rawPct.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  {rawScore} / {totalPoints}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-xs text-emerald-300 uppercase tracking-wider block font-bold">
                  Curved Percentage
                </span>
                <span className="text-3xl font-black text-emerald-400 mt-2 block">
                  {curvedPct.toFixed(1)}%
                </span>
                <span className="text-xs text-emerald-300 font-semibold mt-1 block">
                  +{(curvedPct - rawPct).toFixed(1)}% Boost
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIT CONVERTER */}
      {tool === "units" && (
        <div className="glass-panel p-6 max-w-xl mx-auto space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Scientific Unit Conversions</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "temp", label: "Temperature" },
              { id: "speed", label: "Speed" },
              { id: "energy", label: "Energy" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setUnitCategory(c.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${unitCategory === c.id
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Input Value
            </label>
            <input
              type="number"
              value={unitInputVal}
              onChange={(e) => setUnitInputVal(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-sm">
            {unitCategory === "temp" && (
              <>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Celsius (°C):</span>
                  <span className="font-mono text-white font-bold">{unitInputVal}°C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Fahrenheit (°F):</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {((unitInputVal * 9) / 5 + 32).toFixed(2)}°F
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Kelvin (K):</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {(unitInputVal + 273.15).toFixed(2)} K
                  </span>
                </div>
              </>
            )}

            {unitCategory === "speed" && (
              <>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Meters / Second (m/s):</span>
                  <span className="font-mono text-white font-bold">{unitInputVal} m/s</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Kilometers / Hour (km/h):</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {(unitInputVal * 3.6).toFixed(2)} km/h
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Miles / Hour (mph):</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {(unitInputVal * 2.23694).toFixed(2)} mph
                  </span>
                </div>
              </>
            )}

            {unitCategory === "energy" && (
              <>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Joules (J):</span>
                  <span className="font-mono text-white font-bold">{unitInputVal} J</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Calories (cal):</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {(unitInputVal / 4.184).toFixed(2)} cal
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Kilowatt-Hours (kWh):</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {(unitInputVal / 3.6e6).toExponential(3)} kWh
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
