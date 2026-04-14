export type ApplicationStatus =
  | "NODE_1_PENDING"
  | "NODE_2_PENDING"
  | "NODE_3_PENDING"
  | "COMPLETED"
  | "REJECTED";

export interface ApplicationRun {
  id: string;
  jobId: string;
  candidateId: string;
  organizationId: string;
  status: ApplicationStatus;
  resumeUrl: string;
  currentFitScore?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationListItem extends ApplicationRun {
  job: { id: string; title: string; status: string } | null;
}

export interface CandidateApplicationDetail {
  view: "candidate";
  application: ApplicationRun;
  job: { id: string; title: string; status: string };
  nextStep: string;
}

export interface ApplicationOrgListRow extends ApplicationRun {
  candidateEmail: string;
  jobTitle: string;
}

export interface OrgApplicationsListResponse {
  applications: ApplicationOrgListRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApplicationNode {
  id: string;
  nodeIndex: number;
  nodeType: string;
  score?: number | null;
  reasoning?: string | null;
  payload?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterApplicationDetail {
  view: "recruiter";
  application: ApplicationRun;
  candidate: { id: string; email: string };
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    organizationId: string;
    createdBy: string;
    pipeline: unknown | null;
    createdAt?: string;
    updatedAt?: string;
  };
  nodes: ApplicationNode[];
}

export type PublicQuizQuestion =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: string[];
    }
  | {
      id: string;
      type: "short_answer";
      prompt: string;
    };
