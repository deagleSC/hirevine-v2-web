"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { listOrgApplications } from "@/lib/services/applications-service";
import { listOrgJobOptions } from "@/lib/services/jobs-service";
import { recruiterApplicationsOrgColumns } from "@/components/applications/recruiter-applications-org-columns";
import { DataTable } from "@/components/ui/data-table";
import { useAuthStore } from "@/store";
import type { ApplicationOrgListRow } from "@/types/applications.types";
import type { OrgJobOption } from "@/types/jobs.types";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Radix Select disallows empty string values; map to real filters in URL. */
const SELECT_VALUE_ALL = "__all__";

const STATUS_OPTIONS = [
  { value: SELECT_VALUE_ALL, label: "All statuses" },
  { value: "NODE_1_PENDING", label: "Resume review" },
  { value: "NODE_2_PENDING", label: "Quiz due" },
  { value: "NODE_3_PENDING", label: "Final summary" },
  { value: "COMPLETED", label: "Complete" },
  { value: "REJECTED", label: "Not selected" },
] as const;

function RecruiterApplicationsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const jobIdFilter = searchParams.get("jobId") ?? "";
  const statusFilter = searchParams.get("status") ?? "";

  const [jobs, setJobs] = useState<OrgJobOption[]>([]);
  const [data, setData] = useState<{
    applications: ApplicationOrgListRow[];
    total: number;
    totalPages: number;
    limit: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.organizationId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listOrgJobOptions();
        if (!cancelled) setJobs(list);
      } catch {
        if (!cancelled) setJobs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.organizationId]);

  const fetchList = useCallback(async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listOrgApplications({
        page,
        limit: 20,
        ...(jobIdFilter ? { jobId: jobIdFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setData({
        applications: res.applications,
        total: res.total,
        totalPages: res.totalPages,
        limit: res.limit,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, page, jobIdFilter, statusFilter]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const setQuery = (next: {
    page?: number;
    jobId?: string;
    status?: string;
  }) => {
    const p = new URLSearchParams();
    const pg = next.page ?? page;
    const j = next.jobId !== undefined ? next.jobId : jobIdFilter;
    const s = next.status !== undefined ? next.status : statusFilter;
    if (pg > 1) p.set("page", String(pg));
    if (j) p.set("jobId", j);
    if (s) p.set("status", s);
    const q = p.toString();
    router.push(q ? `/recruiter/applications?${q}` : "/recruiter/applications");
  };

  const columns = useMemo(() => recruiterApplicationsOrgColumns, []);
  const hasFilters = Boolean(jobIdFilter || statusFilter);

  if (!user?.organizationId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Create an organization to load applications for your jobs.
        </p>
        <Link
          href="/recruiter/organization"
          className={cn(
            buttonVariants({ variant: "default" }),
            "no-underline w-fit",
          )}
        >
          Organization setup
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          All candidates who applied to jobs in your organization. Filter by job
          or status; open a row for pipeline scores and notes.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-job">Job</Label>
          <Select
            value={jobIdFilter || SELECT_VALUE_ALL}
            onValueChange={(v) =>
              setQuery({
                page: 1,
                jobId: v === SELECT_VALUE_ALL ? "" : v,
              })
            }
          >
            <SelectTrigger
              id="filter-job"
              className="min-w-[12rem] w-[min(100%,20rem)]"
            >
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_VALUE_ALL}>All jobs</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={statusFilter || SELECT_VALUE_ALL}
            onValueChange={(v) =>
              setQuery({
                page: 1,
                status: v === SELECT_VALUE_ALL ? "" : v,
              })
            }
          >
            <SelectTrigger
              id="filter-status"
              className="min-w-[12rem] w-[min(100%,20rem)]"
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-10 w-[min(100%,20rem)] min-w-[12rem]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-10 w-[min(100%,20rem)] min-w-[12rem]" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : data.applications.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "No applications match these filters"
              : "No applications yet"
          }
          description={
            hasFilters
              ? "Try clearing the job or status filter, or pick another page."
              : "When candidates apply to your active postings, they will appear in this list."
          }
        >
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuery({ page: 1, jobId: "", status: "" })}
            >
              Clear filters
            </Button>
          ) : (
            <Link
              href="/recruiter/jobs"
              className={cn(
                buttonVariants({ variant: "default" }),
                "no-underline",
              )}
            >
              View job posts
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <DataTable columns={columns} data={data.applications} />
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-4 text-sm">
            <span>
              Page {page} of {Math.max(1, data.totalPages)} · {data.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  page <= 1 && "pointer-events-none opacity-50",
                )}
                onClick={() => setQuery({ page: page - 1 })}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  page >= data.totalPages && "pointer-events-none opacity-50",
                )}
                onClick={() => setQuery({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RecruiterApplicationsListPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      }
    >
      <RecruiterApplicationsListContent />
    </Suspense>
  );
}
