"use client";

import * as React from "react";

import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import { SidebarBranding } from "@/components/navigation/sidebar-branding";
import { getMainNavItems } from "@/components/navigation/nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const navigation = getMainNavItems(user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
