"use client";

import { useMemo } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ClientOnly } from "@/components/shared/client-only";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: { title: string; url: string }[];
};

function collectNavUrls(items: NavItem[]): string[] {
  const urls: string[] = [];
  for (const item of items) {
    urls.push(item.url);
    if (item.items) {
      for (const sub of item.items) urls.push(sub.url);
    }
  }
  return urls;
}

/** Longest nav href that matches the path (exact or segment prefix), so `/candidate` does not win over `/candidate/applications`. */
function longestMatchingNavUrl(
  pathname: string,
  urls: string[],
): string | null {
  const matches = urls.filter(
    (u) => pathname === u || pathname.startsWith(`${u}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.length >= b.length ? a : b));
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const activeNavUrl = useMemo(() => {
    if (!pathname) return null;
    return longestMatchingNavUrl(pathname, collectNavUrls(items));
  }, [pathname, items]);

  // Handler to close mobile sidebar when navigation item is clicked
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isCollapsibleSectionActive =
            item.items &&
            item.items.length > 0 &&
            activeNavUrl != null &&
            (activeNavUrl === item.url ||
              item.items.some(
                (s) =>
                  activeNavUrl === s.url ||
                  activeNavUrl.startsWith(`${s.url}/`),
              ));

          // If item has sub-items, render as collapsible
          if (item.items && item.items.length > 0) {
            const menuButton = (
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            );

            return (
              <ClientOnly
                key={item.title}
                fallback={
                  <SidebarMenuItem>
                    {menuButton}
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubItemActive = activeNavUrl === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive}
                            >
                              <Link href={subItem.url} onClick={handleNavClick}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                }
              >
                <Collapsible
                  asChild
                  defaultOpen={!!isCollapsibleSectionActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      {menuButton}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isSubItemActive = activeNavUrl === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubItemActive}
                              >
                                <Link
                                  href={subItem.url}
                                  onClick={handleNavClick}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </ClientOnly>
            );
          }

          // If item has no sub-items, render as direct link
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={activeNavUrl === item.url}
              >
                <Link href={item.url} onClick={handleNavClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
