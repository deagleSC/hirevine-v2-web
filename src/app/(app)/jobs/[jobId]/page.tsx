"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyToJob, getJob } from "@/lib/services/jobs-service";
import { uploadResume } from "@/lib/services/resumes-service";
import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import { useAuthStore } from "@/store";
import type { PublicJob } from "@/types/jobs.types";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ReadMoreText } from "@/components/ui/read-more-text";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const { user, isAuthenticated } = useAuthStore();

  const [job, setJob] = useState<PublicJob | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    if (!jobId) return;
    try {
      const j = await getJob(jobId);
      setJob(j);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Job not found");
      setJob(null);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setResumeFileName(file.name);
    setResumeUrl(null);
    setUploading(true);
    try {
      const { resumeUrl: url } = await uploadResume(file);
      setResumeUrl(url);
      toast.success(`“${file.name}” uploaded and ready to send`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      setResumeFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const onApply = async () => {
    if (!jobId || !resumeUrl) return;
    setApplying(true);
    try {
      await applyToJob(jobId, resumeUrl);
      toast.success("Application sent. Track progress under My applications.");
      setResumeUrl(null);
      setResumeFileName(null);
      router.push("/candidate/applications");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not submit";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          This listing is not available
        </h1>
        <p className="text-muted-foreground text-sm">{loadError}</p>
        <p className="text-muted-foreground text-sm">
          The job may have been removed, closed, or the link may be incorrect.
        </p>
        <Link
          href="/jobs"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
        >
          Back to all open roles
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-48 w-full max-w-xl rounded-xl" />
      </div>
    );
  }

  const isCandidate = isAuthenticated && user?.role === "candidate";
  const canApply = job.status === "active" && isCandidate;
  const statusLabel = jobPostingStatusLabel(job.status);

  return (
    <div className=" space-y-10">
      <div>
        <Link
          href="/jobs"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← All open roles
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {job.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {statusLabel}. Read the role description below, then apply with
              your resume if this is a good fit.
            </p>
          </div>
          {job.status === "active" && (
            <Badge variant="secondary" className="shrink-0">
              Hiring
            </Badge>
          )}
        </div>
      </div>

      <section className="space-y-3" aria-labelledby="job-description-heading">
        <h2
          id="job-description-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Role description
        </h2>
        {job.description && job.description.trim().length > 0 ? (
          <div className="bg-muted/30 rounded-xl p-5">
            <ReadMoreText text={job.description.trim()} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm leading-relaxed">
            No detailed description was provided for this listing. If you have
            questions about the role, reach out through the employer’s usual
            channels.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="apply-heading">
        <h2 id="apply-heading" className="text-lg font-semibold tracking-tight">
          Submit your application
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume & apply</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              Upload one PDF or plain-text resume (max about 4&nbsp;MB unless
              your administrator changed the limit). We store it securely and
              attach it to this application only.{" "}
              <strong className="text-foreground">
                You can apply once per job.
              </strong>{" "}
              If you already applied, open{" "}
              <Link
                href="/candidate/applications"
                className="text-primary rounded-md px-0.5 py-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
              >
                My applications
              </Link>{" "}
              to check status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isAuthenticated && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">
                <p className="font-medium text-foreground">
                  Sign in as a candidate
                </p>
                <p className="text-muted-foreground mt-2">
                  Only candidate accounts can upload a resume and apply. Hiring
                  managers use a different sign-in.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "text-sm",
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "text-sm",
                    )}
                  >
                    Create candidate account
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && user && user.role !== "candidate" && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">
                <p className="font-medium text-foreground">
                  Wrong account type
                </p>
                <p className="text-muted-foreground mt-2">
                  You are signed in as a{" "}
                  <span className="text-foreground capitalize">
                    {user.role}
                  </span>
                  . To apply to this job, sign out and sign in with a candidate
                  account, or open a private window and register as a candidate.
                </p>
              </div>
            )}

            {job.status !== "active" && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {statusLabel}. You cannot send a new application for this
                listing.
              </p>
            )}

            {canApply && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-foreground">
                    Your resume file
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.txt,text/plain,application/pdf"
                    disabled={uploading}
                    onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Accepted: PDF or .txt. The file is uploaded to secure
                    storage and linked only to your application.
                  </p>
                </div>

                {uploading && resumeFileName && (
                  <p className="text-muted-foreground text-sm">
                    Uploading{" "}
                    <span className="text-foreground font-medium">
                      “{resumeFileName}”
                    </span>
                    …
                  </p>
                )}

                {!uploading && resumeUrl && resumeFileName && (
                  <div className="bg-primary/5 rounded-lg p-4 text-sm">
                    <p className="font-medium text-foreground">
                      Ready to submit: {resumeFileName}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Choose another file above if you need to replace it before
                      you apply.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    disabled={!resumeUrl || applying}
                    onClick={() => void onApply()}
                  >
                    {applying ? "Sending application…" : "Send my application"}
                  </Button>
                  {!resumeUrl && !uploading && (
                    <span className="text-muted-foreground text-sm">
                      Upload a resume to enable this button.
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-base">What happens next</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm leading-relaxed">
              <li>
                Automated resume screening runs against the job requirements.
              </li>
              <li>
                If you move forward, you will complete a short job-specific
                quiz.
              </li>
              <li>
                A concise hiring summary is generated for the employer’s review.
              </li>
            </ol>
            <p className="text-muted-foreground mt-4 text-xs">
              Timelines depend on the employer’s pipeline and system load. Track
              everything under{" "}
              <Link
                href="/candidate/applications"
                className="text-primary rounded-md px-0.5 py-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
              >
                My applications
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
