import { AuthProvider, UserSession } from "../types/auth";

export const GUEST_USER: UserSession = {
  id: "guest-user",
  name: "訪客使用者 (Guest)",
  email: "guest@voicekanban.app",
  avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
  provider: "guest",
  isAuthenticated: true,
  createdAt: new Date().toISOString(),
};

export async function loginWithProvider(provider: AuthProvider, email?: string): Promise<UserSession> {
  // Simulate network latency for authentic 5-state experience
  await new Promise((res) => setTimeout(res, 600));

  if (provider === "guest") {
    return GUEST_USER;
  }

  if (provider === "google") {
    return {
      id: `google-${Date.now()}`,
      name: "Google 創作者",
      email: email || "creator@gmail.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser",
      provider: "google",
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
    };
  }

  if (provider === "apple") {
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

  return {
    id: `email-${Date.now()}`,
    name: email?.split("@")[0] || "會員用戶",
    email: email || "user@voicekanban.app",
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${email || "User"}`,
    provider: "email",
    isAuthenticated: true,
    createdAt: new Date().toISOString(),
  };
}
