import type { ApplicationStatus } from "@/types/applications.types";
import type { JobStatus } from "@/types/jobs.types";

/** Short label for badges and compact UI. */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  NODE_1_PENDING: "Resume review",
  NODE_2_PENDING: "Quiz due",
  NODE_3_PENDING: "Final summary",
  COMPLETED: "Complete",
  REJECTED: "Not selected",
};

/** Longer explanation for tooltips, list subtitles, and detail cards. */
export const APPLICATION_STATUS_HELP: Record<ApplicationStatus, string> = {
  NODE_1_PENDING:
    "Your resume is being checked against this job. This usually takes a short time.",
  NODE_2_PENDING:
    "Screening is done. Complete the job quiz so we can finish your application.",
  NODE_3_PENDING:
    "Your quiz is recorded. We are generating the final hiring summary for this role.",
  COMPLETED:
    "Every step for this application is finished. The employer may follow up through their usual process if you move forward.",
  REJECTED:
    "This application did not meet an automated requirement for this role. You can still explore other open roles from the job board.",
};

export function jobPostingStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    active: "Accepting applications",
    draft: "Draft — not visible to candidates",
    paused: "On hold — not accepting new applications",
    closed: "Closed — not accepting applications",
  };
  return labels[status] ?? status;
}
