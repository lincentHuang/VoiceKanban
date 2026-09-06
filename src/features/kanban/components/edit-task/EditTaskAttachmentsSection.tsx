import React, { useRef, useState } from "react";
import { Paperclip, Plus, Loader2, FileText, Image as ImageIcon, Download, Trash2 } from "lucide-react";
import { TaskAttachment } from "@/core/types/task";
import { uploadFile } from "@/core/utils/uploadUtils";

interface Props {
  taskId: string;
  attachments?: TaskAttachment[];
  onAddAttachment: (taskId: string, attachment: TaskAttachment) => void;
  onRemoveAttachment: (taskId: string, attachmentId: string) => void;
  onInsertToDescription: (att: TaskAttachment) => void;
}

export const EditTaskAttachmentsSection: React.FC<Props> = ({
  taskId, attachments, onAddAttachment, onRemoveAttachment, onInsertToDescription,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("檔案大小超過 25MB 限制！");
      setTimeout(() => setError(null), 3500);
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      const res = await uploadFile(file, file.name, "attachments");
      onAddAttachment(taskId, {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: res.name, size: res.size, type: res.type, url: res.url, createdAt: new Date().toISOString(),
      });
    } catch {
      setError("檔案上傳失敗，請稍後重試");
      setTimeout(() => setError(null), 3500);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const formatSize = (b: number) => (!b ? "0 B" : b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">附件檔案 <span className="text-xs font-normal text-slate-400">(最大 25MB)</span></h4>
        </div>
        <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-50">
          {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /><span>上傳中...</span></> : <><Plus className="w-3.5 h-3.5 text-orange-500" /><span>上傳附件</span></>}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
      </div>

      {error && (
        <div className="mb-2 p-2 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span><button type="button" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {attachments && attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => {
            const isImg = att.type.startsWith("image/") || att.url.startsWith("data:image");
            return (
              <div key={att.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-300">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isImg ? <img src={att.url} alt={att.name} className="w-9 h-9 rounded-lg object-cover border shrink-0 bg-white" /> : <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>}
                  <div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{att.name}</p><p className="text-[10px] text-slate-400 font-mono">{formatSize(att.size)}</p></div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {isImg && <button type="button" onClick={() => onInsertToDescription(att)} className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500" title="插入到說明"><ImageIcon className="w-3.5 h-3.5" /></button>}
                  <a href={att.url} download={att.name} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500" title="下載"><Download className="w-3.5 h-3.5" /></a>
                  <button type="button" onClick={() => onRemoveAttachment(taskId, att.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600" title="刪除"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div onClick={() => fileInputRef.current?.click()} className="p-3 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-slate-400 text-xs cursor-pointer hover:border-orange-400">
          尚無附件檔案，點擊此處上傳圖片或資料（最大 25MB）
        </div>
      )}
    </div>
  );
};
