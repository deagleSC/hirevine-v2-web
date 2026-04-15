"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMyApplications } from "@/lib/services/applications-service";
import { candidateApplicationsColumns } from "@/components/applications/candidate-applications-columns";
import { DataTable } from "@/components/ui/data-table";
import type { ApplicationListItem } from "@/types/applications.types";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const initialSort = [{ id: "applied", desc: true as const }];

export default function CandidateApplicationsPage() {
  const [rows, setRows] = useState<ApplicationListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listMyApplications();
        if (!cancelled) setRows(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Could not load your applications
        </h1>
        <p className="text-destructive text-sm">{error}</p>
        <p className="text-muted-foreground text-sm">
          Make sure you are still signed in, then refresh. If the problem
          continues, the API may be unavailable.
        </p>
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          My applications
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Sort columns with the headers. Each row is one job you applied to;
          open <span className="text-foreground font-medium">View</span> or the
          role title for status, next steps, and the quiz when it is available.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="You have not applied to a role yet"
          description="Use a job link shared by the employer to open a posting, upload your resume, and apply. Your progress will show up here."
        >
          <Link
            href="/candidate"
            className={cn(
              buttonVariants({ variant: "default" }),
              "no-underline",
            )}
          >
            Back to dashboard
          </Link>
        </EmptyState>
      ) : (
        <DataTable
          columns={candidateApplicationsColumns}
          data={rows}
          initialSorting={initialSort}
          emptyMessage="No applications to show."
        />
      )}
    </div>
  );
}
