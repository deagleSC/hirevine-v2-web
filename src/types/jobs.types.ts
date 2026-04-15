export type JobStatus = "draft" | "active" | "paused" | "closed";

/** Public job from active `GET /api/jobs/:id` (includes description; no pipeline). */
export interface PublicJob {
  id: string;
  title: string;
  status: JobStatus;
  organizationId: string;
  /** Full posting text when returned by the API (may be empty). */
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Recruiter/admin `GET/PATCH /api/jobs/:id` and list responses — includes pipeline (sensitive). */
export interface RecruiterJob extends PublicJob {
  description: string;
  createdBy: string;
  pipeline: unknown | null;
}

/** `GET /api/jobs` paginated envelope. */
export interface OrgJobsListResponse {
  jobs: RecruiterJob[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** `GET /api/jobs/catalog` — active jobs only, public shape. */
export interface ActiveJobsCatalogResponse {
  jobs: PublicJob[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** `GET /api/jobs/options` row (minimal job for selects). */
export interface OrgJobOption {
  id: string;
  title: string;
}
