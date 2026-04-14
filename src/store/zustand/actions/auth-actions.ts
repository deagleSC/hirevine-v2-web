import { useAuthStore } from "../stores/auth-store";
import { authServices } from "../services/auth-services";
import type {
  LoginInput,
  RegisterApiPayload,
} from "@/lib/validations/auth.schema";
import type { User } from "@/types/auth.types";

export const authActions = {
  register: async (data: RegisterApiPayload): Promise<User> => {
    const { setLoading, setError, setUser } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    try {
      const user = await authServices.register(data);
      setUser(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  },

  login: async (data: LoginInput): Promise<User> => {
    const { setLoading, setError, setUser } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    try {
      const user = await authServices.login(data);
      setUser(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  },

  logout: async (): Promise<void> => {
    const { clearAuth } = useAuthStore.getState();
    try {
      await authServices.logout();
    } finally {
      clearAuth();
    }
  },

  /** Refresh session user (e.g. after creating an organization). */
  refreshUser: async (): Promise<User> => {
    const { setUser, clearAuth } = useAuthStore.getState();
    try {
      const user = await authServices.getMe();
      setUser(user);
      return user;
    } catch (error) {
      clearAuth();
      const message =
        error instanceof Error ? error.message : "Session expired";
      throw new Error(message);
    }
  },
};
