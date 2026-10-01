import { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEdgeHoldMeter } from "@/components/layout/dnd/useEdgeHoldMeter";

export function useSidebarInboxGestures(panelRef: React.RefObject<HTMLElement | null>) {
  const activeDragTaskId = useKanbanStore((s) => s.activeDragTaskId);
  const isInboxSidebarOpen = useKanbanStore((s) => s.isInboxSidebarOpen);
  const setIsInboxSidebarOpen = useKanbanStore((s) => s.setIsInboxSidebarOpen);
  const setViewMode = useKanbanStore((s) => s.setViewMode);

  const [isMobile, setIsMobile] = useState(false);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingTask = activeDragTaskId !== null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 手機上收件匣蓋住看板：拖曳中停在右邊緣，計量表填滿就收起收件匣回到看板。
  // 收件匣收起之後不能再啟用：之後換成看板自己的計量表接手往下一欄。
  const edgeMeter = useEdgeHoldMeter({
    enabled: isDraggingTask && isMobile && isInboxSidebarOpen,
    getZoneRect: () => panelRef.current?.getBoundingClientRect() ?? null,
    getTargetLabel: (side) => (side === "right" ? "看板" : null),
    onTrigger: () => {
      setIsInboxSidebarOpen(false);
      setViewMode("kanban");
    },
  });

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
    edgeMeter,
    handleTouchStart,
    handleTouchEnd,
  };
}
