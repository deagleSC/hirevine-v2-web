"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getRecruiterJob,
  listJobApplications,
} from "@/lib/services/jobs-service";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApplicationRun } from "@/types/applications.types";
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

export default function RecruiterJobApplicationsPage() {
  const params = useParams();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const [title, setTitle] = useState<string>("");
  const [rows, setRows] = useState<ApplicationRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    (async () => {
      try {
        const [job, applications] = await Promise.all([
          getRecruiterJob(jobId),
          listJobApplications(jobId),
        ]);
        if (!cancelled) {
          setTitle(job.title);
          setRows(applications);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load");
          setRows(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{error}</p>
        <Link
          href="/recruiter/jobs"
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          Back to job posts
        </Link>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/recruiter/jobs/${jobId}`}
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← Edit job
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Applications · {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {rows.length} submission{rows.length === 1 ? "" : "s"} for this
          posting.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No applications for this job yet"
          description="Share the public listing or keep the post active so candidates can apply. Submissions will show up here with status and scores."
        >
          <Link
            href={`/jobs/${jobId}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "no-underline",
            )}
          >
            Open public job page
          </Link>
        </EmptyState>
      ) : (
        <div className="bg-card overflow-hidden rounded-lg shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-muted/40">Status</TableHead>
                <TableHead className="bg-muted/40">Fit score</TableHead>
                <TableHead className="bg-muted/40">Applied</TableHead>
                <TableHead className="bg-muted/40 w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <ApplicationStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums text-sm">
                    {r.currentFitScore != null ? r.currentFitScore : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatWhen(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/recruiter/applications/${r.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "no-underline",
                      )}
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
