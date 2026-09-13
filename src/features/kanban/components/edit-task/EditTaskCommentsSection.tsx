import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { TaskActivity } from "@/core/types/task";
import { fieldButtonClass, inputClass } from "@/components/ui/input";

interface EditTaskCommentsSectionProps {
  activities?: TaskActivity[];
  userName: string;
  currentColumnTitle?: string;
  onAddComment: (commentText: string) => void;
}

export const EditTaskCommentsSection: React.FC<EditTaskCommentsSectionProps> = ({
  activities,
  userName,
  currentColumnTitle,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">留言與活動紀錄</h4>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="撰寫評論或進度筆記..."
          className={inputClass("md")}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className={fieldButtonClass("md", "bg-orange-500 text-white shadow-xs hover:bg-orange-600")}
        >
          送出
        </button>
      </form>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
        {activities && activities.length > 0 ? (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">{act.user}</span>
                <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{act.text}</p>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400 italic p-2">
            {userName} 已將這張卡片加入「{currentColumnTitle || "待辦"}」
          </div>
        )}
      </div>
    </div>
  );
};
