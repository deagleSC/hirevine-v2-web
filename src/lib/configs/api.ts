export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** Paths match `hirevine-v2-be` `createApp()` mounts. */
export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  ORGANIZATIONS: {
    CREATE: "/api/organizations",
    ME: "/api/organizations/me",
  },
  JOBS: {
    BROWSE: "/api/jobs/browse",
    /** Recruiter/admin: paginated org jobs (`page`, `limit`, `status`, `q`). */
    LIST_ORG: "/api/jobs",
    /** Recruiter/admin: id + title for up to 500 jobs (filters, dropdowns). */
    OPTIONS: "/api/jobs/options",
    BY_ID: (jobId: string) => `/api/jobs/${jobId}`,
    APPLY: (jobId: string) => `/api/jobs/${jobId}/apply`,
    GENERATE_PIPELINE: (jobId: string) =>
      `/api/jobs/${jobId}/generate-pipeline`,
    PIPELINE_CHAT: (jobId: string) => `/api/jobs/${jobId}/pipeline-chat`,
    APPLICATIONS: (jobId: string) => `/api/jobs/${jobId}/applications`,
  },
  RESUMES: {
    UPLOAD: "/api/resumes/upload",
  },
  APPLICATIONS: {
    ME: "/api/applications/me",
    /** Recruiter/admin: paginated org applications (`page`, `limit`, `jobId`, `status`). */
    LIST_ORG: "/api/applications",
    BY_ID: (applicationId: string) => `/api/applications/${applicationId}`,
    QUIZ: (applicationId: string) => `/api/applications/${applicationId}/quiz`,
  },
  HEALTH: "/health",
} as const;
