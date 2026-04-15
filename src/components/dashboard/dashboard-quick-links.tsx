import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardQuickLinkItem = {
  href: string;
  title: string;
  /** Short line; keep under ~60 chars for layout. */
  hint?: string;
  icon: LucideIcon;
};

function gridClassForCount(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-4";
}

/**
 * Compact, fully clickable tiles. On large screens all links sit on one row
 * when there are 2–4 items (grid expands to match count).
 */
export function DashboardQuickLinks({
  items,
  className,
}: {
  items: readonly DashboardQuickLinkItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Quick links" className={cn(className)}>
      <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
        Quick links
      </p>
      <ul className={cn("grid gap-5", gridClassForCount(items.length))}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "group bg-muted/35 hover:bg-muted/55 focus-visible:ring-ring flex min-h-14 flex-row items-center gap-2 rounded-lg px-3 py-2.5 shadow-sm transition-colors",
                  "focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon
                      className="text-muted-foreground size-4 shrink-0"
                      aria-hidden
                    />
                    <span className="truncate text-sm font-medium">
                      {item.title}
                    </span>
                  </span>
                  {item.hint ? (
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] leading-snug sm:text-xs">
                      {item.hint}
                    </span>
                  ) : null}
                </div>
                <ChevronRight
                  className="text-muted-foreground size-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
