"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { listOrgJobs } from "@/lib/services/jobs-service";
import { recruiterJobsColumns } from "@/components/jobs/recruiter-jobs-columns";
import { DataTable } from "@/components/ui/data-table";
import { useAuthStore } from "@/store";
import type { JobStatus, OrgJobsListResponse } from "@/types/jobs.types";
import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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

const SELECT_VALUE_ALL = "__all__";
const JOB_STATUSES: JobStatus[] = ["draft", "active", "paused", "closed"];
const SEARCH_DEBOUNCE_MS = 300;

function RecruiterJobsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const statusFilter = searchParams.get("status") ?? "";
  const q = (searchParams.get("q") ?? "").trim();

  const [qDraft, setQDraft] = useState(q);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQDraft(q);
  }, [q]);

  const [data, setData] = useState<OrgJobsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setQuery = useCallback(
    (next: { page?: number; status?: string; q?: string }) => {
      const p = new URLSearchParams();
      const pg = next.page ?? page;
      const st = next.status !== undefined ? next.status : statusFilter;
      const qq = next.q !== undefined ? next.q : q;
      if (pg > 1) p.set("page", String(pg));
      if (st) p.set("status", st);
      if (qq) p.set("q", qq);
      const qs = p.toString();
      router.push(qs ? `/recruiter/jobs?${qs}` : "/recruiter/jobs");
    },
    [router, page, statusFilter, q],
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const trimmed = qDraft.trim();
    if (trimmed === q) {
      return undefined;
    }

    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      setQuery({ page: 1, q: trimmed });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [qDraft, q, setQuery]);

  const fetchList = useCallback(async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listOrgJobs({
        page,
        limit: 20,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(q ? { q } : {}),
      });
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load jobs");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, page, statusFilter, q]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const columns = useMemo(() => recruiterJobsColumns, []);
  const hasFilters = Boolean(statusFilter || q);

  if (!user?.organizationId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Job posts</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Create an organization first, then you can add job postings and
          generate hiring pipelines.
        </p>
        <Link
          href="/recruiter/organization"
          className={cn(
            buttonVariants({ variant: "default" }),
            "no-underline w-fit",
          )}
        >
          Set up organization
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Job posts</h1>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job posts</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            Draft and publish roles, generate the three-step pipeline from the
            job description, and open applications for each listing.
          </p>
        </div>
        <Link
          href="/recruiter/jobs/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "no-underline shrink-0",
          )}
        >
          New job post
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-job-status">Posting status</Label>
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
              id="filter-job-status"
              className="min-w-[12rem] w-[min(100%,22rem)]"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_VALUE_ALL}>All statuses</SelectItem>
              {JOB_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {jobPostingStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md">
          <Label htmlFor="filter-job-q">Search title</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="filter-job-q"
              type="search"
              enterKeyHint="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = null;
                  }
                  const trimmed = qDraft.trim();
                  if (trimmed !== q) setQuery({ page: 1, q: trimmed });
                }
              }}
              placeholder="Keyword in job title…"
              className="min-w-[10rem] flex-1"
              aria-label="Search job posts by title"
              autoComplete="off"
            />
            {q || qDraft.trim() ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground shrink-0"
                onClick={() => {
                  if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = null;
                  }
                  setQDraft("");
                  setQuery({ page: 1, q: "" });
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-[min(100%,22rem)]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : data.total === 0 ? (
        <EmptyState
          title={
            hasFilters ? "No job posts match these filters" : "No job posts yet"
          }
          description={
            hasFilters
              ? "Try another status or search term, or clear filters to see everything in your organization."
              : "Create a draft posting, add a description, then generate the hiring pipeline when you are ready."
          }
        >
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQDraft("");
                setQuery({ page: 1, status: "", q: "" });
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Link
              href="/recruiter/jobs/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "no-underline",
              )}
            >
              New job post
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.jobs}
            initialSorting={[{ id: "updatedAt", desc: true }]}
            emptyMessage="No job posts on this page."
          />
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-4 text-sm">
            <span>
              Page {data.page} of {Math.max(1, data.totalPages)} · {data.total}{" "}
              total
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

export default function RecruiterJobsListPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-24 w-full max-w-2xl rounded-xl" />
        </div>
      }
    >
      <RecruiterJobsListContent />
    </Suspense>
  );
}
