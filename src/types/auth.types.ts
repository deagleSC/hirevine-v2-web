export type UserRole = "recruiter" | "candidate" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  /** Shown in the UI when set; empty means use email only. */
  displayName: string;
  createdAt?: string;
}
