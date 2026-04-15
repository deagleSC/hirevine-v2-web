import type { ApplicationStatus } from "@/types/applications.types";
import type { JobStatus } from "@/types/jobs.types";

export type RecruiterDashboardAnalytics = {
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  applicationsByDay: { date: string; count: number }[];
  jobsByStatus: { status: JobStatus; count: number }[];
  topJobsByApplications: { jobId: string; title: string; count: number }[];
  totals: {
    applications: number;
    newApplicationsLast7Days: number;
    activeJobs: number;
  };
};

export type CandidateDashboardAnalytics = {
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  applicationsByDay: { date: string; count: number }[];
  totals: { applications: number };
};
