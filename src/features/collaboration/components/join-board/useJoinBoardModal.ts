"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";

export function useJoinBoardModal() {
  const {
    isJoinBoardModalOpen,
    setIsJoinBoardModalOpen,
    joinBoardInitialCode,
    setJoinBoardInitialCode,
    joinBoardByInviteCode,
    userSession,
  } = useKanbanStore();

  useEscapeKey(() => setIsJoinBoardModalOpen(false));

  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isGuest = userSession.isGuest || userSession.provider === "guest";

  useEffect(() => {
    if (isJoinBoardModalOpen) {
      if (joinBoardInitialCode) {
        setCode(joinBoardInitialCode.toUpperCase());
      }
      if (isGuest && userSession.name && userSession.name !== "訪客") {
        setNickname(userSession.name);
      }
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isJoinBoardModalOpen, joinBoardInitialCode, isGuest, userSession.name]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (val && !val.startsWith("VK-") && !val.startsWith("V")) {
      val = "VK-" + val;
    }
    setCode(val);
    setErrorMsg("");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("請輸入邀請代碼");
      return;
    }

    if (isGuest && !nickname.trim()) {
      setErrorMsg("請輸入您在協作看板上的暱稱");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await joinBoardByInviteCode(cleanCode, isGuest ? nickname.trim() : undefined);
      if (result.success) {
        setSuccessMsg(result.message || "成功加入協作看板！");
        setTimeout(() => {
          setIsJoinBoardModalOpen(false);
          setJoinBoardInitialCode("");
        }, 1200);
      } else {
        setErrorMsg(result.message || "查無此邀請代碼，請確認後重試。");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "加入看板失敗，請檢查網路連線。");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen: isJoinBoardModalOpen,
    closeModal: () => setIsJoinBoardModalOpen(false),
    code,
    nickname,
    setNickname,
    isLoading,
    errorMsg,
    successMsg,
    isGuest,
    userSession,
    handleCodeChange,
    handleJoin,
  };
}
