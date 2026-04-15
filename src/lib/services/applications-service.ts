import { API_ROUTES } from "@/lib/configs/api";
import { api } from "@/lib/utils/api-client";
import { handleError } from "@/lib/utils/handleError";
import type {
  CandidateDashboardAnalytics,
  RecruiterDashboardAnalytics,
} from "@/types/analytics.types";
import type {
  ApplicationListItem,
  ApplicationRun,
  CandidateApplicationDetail,
  OrgApplicationsListResponse,
  PublicQuizQuestion,
  RecruiterApplicationDetail,
} from "@/types/applications.types";

export async function getRecruiterDashboardAnalytics(): Promise<RecruiterDashboardAnalytics> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.ANALYTICS_ORG);
    const data = res.data?.data as RecruiterDashboardAnalytics | undefined;
    if (
      !data ||
      !Array.isArray(data.applicationsByStatus) ||
      !Array.isArray(data.applicationsByDay)
    ) {
      throw new Error("Invalid response");
    }
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getCandidateDashboardAnalytics(): Promise<CandidateDashboardAnalytics> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.ANALYTICS_ME);
    const data = res.data?.data as CandidateDashboardAnalytics | undefined;
    if (
      !data ||
      !Array.isArray(data.applicationsByStatus) ||
      !Array.isArray(data.applicationsByDay)
    ) {
      throw new Error("Invalid response");
    }
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function listMyApplications(): Promise<ApplicationListItem[]> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.ME);
    const applications = (
      res.data?.data as { applications?: ApplicationListItem[] } | undefined
    )?.applications;
    if (!Array.isArray(applications)) throw new Error("Invalid response");
    return applications;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getApplicationDetail(
  applicationId: string,
): Promise<CandidateApplicationDetail> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.BY_ID(applicationId));
    const data = res.data?.data as CandidateApplicationDetail | undefined;
    if (!data || data.view !== "candidate") throw new Error("Not found");
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function listOrgApplications(params: {
  page?: number;
  limit?: number;
  jobId?: string;
  status?: string;
}): Promise<OrgApplicationsListResponse> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.LIST_ORG, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.jobId ? { jobId: params.jobId } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    const data = res.data?.data as OrgApplicationsListResponse | undefined;
    if (!data || !Array.isArray(data.applications)) {
      throw new Error("Invalid response");
    }
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getRecruiterApplicationDetail(
  applicationId: string,
): Promise<RecruiterApplicationDetail> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.BY_ID(applicationId));
    const data = res.data?.data as RecruiterApplicationDetail | undefined;
    if (!data || data.view !== "recruiter") throw new Error("Not found");
    return data;
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function getQuiz(applicationId: string): Promise<{
  questions: PublicQuizQuestion[];
}> {
  try {
    const res = await api.get(API_ROUTES.APPLICATIONS.QUIZ(applicationId));
    const quiz = (
      res.data?.data as { quiz?: { questions: PublicQuizQuestion[] } }
    )?.quiz;
    if (!quiz?.questions) throw new Error("Invalid quiz response");
    return { questions: quiz.questions };
  } catch (e) {
    throw new Error(handleError(e));
  }
}

export async function submitQuiz(
  applicationId: string,
  answers: { questionId: string; answer: string }[],
): Promise<{ application: ApplicationRun }> {
  try {
    const res = await api.post(API_ROUTES.APPLICATIONS.QUIZ(applicationId), {
      answers,
    });
    const data = res.data?.data as { application?: ApplicationRun };
    if (!data?.application) throw new Error("Invalid response");
    return { application: data.application };
  } catch (e) {
    throw new Error(handleError(e));
  }
}
