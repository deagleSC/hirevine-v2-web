import type { UserRole } from "@/types/auth.types";

/** Default post-login landing route per role. */
export function homePathForRole(role: UserRole): string {
  if (role === "candidate") return "/candidate";
  return "/recruiter";
}

/** Account profile settings route (role-scoped shell). */
export function profilePathForRole(role: UserRole): string {
  if (role === "candidate") return "/candidate/profile";
  return "/recruiter/profile";
}
