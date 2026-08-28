import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { AuthProvider, UserSession } from "../types/auth";
import {
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseConfigured,
} from "./firebase";

export function createGuestSession(existingId?: string): UserSession {
  const guestId =
    existingId ||
    `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: guestId,
    name: "訪客 (Guest)",
    email: `${guestId}@voicekanban.app`,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
    provider: "guest",
    isAuthenticated: true,
    isAnonymous: true,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

export const GUEST_USER: UserSession = {
  id: "guest-user",
  name: "訪客",
  email: "guest@voicekanban.app",
  avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
  provider: "guest",
  isAuthenticated: false,
  isAnonymous: true,
  isGuest: true,
  createdAt: new Date().toISOString(),
};


/**
 * Format Firebase Auth Error codes into friendly Traditional Chinese messages
 */
export function formatAuthErrorMessage(error: any): string {
  if (!error) return "發生未知錯誤，請稍後再試";
  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/invalid-email":
      return "電子郵件格式不正確，請重新確認。";
    case "auth/user-disabled":
      return "此帳號已被停用，請聯絡系統管理員。";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "帳號或密碼錯誤，若尚未註冊請切換至註冊頁面。";
    case "auth/email-already-in-use":
      return "此電子郵件已被註冊，請直接進行登入。";
    case "auth/weak-password":
      return "密碼強度不足，請設定至少 6 個字元的密碼。";
    case "auth/popup-closed-by-user":
      return "已取消 Google 登入授權視窗。";
    case "auth/popup-blocked":
      return "登入彈出視窗被瀏覽器阻擋，請允許彈出視窗後重試。";
    case "auth/network-request-failed":
      return "網路連線失敗，請檢查您的網路設定。";
    case "auth/too-many-requests":
      return "登入嘗試次數過多，已被暫時鎖定，請稍後再試。";
    case "auth/operation-not-allowed":
      return "該登入方式尚未在 Firebase Console 啟用。";
    default:
      return msg || "認證失敗，請檢查輸入或稍後再試。";
  }
}

/**
 * Convert Firebase User object to VoiceKanban UserSession
 */
export function mapFirebaseUserToSession(
  user: FirebaseUser,
  providerOverride?: AuthProvider
): UserSession {
  const providerId = user.providerData[0]?.providerId;
  let provider: AuthProvider = providerOverride || "email";
  if (providerId?.includes("google")) {
    provider = "google";
  } else if (providerId?.includes("apple")) {
    provider = "apple";
  }

  return {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "會員用戶",
    email: user.email || "",
    avatarUrl:
      user.photoURL ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
    provider,
    isAuthenticated: true,
    isAnonymous: user.isAnonymous,
    emailVerified: user.emailVerified,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
}

/**
 * Google OAuth Login
 */
export async function loginWithGoogle(): Promise<UserSession> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();
    if (!auth || !provider) {
      throw new Error("Firebase 認證模組尚未就緒");
    }
    const result = await signInWithPopup(auth, provider);
    return mapFirebaseUserToSession(result.user, "google");
  }

  // Graceful Mock Fallback (when Firebase keys are not set)
  await new Promise((res) => setTimeout(res, 600));
  return {
    id: `mock-google-${Date.now()}`,
    name: "Google 創作者",
    email: "creator@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser",
    provider: "google",
    isAuthenticated: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Email & Password Login
 */
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<UserSession> {
  if (!email || !email.includes("@")) {
    throw new Error("請輸入有效的 Email 電子郵件地址");
  }
  if (!pass || pass.length < 6) {
    throw new Error("密碼長度需至少 6 個字元");
  }

  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase 認證模組尚未就緒");
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return mapFirebaseUserToSession(result.user, "email");
  }

  // Graceful Mock Fallback
  await new Promise((res) => setTimeout(res, 600));
  return {
    id: `mock-email-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
    name: email.split("@")[0],
    email,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
    provider: "email",
    isAuthenticated: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Email & Password Registration
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<UserSession> {
  if (!email || !email.includes("@")) {
    throw new Error("請輸入有效的 Email 電子郵件地址");
  }
  if (!pass || pass.length < 6) {
    throw new Error("密碼長度需至少 6 個字元");
  }

  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase 認證模組尚未就緒");
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName?.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    return mapFirebaseUserToSession(result.user, "email");
  }

  // Graceful Mock Fallback
  await new Promise((res) => setTimeout(res, 600));
  return {
    id: `mock-email-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
    name: displayName?.trim() || email.split("@")[0],
    email,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
    provider: "email",
    isAuthenticated: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
  }
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuthState(
  callback: (session: UserSession | null) => void
): () => void {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const auth = getFirebaseAuth();
  if (!auth) return () => {};

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(mapFirebaseUserToSession(user));
    } else {
      callback(null);
    }
  });
}

/**
 * Unified provider login method (for backwards compatibility)
 */
export async function loginWithProvider(
  provider: AuthProvider,
  email?: string,
  password?: string,
  displayName?: string,
  isRegister?: boolean
): Promise<UserSession> {
  if (provider === "guest") {
    return GUEST_USER;
  }

  if (provider === "google") {
    return await loginWithGoogle();
  }

  if (provider === "email") {
    if (isRegister) {
      return await registerWithEmail(email || "", password || "password123", displayName);
    }
    return await loginWithEmail(email || "", password || "password123");
  }

  if (provider === "apple") {
    // Apple fallback / simulated login
    await new Promise((res) => setTimeout(res, 600));
    return {
      id: `apple-${Date.now()}`,
      name: "Apple 專家",
      email: email || "user@icloud.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AppleUser",
      provider: "apple",
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
    };
  }

  return GUEST_USER;
}
