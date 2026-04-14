"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import type { RecruiterJob } from "@/types/jobs.types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
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

export const recruiterJobsColumns: ColumnDef<RecruiterJob>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[min(100vw-6rem,22rem)] py-0.5">
        <Link
          href={`/recruiter/jobs/${row.original.id}`}
          className="text-primary font-medium transition-colors hover:bg-primary/10 rounded-md px-1 py-0.5 hover:text-primary"
        >
          {row.original.title}
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
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <div className="flex flex-wrap items-center gap-2 py-0.5">
          {status === "active" && <Badge variant="secondary">Active</Badge>}
          <span className="text-muted-foreground text-sm">
            {jobPostingStatusLabel(status)}
          </span>
        </div>
      );
    },
    meta: { cellClassName: "whitespace-normal align-top" },
  },
  {
    id: "pipeline",
    accessorFn: (row) => (row.pipeline ? "yes" : "no"),
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pipeline
        <ArrowUpDown className="text-muted-foreground size-4" aria-hidden />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.pipeline ? "Configured" : "Not set"}
      </span>
    ),
  },
  {
    id: "updatedAt",
    accessorFn: (row) => row.updatedAt ?? "",
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last updated
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
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/recruiter/jobs/${row.original.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "no-underline",
          )}
        >
          Edit
        </Link>
        <Link
          href={`/recruiter/jobs/${row.original.id}/applications`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "no-underline",
          )}
        >
          Applications
        </Link>
      </div>
    ),
  },
];
