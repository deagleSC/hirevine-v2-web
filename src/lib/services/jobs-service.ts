import { API_ROUTES } from "@/lib/configs/api";
import { api } from "@/lib/utils/api-client";
import { handleError } from "@/lib/utils/handleError";
import type { ApplicationRun } from "@/types/applications.types";
import type {
  OrgJobOption,
  OrgJobsListResponse,
  PublicJob,
  RecruiterJob,
} from "@/types/jobs.types";

export async function browseJobs(): Promise<PublicJob[]> {
  try {
    const res = await api.get(API_ROUTES.JOBS.BROWSE);
    const jobs = (res.data?.data as { jobs?: PublicJob[] } | undefined)?.jobs;
    if (!Array.isArray(jobs)) throw new Error("Invalid jobs response");
    return jobs;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getJob(jobId: string): Promise<PublicJob> {
  try {
    const res = await api.get(API_ROUTES.JOBS.BY_ID(jobId));
    const job = (res.data?.data as { job?: PublicJob } | undefined)?.job;
    if (!job?.id) throw new Error("Job not found");
    return job;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function applyToJob(
  jobId: string,
  resumeUrl: string,
): Promise<{ application: ApplicationRun }> {
  try {
    const res = await api.post(API_ROUTES.JOBS.APPLY(jobId), { resumeUrl });
    const data = res.data?.data as { application?: ApplicationRun };
    if (!data?.application) throw new Error("Invalid apply response");
    return { application: data.application };
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function listOrgJobs(params?: {
  page?: number;
  limit?: number;
  /** Single status or comma-separated list (must match API). */
  status?: string;
  /** Title substring search. */
  q?: string;
}): Promise<OrgJobsListResponse> {
  try {
    const res = await api.get(API_ROUTES.JOBS.LIST_ORG, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.q ? { q: params.q } : {}),
      },
    });
    const data = res.data?.data as OrgJobsListResponse | undefined;
    if (!data || !Array.isArray(data.jobs)) {
      throw new Error("Invalid jobs response");
    }
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

/** Lightweight job list for filter dropdowns (max 500 on server). */
export async function listOrgJobOptions(): Promise<OrgJobOption[]> {
  try {
    const res = await api.get(API_ROUTES.JOBS.OPTIONS);
    const jobs = (res.data?.data as { jobs?: OrgJobOption[] } | undefined)
      ?.jobs;
    if (!Array.isArray(jobs)) throw new Error("Invalid job options response");
    return jobs;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getRecruiterJob(jobId: string): Promise<RecruiterJob> {
  try {
    const res = await api.get(API_ROUTES.JOBS.BY_ID(jobId));
    const job = (res.data?.data as { job?: RecruiterJob } | undefined)?.job;
    if (!job?.id) throw new Error("Job not found");
    return job;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function createJob(body: {
  title: string;
  description?: string;
  status?: string;
}): Promise<RecruiterJob> {
  try {
    const res = await api.post(API_ROUTES.JOBS.LIST_ORG, body);
    const job = (res.data?.data as { job?: RecruiterJob } | undefined)?.job;
    if (!job?.id) throw new Error("Invalid create response");
    return job;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function patchJob(
  jobId: string,
  body: Partial<{
    title: string;
    description: string;
    status: string;
    pipeline: unknown | null;
  }>,
): Promise<RecruiterJob> {
  try {
    const res = await api.patch(API_ROUTES.JOBS.BY_ID(jobId), body);
    const job = (res.data?.data as { job?: RecruiterJob } | undefined)?.job;
    if (!job?.id) throw new Error("Invalid update response");
    return job;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function generateJobPipeline(
  jobId: string,
): Promise<RecruiterJob> {
  try {
    const res = await api.post(API_ROUTES.JOBS.GENERATE_PIPELINE(jobId));
    const job = (res.data?.data as { job?: RecruiterJob } | undefined)?.job;
    if (!job?.id) throw new Error("Invalid pipeline response");
    return job;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function listJobApplications(
  jobId: string,
): Promise<ApplicationRun[]> {
  try {
    const res = await api.get(API_ROUTES.JOBS.APPLICATIONS(jobId));
    const applications = (
      res.data?.data as { applications?: ApplicationRun[] } | undefined
    )?.applications;
    if (!Array.isArray(applications)) throw new Error("Invalid response");
    return applications;
  } catch (e) {
    throw new Error(handleError(e));
  }
}
