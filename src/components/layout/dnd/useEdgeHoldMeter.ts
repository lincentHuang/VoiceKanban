import { useState, useEffect, useEffectEvent } from "react";

export type EdgeSide = "left" | "right";

export interface EdgeMeter {
  side: EdgeSide;
  /** 計量表滿了之後會去哪裡，例如下一欄的名稱、「收件匣」 */
  label: string;
  /** 這一輪計量表要填多久（毫秒） */
  duration: number;
  /** 每開始新的一輪就 +1，讓畫面重新播放填滿動畫 */
  cycle: number;
  /** 這一輪開始計時的時間（performance.now()）；畫面重畫慢時，動畫從這裡對齊，不會比實際換頁慢半拍 */
  startedAt: number;
}

// 第一次停在邊緣要等比較久，避免手指只是路過就換頁；之後每連續換一次就縮短，
// 但不會短於 MIN，否則平滑捲動還沒停下來就又換下一頁，眼睛跟不上。
const BASE_DURATION = 650;
const SPEED_UP = 0.75;
const MIN_DURATION = 300;

export const meterDuration = (streak: number) =>
  Math.max(MIN_DURATION, Math.round(BASE_DURATION * SPEED_UP ** streak));

const getPoint = (e: PointerEvent | TouchEvent) => {
  if ("touches" in e) {
    const t = e.touches[0];
    return t ? { x: t.clientX, y: t.clientY } : null;
  }
  return { x: e.clientX, y: e.clientY };
};

// 隨時記著指標最後的位置（不只拖曳中），因為計量表啟用的那一刻常常收不到新的移動事件：
// 拖曳是被「移動」啟動的，計量表的監聽在那之後才掛上，手指可能一甩就到了邊緣停住；
// 收件匣收起、換看板的計量表接手時，手指也可能停著不動。
let lastPointer: { x: number; y: number } | null = null;
let trackerCount = 0;
const TRACKED_EVENTS = ["pointerdown", "pointermove", "touchstart", "touchmove"] as const;
const trackPointer = (e: Event) => {
  const p = getPoint(e as PointerEvent | TouchEvent);
  if (p) lastPointer = p;
};

function useTrackLastPointer() {
  useEffect(() => {
    if (trackerCount++ === 0) {
      TRACKED_EVENTS.forEach((t) => window.addEventListener(t, trackPointer, { passive: true, capture: true }));
    }
    return () => {
      if (--trackerCount === 0) {
        TRACKED_EVENTS.forEach((t) => window.removeEventListener(t, trackPointer, { capture: true }));
      }
    };
  }, []);
}

interface Options {
  enabled: boolean;
  /** 要偵測左右邊緣的區域（通常是可捲動的看板或收件匣面板） */
  getZoneRect: () => DOMRect | null;
  /** 這一側現在可以去哪裡；回傳 null 代表這側沒有東西（例如已經在最後一欄），不顯示計量表 */
  getTargetLabel: (side: EdgeSide) => string | null;
  onTrigger: (side: EdgeSide) => void;
}

export function useEdgeHoldMeter({ enabled, getZoneRect, getTargetLabel, onTrigger }: Options) {
  const [meter, setMeter] = useState<EdgeMeter | null>(null);
  useTrackLastPointer();

  // effect 只依賴 enabled：這些回呼每次重畫都是新的，若放進依賴會在計量表填滿前把計時器清掉。
  const readZone = useEffectEvent(() => getZoneRect());
  const readLabel = useEffectEvent((side: EdgeSide) => getTargetLabel(side));
  const trigger = useEffectEvent((side: EdgeSide) => onTrigger(side));

  useEffect(() => {
    if (!enabled) {
      setMeter(null);
      return;
    }

    let activeSide: EdgeSide | null = null;
    let streak = 0;
    let cycle = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer) { clearTimeout(timer); timer = null; }
    };

    const startCycle = (side: EdgeSide) => {
      clearTimer();
      const label = readLabel(side);
      if (!label) {
        setMeter(null);
        return;
      }
      const duration = meterDuration(streak);
      cycle += 1;
      setMeter({ side, label, duration, cycle, startedAt: performance.now() });
      timer = setTimeout(() => {
        timer = null;
        trigger(side);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate(25); } catch {}
        }
        streak += 1;
        // 換完頁手指還停在邊緣：計量表重新計一輪，而且比上一輪快
        if (activeSide === side) startCycle(side);
      }, duration);
    };

    const sideAt = (x: number, y: number): EdgeSide | null => {
      const rect = readZone();
      if (!rect) return null;
      if (y < rect.top - 50 || y > rect.bottom + 50) return null;
      const edgeWidth = Math.min(65, rect.width * 0.18);
      if (x >= rect.right - edgeWidth && x <= rect.right + 30) return "right";
      if (x <= rect.left + edgeWidth && x >= rect.left - 30) return "left";
      return null;
    };

    const evaluate = (x: number, y: number) => {
      const side = sideAt(x, y);
      if (side === activeSide) return;
      // 離開邊緣或換到另一邊：計量表歸零，速度也回到最慢
      activeSide = side;
      streak = 0;
      clearTimer();
      if (side) startCycle(side);
      else setMeter(null);
    };

    // 手機上拖曳由 TouchSensor 處理，瀏覽器可能中途送出 pointercancel 後就不再送 pointermove，
    // touchmove 則會一路送到放開為止，所以兩種都聽。
    const handleMove = (e: PointerEvent | TouchEvent) => {
      const p = getPoint(e);
      if (p) evaluate(p.x, p.y);
    };

    const handleEnd = () => {
      activeSide = null;
      streak = 0;
      clearTimer();
      setMeter(null);
    };

    if (lastPointer) evaluate(lastPointer.x, lastPointer.y);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);
    return () => {
      clearTimer();
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [enabled]);

  return meter;
}
