import React from "react";
import { Clock } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
  isRangeMode: boolean;
  activeRangeField: "start" | "end";
  currentHours: number;
  currentMins: number;
  onTimeChange: (type: "start" | "end", h: number, m: number) => void;
}

export const DateTimePickerTimeSection: React.FC<Props> = ({
  isRangeMode, activeRangeField, currentHours, currentMins, onTimeChange,
}) => {
  const targetType = activeRangeField === "start" && isRangeMode ? "start" : "end";

  return (
    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-orange-500" />
          <span>{isRangeMode ? (activeRangeField === "start" ? "開始時間" : "結束時間") : "具體時間"}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <div className="w-20">
            <Select value={String(currentHours)} onValueChange={(val) => onTimeChange(targetType, Number(val), currentMins)}>
              <SelectTrigger className="h-7 text-xs font-bold px-2 py-0"><SelectValue placeholder="時" /></SelectTrigger>
              <SelectContent className="max-h-48">
                {Array.from({ length: 24 }).map((_, h) => (
                  <SelectItem key={h} value={String(h)}>{h.toString().padStart(2, "0")} 點</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs font-bold text-slate-400">:</span>

          <div className="w-20">
            <Select value={String(Math.floor(currentMins / 5) * 5)} onValueChange={(val) => onTimeChange(targetType, currentHours, Number(val))}>
              <SelectTrigger className="h-7 text-xs font-bold px-2 py-0"><SelectValue placeholder="分" /></SelectTrigger>
              <SelectContent className="max-h-48">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i * 5} value={String(i * 5)}>{(i * 5).toString().padStart(2, "0")} 分</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
