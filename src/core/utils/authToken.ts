import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "../services/firebase";

/** Upper bound on waiting for Firebase to restore a session before treating the user as a guest. */
const AUTH_READY_TIMEOUT_MS = 3000;

/**
 * Returns a Firebase ID token for API routes that bill real money (R2 storage), or null for
 * guests and anonymous accounts — those callers fall back to local storage instead.
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return null;

    // Firebase restores a persisted session asynchronously, so currentUser can still be null
    // right after page load. Waiting for the first auth state emission keeps an already
    // signed-in user from being misread as a guest.
    const user =
      auth.currentUser ??
      (await new Promise<User | null>((resolve) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, AUTH_READY_TIMEOUT_MS);
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          clearTimeout(timeout);
          unsubscribe();
          resolve(u);
        });
      }));

    if (!user || user.isAnonymous) return null;
    return await user.getIdToken();
  } catch (error) {
    console.warn("Could not obtain Firebase ID token:", error);
    return null;
  }
}

/** Authorization header for an authenticated request, or null when the user is a guest. */
export async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}
