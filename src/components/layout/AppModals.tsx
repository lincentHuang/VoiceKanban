"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

/**
 * Every modal here renders `null` until the user opens it, so none of this code is needed for the
 * first paint. Loading them eagerly used to put all twelve — plus the Markdown editor,
 * collaboration and bookmark code they pull in — into the initial bundle.
 *
 * Two things make the split actually pay off:
 *  - the imports point at concrete files rather than the feature barrels, since a barrel would
 *    drag the whole feature (cards, columns, services) into the lazy chunk;
 *  - each modal is mounted only while it is open. A `dynamic()` component fetches its chunk as
 *    soon as it mounts, so rendering all twelve unconditionally would download everything
 *    moments after hydration and merely move the cost instead of removing it.
 */
const lazyModal = <T extends React.ComponentType>(loader: () => Promise<T>) =>
  dynamic(() => loader().then((mod) => ({ default: mod })), { ssr: false });

const SearchModal = lazyModal(() =>
  import("@/features/search/components/SearchModal").then((m) => m.SearchModal)
);
const VoiceCaptureOverlay = lazyModal(() =>
  import("@/features/voice/components/VoiceCaptureOverlay").then((m) => m.VoiceCaptureOverlay)
);
const SettingsModal = lazyModal(() =>
  import("@/features/settings/components/SettingsModal").then((m) => m.SettingsModal)
);
const AddTaskModal = lazyModal(() =>
  import("@/features/kanban/components/AddTaskModal").then((m) => m.AddTaskModal)
);
const EditTaskModal = lazyModal(() =>
  import("@/features/kanban/components/EditTaskModal").then((m) => m.EditTaskModal)
);
const AuthModal = lazyModal(() =>
  import("@/features/auth/components/AuthModal").then((m) => m.AuthModal)
);
const BindAccountModal = lazyModal(() =>
  import("@/features/auth/components/BindAccountModal").then((m) => m.BindAccountModal)
);
const BoardManagerModal = lazyModal(() =>
  import("@/features/kanban/components/BoardManagerModal").then((m) => m.BoardManagerModal)
);
const DeleteBoardConfirmModal = lazyModal(() =>
  import("@/features/kanban/components/DeleteBoardConfirmModal").then((m) => m.DeleteBoardConfirmModal)
);
const ShareBoardModal = lazyModal(() =>
  import("@/features/collaboration/components/ShareBoardModal").then((m) => m.ShareBoardModal)
);
const JoinBoardModal = lazyModal(() =>
  import("@/features/collaboration/components/JoinBoardModal").then((m) => m.JoinBoardModal)
);
const ShareSaveSheet = lazyModal(() =>
  import("@/features/bookmarks/components/ShareSaveSheet").then((m) => m.ShareSaveSheet)
);

export const AppModals: React.FC = () => {
  const isSearchModalOpen = useKanbanStore((s) => s.isSearchModalOpen);
  const isVoiceOverlayOpen = useKanbanStore((s) => s.isVoiceOverlayOpen);
  const isSettingsModalOpen = useKanbanStore((s) => s.isSettingsModalOpen);
  const isAddTaskModalOpen = useKanbanStore((s) => s.isAddTaskModalOpen);
  const editingTaskId = useKanbanStore((s) => s.editingTaskId);
  const isAuthModalOpen = useKanbanStore((s) => s.isAuthModalOpen);
  const isBindModalOpen = useKanbanStore((s) => s.isBindModalOpen);
  const isBoardManagerOpen = useKanbanStore((s) => s.isBoardManagerOpen);
  const deletingBoardId = useKanbanStore((s) => s.deletingBoardId);
  const isShareBoardModalOpen = useKanbanStore((s) => s.isShareBoardModalOpen);
  const isJoinBoardModalOpen = useKanbanStore((s) => s.isJoinBoardModalOpen);
  const pendingShare = useKanbanStore((s) => s.pendingShare);

  return (
    <>
      {isSearchModalOpen && <SearchModal />}
      {isVoiceOverlayOpen && <VoiceCaptureOverlay />}
      {isSettingsModalOpen && <SettingsModal />}
      {isAddTaskModalOpen && <AddTaskModal />}
      {editingTaskId && <EditTaskModal />}
      {isAuthModalOpen && <AuthModal />}
      {isBindModalOpen && <BindAccountModal />}
      {isBoardManagerOpen && <BoardManagerModal />}
      {deletingBoardId && <DeleteBoardConfirmModal />}
      {isShareBoardModalOpen && <ShareBoardModal />}
      {isJoinBoardModalOpen && <JoinBoardModal />}
      {pendingShare && <ShareSaveSheet />}
    </>
  );
};
