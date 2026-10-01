import { useRef, useEffect } from "react";
import type { Column } from "@/core/types/task";
import { useEdgeHoldMeter, type EdgeSide } from "@/components/layout/dnd/useEdgeHoldMeter";

// 拖曳卡片停在看板左右邊緣：計量表填滿就換到上一欄／下一欄，手機上第一欄再往左是收件匣。
export function useEdgeDragScroll(
  isDragging: boolean, isMobile: boolean,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>, onOpenInbox: () => void,
  columns: Column[]
) {
  // 平滑捲動要一點時間，計量表變快之後可能在上一次還沒捲完就要換下一欄；
  // 這時要從「正要捲到的位置」往下算，不然會算出同一欄、原地不動。
  const plannedLeftRef = useRef<number | null>(null);

  useEffect(() => {
    plannedLeftRef.current = null;
  }, [isDragging]);

  const findDestination = (side: EdgeSide) => {
    const container = scrollContainerRef.current;
    if (!container) return null;
    const from = plannedLeftRef.current ?? container.scrollLeft;

    if (side === "left" && isMobile && from <= 15) return { kind: "inbox" as const };

    const elements = Array.from(container.querySelectorAll<HTMLElement>("[data-column-id]"));
    const width = container.clientWidth;
    const center = from + width / 2;
    const target = side === "right"
      ? elements.find((el) => el.offsetLeft + el.offsetWidth / 2 > center + 30)
      : [...elements].reverse().find((el) => el.offsetLeft + el.offsetWidth / 2 < center - 30);
    if (!target) return null;

    const maxLeft = container.scrollWidth - width;
    const left = Math.min(maxLeft, Math.max(0, target.offsetLeft - (width - target.offsetWidth) / 2));
    // 已經捲到底（桌機上最後幾欄同時看得到）就不算還有下一頁
    if (Math.abs(left - from) < 2) return null;
    return { kind: "column" as const, left, columnId: target.dataset.columnId };
  };

  const meter = useEdgeHoldMeter({
    enabled: isDragging,
    getZoneRect: () => scrollContainerRef.current?.getBoundingClientRect() ?? null,
    getTargetLabel: (side) => {
      const dest = findDestination(side);
      if (!dest) return null;
      if (dest.kind === "inbox") return "收件匣";
      return columns.find((c) => c.id === dest.columnId)?.title || (side === "right" ? "下一欄" : "上一欄");
    },
    onTrigger: (side) => {
      const dest = findDestination(side);
      if (!dest) return;
      if (dest.kind === "inbox") {
        onOpenInbox();
        return;
      }
      plannedLeftRef.current = dest.left;
      scrollContainerRef.current?.scrollTo({ left: dest.left, behavior: "smooth" });
    },
  });

  return { meter };
}
