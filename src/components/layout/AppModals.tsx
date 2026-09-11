"use client";

import React from "react";
import { SearchModal } from "@/features/search";
import { VoiceCaptureOverlay } from "@/features/voice";
import { SettingsModal } from "@/features/settings";
import {
  AddTaskModal,
  EditTaskModal,
  BoardManagerModal,
  DeleteBoardConfirmModal,
} from "@/features/kanban";
import { AuthModal, BindAccountModal } from "@/features/auth";
import { ShareBoardModal, JoinBoardModal } from "@/features/collaboration";
import { ShareSaveSheet } from "@/features/bookmarks";

export const AppModals: React.FC = () => {
  return (
    <>
      <SearchModal />
      <VoiceCaptureOverlay />
      <SettingsModal />
      <AddTaskModal />
      <EditTaskModal />
      <AuthModal />
      <BindAccountModal />
      <BoardManagerModal />
      <DeleteBoardConfirmModal />
      <ShareBoardModal />
      <JoinBoardModal />
      <ShareSaveSheet />
    </>
  );
};
