"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

const JobPipelineFlowClient = dynamic(
  () =>
    import("./job-pipeline-flow-client").then((m) => m.JobPipelineFlowClient),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[min(28rem,70vh)] w-full min-h-[320px] rounded-lg" />
    ),
  },
);

/** Read-only React Flow view of a v1 job pipeline (resume → quiz → report). */
export function JobPipelineFlow({ pipeline }: { pipeline: unknown }) {
  return <JobPipelineFlowClient pipeline={pipeline} />;
}
