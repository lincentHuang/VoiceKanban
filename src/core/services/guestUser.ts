import { UserSession } from "../types/auth";

/**
 * The signed-out identity. Lives outside authService so the store can use it as its initial
 * state without pulling the Firebase SDK into the first-paint bundle.
 */
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
