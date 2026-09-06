import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/core/utils/uploadUtils";

export function useMarkdownEditor(
  value: string,
  onChange: (val: string) => void,
  onSave?: (val: string) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [isCompressing, setIsCompressing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraftValue(value); }, [value]);

  useEffect(() => {
    if (isEditing) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [isEditing]);

  const handleSaveEdit = () => {
    onChange(draftValue);
    if (onSave) onSave(draftValue);
    setIsEditing(false);
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const newText = draftValue ? `${draftValue}\n${before}${after}` : `${before}${after}`;
      setDraftValue(newText);
      onChange(newText);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = textarea.value;
    const sel = prev.substring(start, end);
    const newText = prev.substring(0, start) + `${before}${sel}${after}` + prev.substring(end);
    setDraftValue(newText);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      const target = start + before.length + (sel ? sel.length : 0);
      textarea.setSelectionRange(target, target);
    }, 0);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const res = await uploadFile(file, file.name, "editor");
        insertText(`\n![${file.name.replace(/[\[\]]/g, "")}](${res.url})\n`);
      } catch (err) { console.error("Image upload error:", err); }
      finally { setIsCompressing(false); e.target.value = ""; }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes("image")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            setIsCompressing(true);
            const res = await uploadFile(file, `screenshot-${Date.now()}.png`, "editor");
            insertText(`\n![貼上的截圖](${res.url})\n`);
          } catch (err) { console.error("Paste image error:", err); }
          finally { setIsCompressing(false); }
          break;
        }
      }
    }
  };

  return {
    isEditing, setIsEditing, draftValue, setDraftValue, isCompressing, textareaRef,
    handleSaveEdit, insertText, handleImageFileChange, handlePaste,
  };
}
