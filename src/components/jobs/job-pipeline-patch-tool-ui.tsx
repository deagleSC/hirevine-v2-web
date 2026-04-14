"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, ListTreeIcon, XCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function countQuizQuestionsInPatch(node2: unknown): number | undefined {
  if (!isRecord(node2)) return undefined;
  const q = node2.questions;
  if (!Array.isArray(q)) return undefined;
  return q.length;
}

/** Human-readable summary of tool input (no raw JSON). */
export function PipelinePatchToolInputSummary({
  input,
  className,
}: {
  input: unknown;
  className?: string;
}) {
  if (input === undefined || input === null) {
    return (
      <p className={cn("text-muted-foreground text-xs", className)}>
        Preparing update…
      </p>
    );
  }

  if (!isRecord(input)) {
    return (
      <p className={cn("text-muted-foreground text-xs", className)}>
        Preparing update…
      </p>
    );
  }

  const stages: { key: string; label: string }[] = [];
  if (input.node1 != null)
    stages.push({ key: "n1", label: "Resume screening" });
  if (input.node2 != null) stages.push({ key: "n2", label: "Quiz" });
  if (input.node3 != null) stages.push({ key: "n3", label: "Hiring summary" });

  const quizCount =
    input.node2 != null ? countQuizQuestionsInPatch(input.node2) : undefined;

  const summary =
    typeof input.changeSummary === "string" ? input.changeSummary.trim() : "";

  if (stages.length === 0 && !summary) {
    return (
      <p className={cn("text-muted-foreground text-xs", className)}>
        Waiting for patch fields…
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {summary ? (
        <blockquote className="border-muted-foreground/30 text-foreground/90 border-l-2 py-0.5 pl-3 text-sm leading-snug">
          {summary}
        </blockquote>
      ) : null}
      {stages.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Stages
          </span>
          {stages.map((s) => (
            <Badge key={s.key} variant="secondary" className="font-normal">
              {s.label}
            </Badge>
          ))}
          {quizCount !== undefined ? (
            <span className="text-muted-foreground text-xs">
              Quiz patch includes {quizCount} question
              {quizCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Tool result without dumping full pipeline JSON. */
export function PipelinePatchToolResultSummary({
  output,
  errorText,
  className,
}: {
  output?: unknown;
  errorText?: string;
  className?: string;
}) {
  if (errorText?.trim()) {
    return (
      <div
        className={cn(
          "flex gap-2 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm",
          className,
        )}
        role="alert"
      >
        <XCircleIcon className="text-destructive mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 space-y-1">
          <p className="text-destructive font-medium">Could not apply update</p>
          <p className="text-destructive/90 text-xs leading-relaxed">
            {errorText}
          </p>
        </div>
      </div>
    );
  }

  if (output === undefined || output === null) {
    return null;
  }

  if (!isRecord(output)) {
    return (
      <p className={cn("text-muted-foreground text-xs", className)}>
        Update finished.
      </p>
    );
  }

  if (output.ok === true) {
    const message =
      typeof output.message === "string" && output.message.trim()
        ? output.message.trim()
        : "Pipeline updated.";
    return (
      <div
        className={cn(
          "flex gap-2 rounded-lg border border-emerald-600/25 bg-emerald-600/10 px-3 py-2.5 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10",
          className,
        )}
      >
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">
            {message}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Saved to this job. The diagram and pipeline data stay in sync—no
            need to copy JSON.
          </p>
        </div>
      </div>
    );
  }

  if (output.ok === false) {
    const message =
      typeof output.message === "string" && output.message.trim()
        ? output.message.trim()
        : "Update could not be saved.";
    const raw =
      typeof output.validationErrors === "string"
        ? output.validationErrors.trim()
        : "";
    const issues = raw
      ? raw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return (
      <div
        className={cn(
          "space-y-2 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm",
          className,
        )}
        role="status"
      >
        <div className="flex gap-2">
          <XCircleIcon className="text-destructive mt-0.5 size-4 shrink-0" />
          <p className="text-destructive min-w-0 font-medium">{message}</p>
        </div>
        {issues.length > 0 ? (
          <ul className="text-destructive/95 list-inside list-disc space-y-0.5 border-destructive/20 mt-2 border-t pt-2 text-xs leading-relaxed">
            {issues.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <p className={cn("text-muted-foreground text-xs", className)}>
      Unexpected tool result.
    </p>
  );
}

export function AssistantReasoningBlock({
  text,
  className,
}: {
  text: string;
  className?: string;
}): ReactNode {
  const trimmed = text.trim();
  if (!trimmed) return null;

  return (
    <details
      className={cn(
        "border-border bg-muted/30 text-muted-foreground mb-2 w-full max-w-full rounded-lg border text-xs",
        className,
      )}
    >
      <summary className="cursor-pointer select-none px-3 py-2 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <ListTreeIcon className="size-3.5 opacity-70" />
          Model reasoning
        </span>
      </summary>
      <div className="border-border max-h-48 overflow-y-auto border-t px-3 py-2 whitespace-pre-wrap leading-relaxed">
        {trimmed}
      </div>
    </details>
  );
}
