"use client";

import React from "react";

interface AddTaskModalFooterProps {
  onClose: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export const AddTaskModalFooter: React.FC<AddTaskModalFooterProps> = ({
  onClose,
  isSubmitting,
  disabled,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
      >
        取消
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={`px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isSubmitting ? "建立中..." : "建立卡片"}
      </button>
    </div>
  );
};
