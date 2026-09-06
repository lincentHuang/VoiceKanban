import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  isDragging: boolean;
  edgeHoverSide: "left" | "right" | null;
}

export const KanbanEdgeOverlays: React.FC<Props> = ({ isDragging, edgeHoverSide }) => {
  if (!isDragging || !edgeHoverSide) return null;

  return (
    <>
      {edgeHoverSide === "right" && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-orange-500/30 via-orange-500/10 to-transparent pointer-events-none flex items-center justify-end pr-2.5 z-40 animate-pulse">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
            <span>下一個</span>
            <ChevronRight className="w-3.5 h-3.5 animate-ping" />
          </div>
        </div>
      )}

      {edgeHoverSide === "left" && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-transparent pointer-events-none flex items-center justify-start pl-2.5 z-40 animate-pulse">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
            <ChevronLeft className="w-3.5 h-3.5 animate-ping" />
            <span>上一個</span>
          </div>
        </div>
      )}
    </>
  );
};
