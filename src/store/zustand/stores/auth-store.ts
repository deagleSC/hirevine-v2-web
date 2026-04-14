import { create } from "zustand";
import type { User } from "@/types/auth.types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStoreActions {
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type AuthStore = AuthState & AuthStoreActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
