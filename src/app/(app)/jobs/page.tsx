"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { listActiveJobsCatalog } from "@/lib/services/jobs-service";
import type { PublicJob } from "@/types/jobs.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ReadMoreText } from "@/components/ui/read-more-text";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;
/** Start loading the next page before the sentinel hits the viewport. */
const SCROLL_ROOT_MARGIN = "280px";

function JobsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();

  const [qDraft, setQDraft] = useState(q);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQDraft(q);
  }, [q]);

  const setSearchInUrl = useCallback(
    (nextQ: string) => {
      const trimmed = nextQ.trim();
      const p = new URLSearchParams();
      if (trimmed) p.set("q", trimmed);
      const qs = p.toString();
      router.push(qs ? `/jobs?${qs}` : "/jobs");
    },
    [router],
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
      setSearchInUrl(trimmed);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [qDraft, q, setSearchInUrl]);

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [pageLoaded, setPageLoaded] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listEpochRef = useRef(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    listEpochRef.current += 1;
    const epoch = listEpochRef.current;
    setJobs([]);
    setPageLoaded(0);
    setTotalPages(0);
    setInitialLoading(true);
    setError(null);
    loadingMoreRef.current = false;

    (async () => {
      try {
        const res = await listActiveJobsCatalog({
          page: 1,
          limit: PAGE_SIZE,
          ...(q ? { q } : {}),
        });
        if (epoch !== listEpochRef.current) return;
        setJobs(res.jobs);
        setPageLoaded(1);
        setTotalPages(res.totalPages);
        setError(null);
      } catch (e) {
        if (epoch !== listEpochRef.current) return;
        setError(e instanceof Error ? e.message : "Could not load jobs");
        setJobs([]);
        setPageLoaded(0);
        setTotalPages(0);
      } finally {
        if (epoch === listEpochRef.current) {
          setInitialLoading(false);
        }
      }
    })();
  }, [q]);

  const hasMore = totalPages > 0 && pageLoaded < totalPages;

  const loadNextPage = useCallback(async () => {
    if (loadingMoreRef.current || initialLoading) return;
    if (!hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);
    const epoch = listEpochRef.current;
    const nextPage = pageLoaded + 1;

    try {
      const res = await listActiveJobsCatalog({
        page: nextPage,
        limit: PAGE_SIZE,
        ...(q ? { q } : {}),
      });
      if (epoch !== listEpochRef.current) return;
      setJobs((prev) => [...prev, ...res.jobs]);
      setPageLoaded(nextPage);
      setTotalPages(res.totalPages);
      setError(null);
    } catch (e) {
      if (epoch !== listEpochRef.current) return;
      setError(e instanceof Error ? e.message : "Could not load more jobs");
    } finally {
      loadingMoreRef.current = false;
      if (epoch === listEpochRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, initialLoading, pageLoaded, q]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) void loadNextPage();
      },
      { root: null, rootMargin: SCROLL_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  if (error && jobs.length === 0 && !initialLoading) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Could not load job postings
        </h1>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (initialLoading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Browse jobs</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Active postings you can open to read the full description and apply
          with your resume. Scroll down to load more.
        </p>
      </header>

      <div className="max-w-md space-y-2">
        <Label htmlFor="jobs-q">Search by title</Label>
        <Input
          id="jobs-q"
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          placeholder="e.g. engineer, analyst…"
          autoComplete="off"
        />
      </div>

      {error && jobs.length > 0 ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {jobs.length === 0 && !initialLoading ? (
        <p className="text-muted-foreground text-sm">
          {q
            ? "No active jobs match that search."
            : "There are no active job postings right now."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {jobs.map((job: PublicJob) => (
            <li key={job.id}>
              <Link
                href={`/jobs/${job.id}`}
                className={cn(
                  "bg-muted/35 hover:bg-muted/55 focus-visible:ring-ring block rounded-lg border border-transparent p-4 shadow-sm transition-colors",
                  "focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                <h2 className="text-base font-semibold tracking-tight">
                  {job.title}
                </h2>
                {job.description?.trim() ? (
                  <div className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    <ReadMoreText
                      text={job.description.trim()}
                      collapsedMaxChars={220}
                    />
                  </div>
                ) : null}
                <span className="text-primary mt-3 inline-block text-sm font-medium">
                  View posting →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {jobs.length > 0 && hasMore ? (
        <div
          ref={sentinelRef}
          className="flex min-h-12 items-center justify-center py-4"
          aria-hidden
        >
          {loadingMore ? (
            <span className="text-muted-foreground text-sm">Loading more…</span>
          ) : (
            <span className="text-muted-foreground sr-only">
              Load more jobs
            </span>
          )}
        </div>
      ) : null}

      {jobs.length > 0 && !hasMore && !initialLoading ? (
        <p className="text-muted-foreground text-center text-sm">
          You have reached the end of the list.
        </p>
      ) : null}
    </div>
  );
}

export default function JobsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      }
    >
      <JobsCatalogContent />
    </Suspense>
  );
}
