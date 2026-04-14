import { AxiosError } from "axios";

export const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as
        | { error?: { message?: string }; message?: string }
        | undefined;
      const message = data?.error?.message ?? data?.message;
      return message || "An error occurred";
    }
    if (error.request) {
      return "Network error. Please check your connection.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};
