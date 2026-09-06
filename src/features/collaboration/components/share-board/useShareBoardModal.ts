import { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { CollaboratorRole, BoardMember } from "@/core/types/task";

export function useShareBoardModal() {
  const {
    isShareBoardModalOpen,
    setIsShareBoardModalOpen,
    boards,
    activeBoardId,
    userSession,
    enableActiveBoardSharing,
    updateMemberRole,
    removeMemberFromBoard,
    getCurrentUserRole,
  } = useKanbanStore();

  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const myRole = getCurrentUserRole(activeBoardId);
  const isOwner = myRole === "owner";

  useEffect(() => {
    if (!isShareBoardModalOpen || !activeBoard) return;

    if (activeBoard.inviteCode) {
      setInviteCode(activeBoard.inviteCode);
    } else {
      setIsLoading(true);
      setErrorMsg("");
      enableActiveBoardSharing()
        .then((code) => {
          setInviteCode(code);
        })
        .catch((err) => {
          console.error("Failed to enable sharing:", err);
          setErrorMsg("無法產生邀請代碼，請檢查連線後重試。");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isShareBoardModalOpen, activeBoard?.id, activeBoard?.inviteCode, enableActiveBoardSharing]);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?invite=${inviteCode}`
      : `/?invite=${inviteCode}`;

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRoleChange = async (memberUid: string, newRole: CollaboratorRole) => {
    if (!isOwner) return;
    try {
      await updateMemberRole(memberUid, newRole);
    } catch (e) {
      console.error("Failed to update role:", e);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberFromBoard(memberToRemove.uid);
      setMemberToRemove(null);
    } catch (e) {
      console.error("Failed to remove member:", e);
    }
  };

  return {
    isShareBoardModalOpen,
    setIsShareBoardModalOpen,
    activeBoard,
    userSession,
    isOwner,
    isLoading,
    inviteCode,
    inviteUrl,
    copiedCode,
    copiedLink,
    errorMsg,
    memberToRemove,
    setMemberToRemove,
    handleCopyCode,
    handleCopyLink,
    handleRoleChange,
    handleConfirmRemove,
  };
}
