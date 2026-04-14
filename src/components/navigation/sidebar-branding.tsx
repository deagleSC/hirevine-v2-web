"use client";

import Link from "next/link";
import { HirevineMark } from "@/components/brand/hirevine-mark";
import { dashboardHomeHref } from "@/components/navigation/nav-items";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store";

export function SidebarBranding() {
  const { user } = useAuthStore();
  const href = dashboardHomeHref(user);

  const subtitle = !user
    ? "Job search"
    : user.role === "candidate"
      ? "Candidate"
      : "Recruiter";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={href}>
            <div className="flex items-center gap-2">
              <HirevineMark size={32} className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Hirevine</span>
                <span className="text-muted-foreground truncate text-xs">
                  {subtitle}
                </span>
              </div>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
