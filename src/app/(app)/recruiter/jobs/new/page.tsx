"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createJob } from "@/lib/services/jobs-service";
import { useAuthStore } from "@/store";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function RecruiterJobNewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  if (!user?.organizationId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">New job post</h1>
        <p className="text-muted-foreground text-sm">
          Create an organization before adding jobs.
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

  const onSubmit = async () => {
    const t = title.trim();
    setTitleError(null);
    if (!t) {
      setTitleError("Job title is required.");
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const job = await createJob({
        title: t,
        description: description.trim(),
        status: "draft",
      });
      toast.success("Job created");
      router.push(`/recruiter/jobs/${job.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create job");
    } finally {
      setSaving(false);
    }
  };

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
          New job post
        </h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Start as a draft. After saving, add a full description (40+
          characters) to generate the resume → quiz → report pipeline.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>
            Title and description are stored on the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              placeholder="Senior Backend Engineer"
              aria-invalid={titleError ? "true" : undefined}
              aria-describedby={titleError ? "new-job-title-error" : undefined}
            />
            {titleError ? (
              <p
                id="new-job-title-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {titleError}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role summary, requirements, and what success looks like…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={saving}
              onClick={() => void onSubmit()}
            >
              {saving ? "Saving…" : "Create draft"}
            </Button>
            <Link
              href="/recruiter/jobs"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "no-underline",
              )}
            >
              Cancel
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
