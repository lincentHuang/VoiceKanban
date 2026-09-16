import { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useSettingsModal() {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    byokConfig,
    updateBYOKConfig,
    boards,
  } = useKanbanStore();

  const [activeTab, setActiveTab] = useState<"api" | "offline">("api");
  const [inputKey, setInputKey] = useState(byokConfig.apiKey || "");
  const [selectedModel, setSelectedModel] = useState(byokConfig.model || "gemini-3.6-flash");
  const [defaultBoard, setDefaultBoard] = useState(byokConfig.defaultBoardId || "board-work");
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus(null);

    if (!inputKey.trim()) {
      updateBYOKConfig({
        apiKey: "",
        isCustomKeyActive: false,
        model: selectedModel,
        defaultBoardId: defaultBoard,
      });
      setTestStatus({ type: "success", msg: "已清除自備 Key，系統將以本機離線解析模式運作。" });
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch("/api/user/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputKey.trim(), model: selectedModel }),
      });
      const data = await res.json();
      if (data.success) {
        updateBYOKConfig({
          apiKey: inputKey.trim(),
          isCustomKeyActive: true,
          model: selectedModel,
          defaultBoardId: defaultBoard,
          isEncrypted: true,
          lastTestedAt: new Date().toISOString(),
        });
        setTestStatus({ type: "success", msg: "🎉 Gemini API Key 驗證成功！已啟用 AES-256 加密代理。" });
      } else {
        setTestStatus({ type: "error", msg: data.error || "驗證失敗，請檢查 Key 是否正確。" });
      }
    } catch (err: any) {
      setTestStatus({ type: "error", msg: err.message || "連線測試失敗" });
    } finally {
      setIsTesting(false);
    }
  };

  return {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    activeTab,
    setActiveTab,
    inputKey,
    setInputKey,
    selectedModel,
    setSelectedModel,
    defaultBoard,
    setDefaultBoard,
    showPassword,
    setShowPassword,
    isTesting,
    testStatus,
    boards,
    handleTestAndSave,
  };
}
