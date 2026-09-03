"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface UseBoardDragScrollOptions {
  disabled?: boolean;
}

export function useBoardDragScroll(options: UseBoardDragScrollOptions = {}) {
  const { disabled = false } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Stop any active inertia/momentum animation
  const stopMomentum = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      // Only trigger on primary (left) mouse button without modifier keys
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do NOT pan if user clicked an interactive or drag-handled element
      if (
        target.closest(
          'button, input, textarea, select, a, [role="button"], [data-no-drag-scroll], [data-task-card], [data-column-header]'
        )
      ) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      stopMomentum();

      isMouseDownRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.pageX;
      startScrollLeftRef.current = container.scrollLeft;
      lastXRef.current = e.pageX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
    },
    [disabled, stopMomentum]
  );

  useEffect(() => {
    if (disabled) {
      isMouseDownRef.current = false;
      setIsPanning(false);
      stopMomentum();
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const currentX = e.pageX;
      const deltaX = currentX - startXRef.current;

      // Threshold of 3px to avoid interfering with normal static clicks
      if (!hasMovedRef.current && Math.abs(deltaX) > 3) {
        hasMovedRef.current = true;
        setIsPanning(true);
      }

      if (hasMovedRef.current) {
        // Direct responsive panning
        container.scrollLeft = startScrollLeftRef.current - deltaX;

        // Calculate velocity for smooth momentum on release
        const now = performance.now();
        const dt = now - lastTimeRef.current;
        if (dt > 10) {
          velocityRef.current = (currentX - lastXRef.current) / dt;
          lastXRef.current = currentX;
          lastTimeRef.current = now;
        }
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      setIsPanning(false);

      const container = containerRef.current;
      if (!container || !hasMovedRef.current) {
        hasMovedRef.current = false;
        return;
      }

      // Smooth inertia glide on release if user swiped with velocity
      let v = velocityRef.current;
      if (Math.abs(v) > 0.15) {
        const friction = 0.92;
        const step = () => {
          if (!containerRef.current) return;
          v *= friction;
          if (Math.abs(v) > 0.04) {
            containerRef.current.scrollLeft -= v * 16;
            animationFrameRef.current = requestAnimationFrame(step);
          } else {
            animationFrameRef.current = null;
          }
        };
        animationFrameRef.current = requestAnimationFrame(step);
      }

      // Reset hasMoved after microtask so click capture handler can prevent unintended click
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
    };

    const handleClickCapture = (e: MouseEvent) => {
      if (hasMovedRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClickCapture, { capture: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClickCapture, { capture: true });
      stopMomentum();
    };
  }, [disabled, stopMomentum]);

  return {
    containerRef,
    isPanning,
    handleMouseDown,
  };
}
