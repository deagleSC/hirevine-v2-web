import { useAuthStore } from "@/store/zustand/stores/auth-store";

const SESSION_STORAGE_PREFIX = "hirevine_";

/**
 * Resets auth state and removes Hirevine-owned `sessionStorage` keys.
 * Call when the API returns 401 for an authenticated request.
 */
export function clearClientSession(): void {
  useAuthStore.getState().clearAuth();
  if (typeof sessionStorage === "undefined") return;
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(SESSION_STORAGE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
