import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  LogIn,
  ScrollText,
  Search,
} from "lucide-react";

import type { User } from "@/types/auth.types";

export type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: { title: string; url: string }[];
};

/**
 * Single navigation model for the app shell: guests, candidates, and recruiters/admins
 * share the same structure; items are filtered by auth role.
 */
export function getMainNavItems(user: User | null): NavMainItem[] {
  if (!user) {
    return [
      { title: "Home", url: "/", icon: Home },
      { title: "Sign in", url: "/login", icon: LogIn },
    ];
  }

  if (user.role === "candidate") {
    return [
      { title: "Home", url: "/candidate", icon: LayoutDashboard },
      {
        title: "Browse jobs",
        url: "/jobs",
        icon: Search,
      },
      {
        title: "My applications",
        url: "/candidate/applications",
        icon: ScrollText,
      },
    ];
  }

  return [
    { title: "Home", url: "/recruiter", icon: LayoutDashboard },
    { title: "Job posts", url: "/recruiter/jobs", icon: FolderKanban },
    { title: "Applications", url: "/recruiter/applications", icon: Inbox },
  ];
}

/** Sidebar brand link + NavUser “dashboard” shortcut. */
export function dashboardHomeHref(user: User | null): string {
  if (!user) return "/";
  if (user.role === "candidate") return "/candidate";
  return "/recruiter";
}
