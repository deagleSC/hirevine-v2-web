"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import type { ApplicationOrgListRow } from "@/types/applications.types";
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

export const recruiterApplicationsOrgColumns: ColumnDef<ApplicationOrgListRow>[] =
  [
    {
      id: "jobTitle",
      accessorKey: "jobTitle",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          className="-ml-2 h-8 gap-1 px-2 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Job
          <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.jobTitle}
        </span>
      ),
    },
    {
      id: "candidateEmail",
      accessorKey: "candidateEmail",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          className="-ml-2 h-8 gap-1 px-2 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Candidate
          <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.candidateEmail}
        </span>
      ),
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
        <ApplicationStatusBadge status={row.original.status} />
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
        <span className="text-muted-foreground tabular-nums text-sm">
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
          href={`/recruiter/applications/${row.original.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open
        </Link>
      ),
    },
  ];
