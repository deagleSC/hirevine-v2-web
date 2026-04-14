export type UserRole = "recruiter" | "candidate" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  createdAt?: string;
}
