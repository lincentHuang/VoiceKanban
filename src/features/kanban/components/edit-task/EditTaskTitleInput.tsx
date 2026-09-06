import React, { useRef, useEffect } from "react";

interface EditTaskTitleInputProps {
  title: string;
  onChange: (title: string) => void;
  onBlur: () => void;
}

export const EditTaskTitleInput: React.FC<EditTaskTitleInputProps> = ({
  title,
  onChange,
  onBlur,
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
        onBlur={onBlur}
        className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-orange-500 focus:outline-none py-1 transition-colors resize-none overflow-hidden leading-snug text-slate-800 dark:text-slate-100 block"
        placeholder="任務標題..."
      />
    </div>
  );
};
