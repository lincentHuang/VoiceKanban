import React, { useLayoutEffect, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { EdgeMeter } from "./useEdgeHoldMeter";

// 放在 relative 的容器裡。邊緣有一條貼齊整個高度的計量條：手指和拖曳中的卡片常會蓋住中間的提示，
// 但整條長條總有一段露在外面，看得到還要等多久才換頁。
export const EdgeHoldMeterOverlay: React.FC<{ meter: EdgeMeter | null }> = ({ meter }) => {
  const edgeFillRef = useRef<HTMLDivElement>(null);
  const pillFillRef = useRef<HTMLDivElement>(null);

  // 每一輪 meter 都是新物件，所以換頁後重新計量時動畫也會從零開始
  useLayoutEffect(() => {
    if (!meter) return;
    const timing: KeyframeAnimationOptions = { duration: meter.duration, easing: "linear", fill: "forwards" };
    const animations = [
      edgeFillRef.current?.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], timing),
      pillFillRef.current?.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], timing),
    ];
    const elapsed = Math.min(meter.duration, Math.max(0, performance.now() - meter.startedAt));
    animations.forEach((a) => { if (a) a.currentTime = elapsed; });
    return () => animations.forEach((a) => a?.cancel());
  }, [meter]);

  if (!meter) return null;
  const isRight = meter.side === "right";

  return (
    <div
      className={`absolute top-0 bottom-0 w-16 pointer-events-none z-40 from-orange-500/30 via-orange-500/10 to-transparent ${
        isRight ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
      }`}
    >
      <div className={`absolute top-3 bottom-3 w-1.5 rounded-full bg-white/25 overflow-hidden ${isRight ? "right-1" : "left-1"}`}>
        <div ref={edgeFillRef} className="h-full w-full rounded-full bg-orange-500 origin-bottom" style={{ transform: "scaleY(0)" }} />
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 px-2 py-1.5 rounded-xl bg-orange-600/90 text-white text-[11px] font-bold shadow-lg ${
          isRight ? "right-4" : "left-4"
        }`}
      >
        <div className="flex items-center gap-0.5 whitespace-nowrap">
          {!isRight && <ChevronLeft className="w-3.5 h-3.5 shrink-0" />}
          <span className="max-w-[8rem] truncate">{meter.label}</span>
          {isRight && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
        </div>
        <div className="h-1 w-full rounded-full bg-white/30 overflow-hidden">
          <div
            ref={pillFillRef}
            className={`h-full w-full bg-white ${isRight ? "origin-left" : "origin-right"}`}
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
};
