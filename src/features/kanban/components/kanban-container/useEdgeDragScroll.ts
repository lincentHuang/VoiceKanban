import { useState, useRef, useEffect, useCallback } from "react";

export function useEdgeDragScroll(
  isDragging: boolean, isMobile: boolean,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>, onOpenInbox: () => void
) {
  const [edgeHoverSide, setEdgeHoverSide] = useState<"left" | "right" | null>(null);
  const edgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollMagnetToColumn = useCallback((direction: "next" | "prev") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const elements = Array.from(container.querySelectorAll<HTMLElement>("[data-column-id], [data-add-column-card]"));
    if (!elements.length) return;

    const width = container.clientWidth;
    const center = container.scrollLeft + width / 2;

    const target = direction === "next"
      ? elements.find((el) => el.offsetLeft + el.offsetWidth / 2 > center + 30)
      : [...elements].reverse().find((el) => el.offsetLeft + el.offsetWidth / 2 < center - 30);

    if (target) {
      container.scrollTo({ left: Math.max(0, target.offsetLeft - (width - target.offsetWidth) / 2), behavior: "smooth" });
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(25); } catch {}
      }
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    if (!isDragging) {
      if (edgeTimerRef.current) { clearTimeout(edgeTimerRef.current); edgeTimerRef.current = null; }
      setEdgeHoverSide(null);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (e.clientY < rect.top - 50 || e.clientY > rect.bottom + 50) {
        if (edgeTimerRef.current) { clearTimeout(edgeTimerRef.current); edgeTimerRef.current = null; }
        setEdgeHoverSide(null);
        return;
      }
      const edgeWidth = Math.min(65, rect.width * 0.18);
      const isRight = e.clientX >= rect.right - edgeWidth && e.clientX <= rect.right + 30;
      const isLeft = e.clientX <= rect.left + edgeWidth && e.clientX >= rect.left - 30;

      if (isRight) {
        setEdgeHoverSide("right");
        if (!edgeTimerRef.current) edgeTimerRef.current = setTimeout(() => { scrollMagnetToColumn("next"); edgeTimerRef.current = null; }, 450);
      } else if (isLeft) {
        setEdgeHoverSide("left");
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            if (isMobile && container.scrollLeft <= 15) {
              onOpenInbox();
              if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
                try { navigator.vibrate(25); } catch {}
              }
            } else { scrollMagnetToColumn("prev"); }
            edgeTimerRef.current = null;
          }, 450);
        }
      } else {
        if (edgeTimerRef.current) { clearTimeout(edgeTimerRef.current); edgeTimerRef.current = null; }
        setEdgeHoverSide(null);
      }
    };

    const handlePointerUp = () => {
      if (edgeTimerRef.current) { clearTimeout(edgeTimerRef.current); edgeTimerRef.current = null; }
      setEdgeHoverSide(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      if (edgeTimerRef.current) { clearTimeout(edgeTimerRef.current); edgeTimerRef.current = null; }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, isMobile, scrollContainerRef, scrollMagnetToColumn, onOpenInbox]);

  return { edgeHoverSide, scrollMagnetToColumn };
}
