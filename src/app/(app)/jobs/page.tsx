"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { browseJobs } from "@/lib/services/jobs-service";
import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import type { PublicJob } from "@/types/jobs.types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function formatPosted(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default function JobsBrowsePage() {
  const [jobs, setJobs] = useState<PublicJob[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await browseJobs();
        if (!cancelled) setJobs(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load jobs");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Could not load job listings
        </h1>
        <p className="text-muted-foreground text-sm">{error}</p>
        <p className="text-muted-foreground text-sm">
          Check that the Hirevine API is running and{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          points to it. If you are offline, reconnect and refresh this page.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "text-sm")}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }), "text-sm")}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 max-w-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Open roles you can apply to
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          These are active postings from employers using Hirevine. Select a role
          to read details, upload your resume, and start an application. You
          will need a candidate account to apply.
        </p>
      </header>

      {jobs.length === 0 ? (
        <EmptyState
          title="No open roles right now"
          description="When employers publish active jobs, they will appear here. You can still review your existing applications from the sidebar."
        />
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="text-foreground font-medium">{jobs.length}</span>{" "}
            active {jobs.length === 1 ? "role" : "roles"}.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const posted = formatPosted(job.createdAt);
              return (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="group block h-full no-underline"
                  >
                    <Card className="h-full transition-colors group-hover:bg-muted/40">
                      <CardHeader className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">
                            {job.title}
                          </CardTitle>
                          {job.status === "active" && (
                            <Badge variant="secondary" className="shrink-0">
                              Hiring
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                          {jobPostingStatusLabel(job.status)}
                          {posted ? ` · Listed ${posted}` : ""}. Open the role
                          to apply with your resume.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
