import React from "react";
import { Loader2 } from "lucide-react";

export const VoiceProcessingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        語音辨識與分析中...
      </h3>
      <p className="text-xs text-slate-500 max-w-xs">
        正在提取任務標題、到期時間與目標欄位...
      </p>
    </div>
  );
};
