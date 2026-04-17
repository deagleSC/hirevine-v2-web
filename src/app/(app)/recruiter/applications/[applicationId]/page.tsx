"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRecruiterApplicationDetail } from "@/lib/services/applications-service";
import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import type { JobStatus } from "@/types/jobs.types";
import { ApplicationStatusBadge } from "@/components/applications/status-badge";
import {
  recruiterPipelineNodeHeading,
  recruiterScoreLabel,
} from "@/lib/recruiter/pipeline-node-heading";
import type { RecruiterApplicationDetail } from "@/types/applications.types";
import { buttonVariants } from "@/components/ui/button-variants";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobPipelineFlow } from "@/components/jobs/job-pipeline-flow";
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

export default function RecruiterApplicationDetailPage() {
  const params = useParams();
  const applicationId =
    typeof params.applicationId === "string" ? params.applicationId : "";

  const [data, setData] = useState<RecruiterApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await getRecruiterApplicationDetail(applicationId);
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
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Application</h1>
        <p className="text-destructive text-sm">{error}</p>
        <Link
          href="/recruiter/applications"
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          Back to applications
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const { application, candidate, job, nodes } = data;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/recruiter/applications"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← Applications
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
          <p className="text-muted-foreground text-sm">
            Candidate:{" "}
            <span className="text-foreground font-medium">
              {candidate.email}
            </span>
            {" · "}
            {jobPostingStatusLabel(job.status as JobStatus)}
          </p>
          <p className="text-muted-foreground text-sm">
            Resume:{" "}
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary rounded-md px-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
            >
              Open file
            </a>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evaluation trail</CardTitle>
          <CardDescription>
            Automated scores and notes for this application (same data the API
            stores on each pipeline node).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nodes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No node results yet. They appear after resume screening, quiz, or
              final report completes.
            </p>
          ) : (
            <ul className="space-y-4">
              {nodes.map((n) => (
                <li
                  key={n.id}
                  className="bg-muted/40 rounded-lg p-4 text-sm shadow-xs"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-foreground">
                      {recruiterPipelineNodeHeading(n.nodeIndex, n.nodeType)}
                    </h3>
                    {n.score != null && (
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {recruiterScoreLabel(n.nodeType)}:{" "}
                        <span className="text-foreground font-medium tabular-nums">
                          {n.score}
                        </span>
                        <span className="text-muted-foreground"> / 100</span>
                      </span>
                    )}
                  </div>
                  {n.reasoning &&
                    (n.nodeIndex === 3 ? (
                      <div className="mt-3 rounded-md bg-background/40 p-3 shadow-xs">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {n.reasoning}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-3 whitespace-pre-wrap leading-relaxed">
                        {n.reasoning}
                      </p>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job pipeline</CardTitle>
          <CardDescription>
            Same three-step flow as on the job editor. Quiz prompts are
            summarized here; answer keys stay in the underlying data — treat as
            confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {job.pipeline ? (
            <JobPipelineFlow pipeline={job.pipeline} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No pipeline on this job.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/recruiter/jobs/${job.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          Edit job post
        </Link>
        <Link
          href={`/recruiter/jobs/${job.id}/applications`}
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          All applications for this job
        </Link>
      </div>
    </div>
  );
}
