"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getApplicationDetail } from "@/lib/services/applications-service";
import { APPLICATION_STATUS_HELP } from "@/lib/applications/candidate-copy";
import type {
  ApplicationStatus,
  CandidateApplicationDetail,
} from "@/types/applications.types";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function shouldPoll(status: ApplicationStatus) {
  return status === "NODE_1_PENDING" || status === "NODE_3_PENDING";
}

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

export default function CandidateApplicationDetailPage() {
  const params = useParams();
  const applicationId =
    typeof params.applicationId === "string" ? params.applicationId : "";

  const [data, setData] = useState<CandidateApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const d = await getApplicationDetail(applicationId);
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Not found");
          setData(null);
        }
      }
    };

    void fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const pollStatus = data?.application.status;

  useEffect(() => {
    if (!applicationId || !pollStatus || !shouldPoll(pollStatus)) {
      return;
    }
    const t = window.setInterval(() => {
      void (async () => {
        try {
          const d = await getApplicationDetail(applicationId);
          setData(d);
          setError(null);
        } catch {
          /* keep last good data while polling */
        }
      })();
    }, 5000);
    return () => window.clearInterval(t);
  }, [applicationId, pollStatus]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Application not found
        </h1>
        <p className="text-destructive text-sm">{error}</p>
        <p className="text-muted-foreground text-sm">
          The link may be wrong, or you may not have access to this application.
        </p>
        <Link
          href="/candidate/applications"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
        >
          Back to my applications
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-40 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  const { application, job, nextStep } = data;
  const showQuizCta = application.status === "NODE_2_PENDING";
  const polling = shouldPoll(application.status);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/candidate/applications"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← My applications
        </Link>
        <div className="mt-4 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            <span className="text-muted-foreground text-xs sm:text-sm">
              Last updated {formatWhen(application.updatedAt)}
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {APPLICATION_STATUS_HELP[application.status]}
          </p>
        </div>
      </div>

      {polling && (
        <div
          className="bg-muted/60 flex gap-3 rounded-lg px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <span className="border-primary mt-0.5 size-4 shrink-0 animate-spin rounded-full border-2 border-b-transparent" />
          <div>
            <p className="font-medium text-foreground">Checking for updates</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              This page refreshes about every 5 seconds while automated steps
              run. You can leave the tab open or return later — progress is
              saved on the server.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you should do</CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">
            Clear next action for this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p className="text-foreground">{nextStep}</p>
          {showQuizCta && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/candidate/applications/${applicationId}/quiz`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "inline-flex w-fit text-center",
                )}
              >
                Start job quiz
              </Link>
              <span className="text-muted-foreground text-xs sm:text-sm">
                One attempt per application. Allow enough time to finish in one
                sitting.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
