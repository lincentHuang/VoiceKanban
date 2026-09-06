import React, { useRef, useLayoutEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { renderMarkdownBlocks } from "./utils/markdownBlocks";

interface MarkdownPreviewProps {
  value: string;
  maxPreviewHeight?: number;
  onStartEdit: () => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  value,
  maxPreviewHeight = 500,
  onStartEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const previewContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (previewContentRef.current) {
      const height = previewContentRef.current.scrollHeight;
      setIsOverflowing(height > maxPreviewHeight);
    }
  }, [value, maxPreviewHeight]);

  return (
    <div className="relative">
      <div
        ref={previewContentRef}
        className={`transition-all duration-300 ${
          isOverflowing && !isExpanded ? "max-h-[500px] overflow-hidden relative" : ""
        }`}
      >
        {renderMarkdownBlocks(value, onStartEdit)}
        {isOverflowing && !isExpanded && (
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent" />
        )}
      </div>

      {isOverflowing && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 px-3 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-101 active:scale-99 border border-slate-200/60 dark:border-slate-700/60"
          >
            {isExpanded ? (
              <>
                <span>收合說明內容</span>
                <ChevronUp className="w-3.5 h-3.5 text-orange-500" />
              </>
            ) : (
              <>
                <span>展開完整說明內容</span>
                <ChevronDown className="w-3.5 h-3.5 text-orange-500" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
