"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isText, setIsText] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable custom cursor on devices that support a fine pointer (mouse/trackpad)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
      }

      // Update dot immediately for zero latency
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const checkTarget = (target: HTMLElement | null) => {
      if (!target) return;

      // Check if hovering over editable text fields
      const textElem = target.closest(
        'textarea, input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), [contenteditable="true"]'
      );
      if (textElem) {
        setIsText(true);
        setIsHovering(true);
        return;
      }
      setIsText(false);

      // Check if hovering over headers
      const headerElem = target.closest("h1, h2, h3, h4, h5, h6");
      if (headerElem) {
        setIsHovering(false);
        return;
      }

      // Check if hovering over any interactive UI elements
      const interactive = target.closest(
        'button, a, [role="button"], [role="tab"], [role="switch"], select, label, summary, [tabindex="0"], .cursor-pointer, input[type="checkbox"], input[type="radio"], input[type="range"], input[type="button"], input[type="submit"], .chat-prompt-card, .chat-conv-item, .glass-panel'
      );

      setIsHovering(Boolean(interactive));
    };

    const onMouseOver = (e: MouseEvent) => {
      checkTarget(e.target as HTMLElement | null);
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('textarea, input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), [contenteditable="true"]')) {
        setIsText(false);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
      setIsClicking(false);
      setIsText(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth animation loop using lerp for the follower ring
    const animate = () => {
      // High-precision tracking (0.65 for fluid yet locked tracking)
      const ease = 0.65;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  return (
    <>
      {/* Precision center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`custom-cursor-dot ${!isVisible ? "is-hidden" : ""} ${isText ? "is-text" : ""
          } ${isHovering ? "is-hovering" : ""}`}
      />

      {/* Smooth trailing ring that expands and fits around UI elements */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`custom-cursor-ring ${!isVisible ? "is-hidden" : ""} ${isHovering ? "is-hovering" : ""
          } ${isText ? "is-text" : ""} ${isClicking ? "is-clicking" : ""}`}
      />
    </>
  );
}
