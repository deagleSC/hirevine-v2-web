import axios from "axios";
import { clearClientSession } from "@/lib/auth/clear-client-session";
import { API_BASE_URL } from "@/lib/configs/api";

/**
 * JSON API client. Hirevine API uses an httpOnly session cookie; always send credentials.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

function isCredentialAttempt401(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/api/auth/login") || url.includes("/api/auth/register");
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const url = error.config?.url;
    if (!isCredentialAttempt401(url)) {
      clearClientSession();
    }
    return Promise.reject(error);
  },
);
