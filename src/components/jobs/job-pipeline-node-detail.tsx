import type { JobPipeline } from "@/lib/validations/job-pipeline.schema";

export type PipelineNodePanelId = "n1" | "n2" | "n3";

const TITLES: Record<PipelineNodePanelId, string> = {
  n1: "Resume screening",
  n2: "Job quiz",
  n3: "Hiring summary",
};

export function jobPipelineNodeTitle(id: PipelineNodePanelId): string {
  return TITLES[id];
}

export function JobPipelineNodeDetail({
  pipeline,
  nodeId,
}: {
  pipeline: JobPipeline;
  nodeId: PipelineNodePanelId;
}) {
  if (nodeId === "n1") {
    const { node1 } = pipeline;
    return (
      <div className="text-foreground space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Rubric
          </h3>
          <p className="whitespace-pre-wrap">{node1.rubric}</p>
        </section>
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Must-have skills
          </h3>
          {node1.mustHaveSkills.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {node1.mustHaveSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">None listed.</p>
          )}
        </section>
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Nice-to-have skills
          </h3>
          {node1.niceToHaveSkills.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {node1.niceToHaveSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">None listed.</p>
          )}
        </section>
        {node1.passThreshold != null ? (
          <section className="space-y-1">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Pass threshold
            </h3>
            <p className="tabular-nums">{node1.passThreshold} / 100</p>
          </section>
        ) : null}
      </div>
    );
  }

  if (nodeId === "n2") {
    const { questions } = pipeline.node2;
    return (
      <div className="text-foreground space-y-8 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">
          {questions.length} question{questions.length === 1 ? "" : "s"} ·
          Includes answer keys for grading.
        </p>
        <ol className="space-y-8">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="border-border space-y-3 border-b pb-8 last:border-0 last:pb-0"
            >
              <p className="font-medium">
                {i + 1}. {q.prompt}
              </p>
              <p className="text-muted-foreground text-xs">
                Type:{" "}
                <span className="text-foreground font-mono">{q.type}</span> ·
                ID: <span className="text-foreground font-mono">{q.id}</span>
              </p>
              {q.type === "multiple_choice" ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Options
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    {q.options.map((opt) => (
                      <li key={opt}>{opt}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  Answer key
                </p>
                <p className="bg-muted/50 rounded-md p-3 font-mono text-xs whitespace-pre-wrap">
                  {q.answerKey}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const { node3 } = pipeline;
  return (
    <div className="text-foreground space-y-6 text-sm leading-relaxed">
      <section className="space-y-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Report instructions
        </h3>
        <p className="whitespace-pre-wrap">{node3.reportInstructions}</p>
      </section>
      {node3.scoringWeightsHint?.trim() ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Scoring weights hint
          </h3>
          <p className="whitespace-pre-wrap">{node3.scoringWeightsHint}</p>
        </section>
      ) : null}
    </div>
  );
}
