import { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AuthProvider } from "@/core/types/auth";
import { formatAuthErrorMessage } from "@/core/services/authService";

export function useAuthForm() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useKanbanStore();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleProviderLogin = async (
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

      await login(
        provider,
        email || emailInput.trim(),
        password || passwordInput.trim(),
        displayName || nameInput.trim(),
        authMode === "register"
      );

      setSuccessMsg(
        authMode === "register"
          ? "🎉 註冊成功！已自動整併本地資料並啟用雲端同步！"
          : "✨ 登入成功！正在即時同步您的跨裝置看板..."
      );

      setTimeout(() => {
        setIsAuthModalOpen(false);
        setLoadingProvider(null);
        setSuccessMsg(null);
        setPasswordInput("");
      }, 700);
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  return {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
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
    handleProviderLogin,
  };
}
