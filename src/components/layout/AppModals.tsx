"use client";

import React from "react";
import { SearchModal } from "@/features/search";
import { VoiceCaptureOverlay } from "@/features/voice";
import { SettingsModal } from "@/features/settings";
import {
  AddTaskModal,
  EditTaskModal,
  ColumnManagerModal,
  EditBoardModal,
  DeleteBoardConfirmModal,
} from "@/features/kanban";
import { AuthModal, BindAccountModal } from "@/features/auth";
import { ShareBoardModal, JoinBoardModal } from "@/features/collaboration";

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
      <ColumnManagerModal />
      <EditBoardModal />
      <DeleteBoardConfirmModal />
      <ShareBoardModal />
      <JoinBoardModal />
    </>
  );
};
