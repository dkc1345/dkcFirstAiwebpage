"use client";

import React, { useState, useEffect, useRef } from "react";
import { sound } from "../audio";
import { Bot, Sparkles } from "lucide-react";

interface AiAssistantProps {
  onNavigateTab: (tab: any) => void;
}

// 56px (w-14 h-14) chat head circle
const HEAD_SIZE = 56;
const HALF_HEAD = HEAD_SIZE / 2; // 28px center alignment
const SCREEN_PADDING = 12;

export default function AiAssistantDrawer({ onNavigateTab }: AiAssistantProps) {
  // Center position of the chat head (cx, cy)
  const [centerPos, setCenterPos] = useState<{ cx: number; cy: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const headRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const currentPosRef = useRef<{ cx: number; cy: number }>({ cx: 0, cy: 0 });

  // Initialize position to bottom-right
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scholarsync_chathead_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cx === "number" && typeof parsed.cy === "number") {
          const clampedX = Math.max(SCREEN_PADDING + HALF_HEAD, Math.min(window.innerWidth - SCREEN_PADDING - HALF_HEAD, parsed.cx));
          const clampedY = Math.max(SCREEN_PADDING + HALF_HEAD, Math.min(window.innerHeight - SCREEN_PADDING - HALF_HEAD, parsed.cy));
          setCenterPos({ cx: clampedX, cy: clampedY });
          currentPosRef.current = { cx: clampedX, cy: clampedY };
          return;
        }
      }
    } catch {}

    if (typeof window !== "undefined") {
      const initCx = window.innerWidth - SCREEN_PADDING - HALF_HEAD - 8;
      const initCy = window.innerHeight - SCREEN_PADDING - HALF_HEAD - 16;
      setCenterPos({ cx: initCx, cy: initCy });
      currentPosRef.current = { cx: initCx, cy: initCy };
    }
  }, []);

  // Global window pointermove & pointerup to prevent cursor desync or lag
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      hasMovedRef.current = true;

      // Update position immediately with zero lag
      const targetCx = Math.max(
        SCREEN_PADDING + HALF_HEAD,
        Math.min(window.innerWidth - SCREEN_PADDING - HALF_HEAD, e.clientX)
      );
      const targetCy = Math.max(
        SCREEN_PADDING + HALF_HEAD,
        Math.min(window.innerHeight - SCREEN_PADDING - HALF_HEAD, e.clientY)
      );

      currentPosRef.current = { cx: targetCx, cy: targetCy };

      // Apply directly to DOM element for instantaneous 1:1 hardware acceleration
      if (headRef.current) {
        headRef.current.style.transform = `translate3d(${targetCx - HALF_HEAD}px, ${targetCy - HALF_HEAD}px, 0)`;
      }
    };

    const onWindowPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      if (!hasMovedRef.current) {
        sound.playClick();
        onNavigateTab("aichat");
        return;
      }

      // Smoothly snap to closest side (left or right)
      const current = currentPosRef.current;
      const snapToRight = current.cx > window.innerWidth / 2;
      const snapCx = snapToRight
        ? window.innerWidth - SCREEN_PADDING - HALF_HEAD
        : SCREEN_PADDING + HALF_HEAD;
      const snapCy = Math.max(
        SCREEN_PADDING + HALF_HEAD,
        Math.min(window.innerHeight - SCREEN_PADDING - HALF_HEAD, current.cy)
      );

      setCenterPos({ cx: snapCx, cy: snapCy });
      currentPosRef.current = { cx: snapCx, cy: snapCy };

      if (headRef.current) {
        headRef.current.style.transition = "transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.25), box-shadow 0.2s ease";
        headRef.current.style.transform = `translate3d(${snapCx - HALF_HEAD}px, ${snapCy - HALF_HEAD}px, 0)`;
      }

      try {
        localStorage.setItem(
          "scholarsync_chathead_pos",
          JSON.stringify({ cx: snapCx, cy: snapCy })
        );
      } catch {}
    };

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, [onNavigateTab]);

  // Window resize handler: keeps chat head responsive on all viewport sizes
  useEffect(() => {
    const handleResize = () => {
      setCenterPos((prev) => {
        if (!prev) return null;
        const snapToRight = prev.cx > window.innerWidth / 2;
        const newCx = snapToRight
          ? window.innerWidth - SCREEN_PADDING - HALF_HEAD
          : SCREEN_PADDING + HALF_HEAD;
        const newCy = Math.max(
          SCREEN_PADDING + HALF_HEAD,
          Math.min(window.innerHeight - SCREEN_PADDING - HALF_HEAD, prev.cy)
        );
        currentPosRef.current = { cx: newCx, cy: newCy };
        return { cx: newCx, cy: newCy };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    setIsDragging(true);

    // Disable transition immediately while dragging
    if (headRef.current) {
      headRef.current.style.transition = "none";
    }

    // Lock center of chat head directly to pointer
    const targetCx = Math.max(
      SCREEN_PADDING + HALF_HEAD,
      Math.min(window.innerWidth - SCREEN_PADDING - HALF_HEAD, e.clientX)
    );
    const targetCy = Math.max(
      SCREEN_PADDING + HALF_HEAD,
      Math.min(window.innerHeight - SCREEN_PADDING - HALF_HEAD, e.clientY)
    );

    currentPosRef.current = { cx: targetCx, cy: targetCy };
    setCenterPos({ cx: targetCx, cy: targetCy });

    if (headRef.current) {
      headRef.current.style.transform = `translate3d(${targetCx - HALF_HEAD}px, ${targetCy - HALF_HEAD}px, 0)`;
    }
  };

  if (!centerPos) return null;

  const posX = centerPos.cx - HALF_HEAD;
  const posY = centerPos.cy - HALF_HEAD;

  return (
    <div
      ref={headRef}
      onPointerDown={handlePointerDown}
      style={{
        transform: `translate3d(${posX}px, ${posY}px, 0)`,
        transition: isDragging
          ? "none"
          : "transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.25), box-shadow 0.2s ease",
        touchAction: "none",
        width: `${HEAD_SIZE}px`,
        height: `${HEAD_SIZE}px`,
      }}
      className={`fixed top-0 left-0 z-50 select-none ${
        isDragging ? "cursor-grabbing drop-shadow-2xl" : "cursor-grab"
      }`}
      title="ScholarBot AI — Drag anywhere or click to chat"
      role="button"
      tabIndex={0}
      aria-label="Open ScholarBot AI Copilot"
    >
      <div className="relative group w-full h-full">
        {/* Ambient pulse glow behind head */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

        {/* Facebook-style circular chat bubble */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-700 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 ring-2 ring-white/30 group-hover:ring-white/70 overflow-hidden active:scale-95 transition-transform duration-150">
          {/* Internal gradient sheen */}
          <div className="absolute inset-0 bg-radial from-white/25 to-transparent pointer-events-none" />

          {/* Bot Avatar Icon */}
          <Bot className="w-7 h-7 text-white drop-shadow-md animate-pulse" />

          {/* Sparkle badge */}
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute bottom-2 right-2 opacity-85" />
        </div>

        {/* Online status indicator beacon */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[var(--bg-sidebar,#09090b)] shadow-sm" />
        </span>

        {/* Tooltip badge label on hover */}
        {!isDragging && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 whitespace-nowrap z-50">
            <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-1.5">
              <span className="text-white font-bold text-[11px] keep-white" style={{ color: "#ffffff" }}>
                ScholarBot AI
              </span>
              <span className="text-[10px] font-semibold text-indigo-200 bg-indigo-500/30 px-1.5 py-0.5 rounded font-mono border border-indigo-400/30" style={{ color: "#c7d2fe" }}>
                Chat
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
