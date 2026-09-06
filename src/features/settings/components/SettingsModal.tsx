"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useSettingsModal } from "./modal/useSettingsModal";
import { SettingsModalHeader } from "./modal/SettingsModalHeader";
import { SettingsTabNav } from "./modal/SettingsTabNav";
import { SettingsByokTab } from "./modal/SettingsByokTab";
import { SettingsOfflineTab } from "./modal/SettingsOfflineTab";
import { SettingsLearningTab } from "./modal/SettingsLearningTab";

export const SettingsModal: React.FC = () => {
  const {
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
    learningStats,
    resetSuccess,
    boards,
    handleTestAndSave,
    handleResetLearning,
  } = useSettingsModal();

  useEscapeKey(() => {
    if (isSettingsModalOpen) {
      setIsSettingsModalOpen(false);
    }
  }, isSettingsModalOpen);

  if (!isSettingsModalOpen) return null;

  return (
    <div
      onClick={() => setIsSettingsModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        <SettingsModalHeader onClose={() => setIsSettingsModalOpen(false)} />
        <SettingsTabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-0.5">
          {activeTab === "api" && (
            <SettingsByokTab
              inputKey={inputKey}
              setInputKey={setInputKey}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              defaultBoard={defaultBoard}
              setDefaultBoard={setDefaultBoard}
              boards={boards}
              testStatus={testStatus}
              isTesting={isTesting}
              handleTestAndSave={handleTestAndSave}
              onClose={() => setIsSettingsModalOpen(false)}
            />
          )}

          {activeTab === "offline" && (
            <SettingsOfflineTab onClose={() => setIsSettingsModalOpen(false)} />
          )}

          {activeTab === "learning" && (
            <SettingsLearningTab
              learningStats={learningStats}
              resetSuccess={resetSuccess}
              handleResetLearning={handleResetLearning}
              onClose={() => setIsSettingsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
