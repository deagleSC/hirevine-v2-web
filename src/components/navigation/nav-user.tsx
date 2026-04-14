"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ClientOnly } from "@/components/shared/client-only";
import { dashboardHomeHref } from "@/components/navigation/nav-items";
import { authActions, useAuthStore } from "@/store";

export function NavUser() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useAuthStore();
  const homeHref = dashboardHomeHref(user);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.email;
  const avatarFallback = user.email[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    try {
      await authActions.logout();
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Could not sign out");
    }
  };

  const userButton = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-card data-[state=open]:text-card-foreground"
    >
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src="" alt={displayName} />
        <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{displayName}</span>
        <span className="text-muted-foreground truncate text-xs capitalize">
          {user.role}
        </span>
      </div>
      <ChevronsUpDown className="ml-auto size-4" />
    </SidebarMenuButton>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ClientOnly fallback={userButton}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{userButton}</DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-card"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="rounded-lg">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="text-muted-foreground truncate text-xs capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={homeHref} onClick={handleNavClick}>
                    <User />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void handleLogout()}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
