"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import { APPLICATION_STATUS_HELP } from "@/lib/applications/candidate-copy";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import type { ApplicationListItem } from "@/types/applications.types";
import { cn } from "@/lib/utils";

function formatWhen(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export const candidateApplicationsColumns: ColumnDef<ApplicationListItem>[] = [
  {
    id: "role",
    accessorFn: (row) => row.job?.title ?? "",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[min(100vw-6rem,20rem)] py-0.5">
        <Link
          href={`/candidate/applications/${row.original.id}`}
          className="text-primary rounded-md px-1 py-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
        >
          {row.original.job?.title ?? "Untitled role"}
        </Link>
      </div>
    ),
    meta: { cellClassName: "whitespace-normal align-top" },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-xs space-y-1.5 py-0.5">
        <ApplicationStatusBadge status={row.original.status} />
        <p className="text-muted-foreground text-xs leading-snug">
          {APPLICATION_STATUS_HELP[row.original.status]}
        </p>
      </div>
    ),
    meta: { cellClassName: "whitespace-normal align-top" },
  },
  {
    id: "applied",
    accessorFn: (row) => row.createdAt ?? row.updatedAt ?? "",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Applied
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-foreground tabular-nums">
        {formatWhen(row.original.createdAt ?? row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: "updated",
    accessorFn: (row) => row.updatedAt ?? "",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last update
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatWhen(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <Link
        href={`/candidate/applications/${row.original.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        View
      </Link>
    ),
  },
];
