import { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useSidebarInboxGestures() {
  const {
    activeDragTaskId,
    setIsInboxSidebarOpen,
    setViewMode,
  } = useKanbanStore();

  const [isMobile, setIsMobile] = useState(false);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingTask = activeDragTaskId !== null;
  const edgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Drag near right edge -> magnet switch to Kanban on mobile
  useEffect(() => {
    if (!isDraggingTask || !isMobile) {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const isNearRightEdge = e.clientX >= window.innerWidth - 50;
      if (isNearRightEdge) {
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            setIsInboxSidebarOpen(false);
            setViewMode("kanban");
            if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
              try {
                navigator.vibrate(25);
              } catch {}
            }
            edgeTimerRef.current = null;
          }, 450);
        }
      } else {
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = null;
        }
      }
    };

    const handlePointerUp = () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDraggingTask, isMobile, setIsInboxSidebarOpen, setViewMode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isDraggingTask) return;
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || isDraggingTask) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartPosRef.current.x;
    const deltaY = endY - touchStartPosRef.current.y;

    if (deltaX < -65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      setIsInboxSidebarOpen(false);
      setViewMode("kanban");
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
    }
  };

  return {
    isMobile,
    handleTouchStart,
    handleTouchEnd,
  };
}
