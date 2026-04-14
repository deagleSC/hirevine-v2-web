"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getQuiz, submitQuiz } from "@/lib/services/applications-service";
import type { PublicQuizQuestion } from "@/types/applications.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function ApplicationQuizPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId =
    typeof params.applicationId === "string" ? params.applicationId : "";

  const [questions, setQuestions] = useState<PublicQuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!applicationId) return;
      try {
        const { questions: qs } = await getQuiz(applicationId);
        if (!cancelled) {
          setQuestions(qs);
          const init: Record<string, string> = {};
          for (const q of qs) {
            init[q.id] = "";
          }
          setAnswers(init);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load quiz");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const allAnswered = useMemo(() => {
    if (!questions?.length) return false;
    return questions.every((q) => (answers[q.id] ?? "").trim().length > 0);
  }, [questions, answers]);

  const onSubmit = async () => {
    if (!questions || !applicationId) return;
    const payload = questions.map((q) => ({
      questionId: q.id,
      answer: (answers[q.id] ?? "").trim(),
    }));
    setSubmitting(true);
    try {
      await submitQuiz(applicationId, payload);
      toast.success("Quiz submitted.");
      router.push(`/candidate/applications/${applicationId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Quiz unavailable
        </h1>
        <p className="text-destructive text-sm">{error}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The quiz is only open when your application is waiting on that step.
          If you already submitted, go back to your application summary.
        </p>
        <Link
          href={`/candidate/applications/${applicationId}`}
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
        >
          Back to application
        </Link>
      </div>
    );
  }

  if (questions === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <EmptyState
          title="No quiz questions loaded"
          description="The employer may still be configuring this step. Return to your application summary and try again later."
        >
          <Link
            href={`/candidate/applications/${applicationId}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "no-underline",
            )}
          >
            Back to application
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href={`/candidate/applications/${applicationId}`}
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-muted/60"
        >
          ← Back to application
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Job knowledge quiz
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          These questions are set by the employer for this role. Answer every
          item, then submit <strong className="text-foreground">once</strong> —
          you cannot edit answers after they are sent.
        </p>
      </header>

      <ol className="space-y-6">
        {questions.map((q, index) => (
          <li key={q.id}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base leading-snug">
                  Question {index + 1} of {questions.length}
                </CardTitle>
                <p className="text-foreground pt-2 text-sm leading-relaxed">
                  {q.prompt}
                </p>
                <CardDescription>
                  {q.type === "multiple_choice"
                    ? "Select the single best answer from the list."
                    : "Type a concise answer. Matching ignores capitalization."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.type === "multiple_choice" ? (
                  <fieldset className="space-y-2">
                    <legend className="sr-only">{q.prompt}</legend>
                    {q.options.map((opt) => {
                      const id = `${q.id}-${opt}`;
                      return (
                        <label
                          key={opt}
                          htmlFor={id}
                          className="flex cursor-pointer items-start gap-3 rounded-md bg-muted/40 px-3 py-2.5 text-sm leading-snug hover:bg-muted/55 has-[:checked]:bg-primary/10"
                        >
                          <input
                            id={id}
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className="mt-0.5 size-4 shrink-0"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={q.id} className="text-foreground">
                      Your answer
                    </Label>
                    <Input
                      id={q.id}
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      placeholder="Type your answer"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          disabled={!allAnswered || submitting}
          onClick={() => void onSubmit()}
          className="w-full sm:w-auto"
        >
          {submitting ? "Submitting answers…" : "Submit all answers"}
        </Button>
        {!allAnswered && (
          <p className="text-muted-foreground text-xs sm:text-sm">
            Complete every question to enable submission.
          </p>
        )}
      </div>
    </div>
  );
}
