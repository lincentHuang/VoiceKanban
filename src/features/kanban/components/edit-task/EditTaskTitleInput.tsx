import React, { useRef, useEffect } from "react";

interface EditTaskTitleInputProps {
  title: string;
  isDirty: boolean;
  onChange: (title: string) => void;
  onSave: () => void;
  onRevert: () => void;
}

export const EditTaskTitleInput: React.FC<EditTaskTitleInputProps> = ({
  title,
  isDirty,
  onChange,
  onSave,
  onRevert,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTitleHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTitleHeight();
  }, [title]);

  return (
    <div className="w-full pt-1">
      <textarea
        ref={textareaRef}
        rows={1}
        value={title}
        onChange={(e) => {
          onChange(e.target.value);
          adjustTitleHeight();
        }}
        onKeyDown={(e) => {
          // Let the IME own Enter/Escape while composing — otherwise confirming a
          // 注音/中文 candidate commits the text and blur() commits it a second time.
          if (e.nativeEvent.isComposing || e.key === "Process") return;
          // Enter commits the title (Shift+Enter still inserts a line break);
          // Escape reverts to the stored title without closing the drawer.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSave();
            textareaRef.current?.blur();
          } else if (e.key === "Escape" && isDirty) {
            e.preventDefault();
            e.stopPropagation();
            onRevert();
          }
        }}
        onBlur={onSave}
        className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-orange-500 focus:outline-none py-1 transition-colors resize-none overflow-hidden leading-snug text-slate-800 dark:text-slate-100 block"
        placeholder="任務標題..."
      />
    </div>
  );
};
