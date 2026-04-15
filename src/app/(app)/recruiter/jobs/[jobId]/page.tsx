"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  generateJobPipeline,
  getRecruiterJob,
  patchJob,
} from "@/lib/services/jobs-service";
import { jobPostingStatusLabel } from "@/lib/applications/candidate-copy";
import { useAuthStore } from "@/store";
import type { JobStatus } from "@/types/jobs.types";
import type { RecruiterJob } from "@/types/jobs.types";
import { buttonVariants } from "@/components/ui/button-variants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReadMoreText } from "@/components/ui/read-more-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobPipelineAiChat } from "@/components/jobs/job-pipeline-ai-chat";
import { JobPipelineFlow } from "@/components/jobs/job-pipeline-flow";
import type { JobPipeline } from "@/lib/validations/job-pipeline.schema";
import { cn } from "@/lib/utils";

const STATUSES: JobStatus[] = ["draft", "active", "paused", "closed"];

export default function RecruiterJobEditPage() {
  const params = useParams();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const { user } = useAuthStore();

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("draft");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "pipeline">("details");

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "details" | "pipeline");
  }, []);

  const load = useCallback(async () => {
    if (!jobId) return;
    try {
      const j = await getRecruiterJob(jobId);
      setJob(j);
      setTitle(j.title);
      setDescription(j.description ?? "");
      setStatus(j.status);
      setEditingDescription(false);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Job not found");
      setJob(null);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!jobId) return;
    const t = title.trim();
    if (!t) {
      toast.error("Title cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const j = await patchJob(jobId, {
        title: t,
        description: description.trim(),
        status,
      });
      setJob(j);
      toast.success("Job updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onGeneratePipeline = async () => {
    if (!jobId || !job) return;
    const t = title.trim();
    if (!t) {
      toast.error("Title cannot be empty");
      return;
    }
    const jobDirty =
      t !== job.title.trim() ||
      description.trim() !== (job.description ?? "").trim() ||
      status !== job.status;
    setGenerating(true);
    try {
      if (jobDirty) {
        const saved = await patchJob(jobId, {
          title: t,
          description: description.trim(),
          status,
        });
        setJob(saved);
        setTitle(saved.title);
        setDescription(saved.description ?? "");
        setStatus(saved.status);
        setEditingDescription(false);
      }
      const j = await generateJobPipeline(jobId);
      setJob(j);
      setEditingDescription(false);
      toast.success(
        jobDirty
          ? "Job saved and pipeline generated from the description"
          : "Pipeline generated from the job description",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (!user?.organizationId) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Create an organization to manage jobs.
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

  if (loadError) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Job not available
        </h1>
        <p className="text-destructive text-sm">{loadError}</p>
        <Link
          href="/recruiter/jobs"
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          Back to job posts
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  const descLen = description.trim().length;
  const canGenerate = descLen >= 40;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/recruiter/jobs"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← Job posts
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Edit job post
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {jobPostingStatusLabel(job.status)} ·{" "}
          <Link
            href={`/recruiter/jobs/${jobId}/applications`}
            className="text-primary rounded-md px-0.5 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          >
            Applications for this job
          </Link>
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid h-auto min-h-9 w-full max-w-xl grid-cols-2 gap-1">
          <TabsTrigger value="details">Job details</TabsTrigger>
          <TabsTrigger value="pipeline">Hiring pipeline</TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className="mt-6 space-y-0 focus:outline-none"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job details</CardTitle>
              <CardDescription>
                Title, description, and posting status. Active jobs appear on
                the public board.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="border-border space-y-3 border-t pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm font-medium">
                      Description
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Same copy and read more / less behavior as the public open
                      role page.
                    </p>
                  </div>
                  {editingDescription ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDescription(job.description ?? "");
                          setEditingDescription(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setEditingDescription(false)}
                      >
                        Done editing
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setEditingDescription(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {editingDescription ? (
                  <div className="space-y-2">
                    <Label htmlFor="description" className="sr-only">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[16rem] resize-y"
                      placeholder="Role summary, requirements, and what success looks like…"
                    />
                    <p className="text-muted-foreground text-xs">
                      {descLen} characters
                      {!canGenerate &&
                        " · Need at least 40 to generate a pipeline"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/30 rounded-lg p-4">
                      {description.trim().length > 0 ? (
                        <ReadMoreText text={description.trim()} />
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No description yet. Click Edit to add copy for
                          candidates.
                        </p>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {descLen} characters
                      {!canGenerate &&
                        " · Need at least 40 to generate a pipeline"}
                    </p>
                  </>
                )}
              </div>

              <div className="border-border space-y-2 border-t pt-6">
                <Label htmlFor="status">Posting status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as JobStatus)}
                >
                  <SelectTrigger id="status" className="max-w-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {jobPostingStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-border border-t pt-6">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => void onSave()}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="pipeline"
          forceMount
          className="data-[state=inactive]:hidden mt-6 min-w-0 focus:outline-none"
        >
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="text-base">Hiring pipeline</CardTitle>
              <CardDescription>
                {job.pipeline
                  ? "Three-step flow: resume screen → quiz → hiring summary. Zoom and pan the diagram."
                  : "No pipeline yet. Generate from the description or create via API."}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 space-y-4">
              <div className="flex flex-col gap-3 border-border border-b pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={generating || !canGenerate}
                    onClick={() => void onGeneratePipeline()}
                  >
                    {generating ? "Generating…" : "Generate pipeline (AI)"}
                  </Button>
                </div>
                {!canGenerate ? (
                  <p className="text-muted-foreground text-xs">
                    Add at least 40 characters in the{" "}
                    <span className="text-foreground font-medium">
                      Job details
                    </span>{" "}
                    tab (description) to enable generation.
                  </p>
                ) : null}
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Unsaved edits to title, description, or status are saved
                  automatically before generation. If the API returns an error
                  about OpenRouter, configure{" "}
                  <code className="text-foreground">OPENROUTER_API_KEY</code> on
                  the server. A 502 means the model call failed — try again or
                  edit the pipeline manually via API.
                </p>
              </div>
              {job.pipeline ? (
                <div className="grid min-h-0 min-w-0 gap-6 xl:grid-cols-[1fr_minmax(17.5rem,24rem)] xl:items-stretch">
                  <div className="min-h-0 min-w-0 space-y-4">
                    <JobPipelineFlow
                      key={
                        typeof job.updatedAt === "string"
                          ? job.updatedAt
                          : "pipeline"
                      }
                      pipeline={job.pipeline}
                    />
                  </div>
                  <div className="flex min-h-0 h-full min-w-0 max-h-[calc(100dvh-15.5rem)] flex-col overflow-hidden">
                    <JobPipelineAiChat
                      jobId={jobId}
                      onPipelineUpdated={(next: JobPipeline) => {
                        setJob((j) =>
                          j
                            ? {
                                ...j,
                                pipeline: next,
                                updatedAt: new Date().toISOString(),
                              }
                            : j,
                        );
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">—</p>
              )}

              <div className="border-border border-t pt-6">
                <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
                  Save title, description, and status from either tab before
                  sharing the posting or generating the pipeline.
                </p>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => void onSave()}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
