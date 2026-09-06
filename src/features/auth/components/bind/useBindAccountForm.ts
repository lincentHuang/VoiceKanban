import { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AuthProvider } from "@/core/types/auth";
import { formatAuthErrorMessage } from "@/core/services/authService";

export function useBindAccountForm() {
  const { isBindModalOpen, setIsBindModalOpen, bindGuestAccount } = useKanbanStore();

  const [bindMode, setBindMode] = useState<"register" | "login">("register");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBind = async (
    provider: AuthProvider,
    email?: string,
    password?: string,
    displayName?: string
  ) => {
    setLoadingProvider(provider);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (provider === "email") {
        if (!emailInput.trim()) {
          throw new Error("請輸入有效的 Email 電子郵件地址");
        }
        if (!passwordInput.trim() || passwordInput.length < 6) {
          throw new Error("密碼需至少 6 個字元");
        }
      }

      await bindGuestAccount(
        provider,
        email || emailInput.trim(),
        password || passwordInput.trim(),
        displayName || nameInput.trim(),
        bindMode === "register"
      );

      setSuccessMsg("🎉 帳號綁定成功！已自動整併訪客資料並啟用雲端同步！");

      setTimeout(() => {
        setIsBindModalOpen(false);
        setLoadingProvider(null);
        setSuccessMsg(null);
      }, 900);
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  return {
    isBindModalOpen,
    setIsBindModalOpen,
    bindMode,
    setBindMode,
    emailInput,
    setEmailInput,
    passwordInput,
    setPasswordInput,
    nameInput,
    setNameInput,
    showPassword,
    setShowPassword,
    loadingProvider,
    errorMsg,
    setErrorMsg,
    successMsg,
    handleBind,
  };
}
