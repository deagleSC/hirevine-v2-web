import { API_ROUTES } from "@/lib/configs/api";
import { api } from "@/lib/utils/api-client";
import { handleError } from "@/lib/utils/handleError";
import type {
  LoginInput,
  RegisterApiPayload,
} from "@/lib/validations/auth.schema";
import type { User } from "@/types/auth.types";

function unwrapUser(payload: unknown): User {
  if (
    payload &&
    typeof payload === "object" &&
    "user" in payload &&
    (payload as { user: User }).user
  ) {
    return (payload as { user: User }).user;
  }
  throw new Error("Invalid auth response");
}

export const authServices = {
  register: async (data: RegisterApiPayload): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, data);
      return unwrapUser(response.data.data);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  login: async (data: LoginInput): Promise<User> => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
      return unwrapUser(response.data.data);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME);
      return unwrapUser(response.data.data);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
};
