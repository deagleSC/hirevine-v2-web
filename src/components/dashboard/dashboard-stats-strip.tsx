import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DashboardStatItem = {
  value: number;
  label: string;
  hint: string;
};

type DashboardStatsStripProps = {
  items: DashboardStatItem[];
  className?: string;
};

function gridColsClass(count: number) {
  if (count <= 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-3";
  return "sm:grid-cols-4";
}

/**
 * Summary metrics in one band: primary figure, then label + supporting line.
 * Dividers only between columns on larger screens; avoids stacked mini-cards.
 */
export function DashboardStatsStrip({
  items,
  className,
}: DashboardStatsStripProps) {
  if (items.length === 0) return null;

  return (
    <ul
      aria-label="Summary statistics"
      className={cn(
        "m-0 grid list-none gap-8 rounded-xl bg-muted/35 p-0 px-5 py-6 shadow-sm sm:gap-0 sm:divide-x sm:divide-border/45",
        gridColsClass(items.length),
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="min-w-0 sm:px-5 sm:first:pl-2 sm:last:pr-2"
        >
          <p className="text-foreground text-3xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
            {item.value.toLocaleString()}
          </p>
          <p className="text-foreground/90 mt-2 text-sm font-medium leading-snug">
            {item.label}
          </p>
          <p className="text-muted-foreground mt-1 max-w-[16rem] text-xs leading-relaxed sm:max-w-none">
            {item.hint}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function DashboardStatsStripSkeleton({
  columns = 3,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-8 rounded-xl bg-muted/35 px-5 py-6 sm:gap-0 sm:divide-x sm:divide-border/45",
        gridColsClass(columns),
        className,
      )}
    >
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="space-y-2 sm:px-5 sm:first:pl-2 sm:last:pr-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-44 rounded-md" />
        </div>
      ))}
    </div>
  );
}
