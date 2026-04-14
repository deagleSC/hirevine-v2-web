import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

/** Centered empty / zero-results panel for lists and tables. */
export function EmptyState({
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-muted/30 flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-foreground font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
