import { apiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  ApplyJobRequest,
  ApplyJobResponse,
  Job,
  JobsListData,
  JobsResponse,
  SaveJobResponse,
  SuccessEnvelope,
} from "@/types";

const toJobsResponse = (
  payload: SuccessEnvelope<JobsListData> | JobsListData | Job[],
): JobsResponse => {
  const data = "data" in payload ? payload.data : payload;

  if (Array.isArray(data)) {
    return {
      jobs: data,
      total: data.length,
      page: 1,
      pageSize: data.length,
    };
  }

  return {
    jobs: data.jobs,
    total: data.pagination.total,
    page: data.pagination.page,
    pageSize: data.pagination.pageSize,
  };
};

export const jobsApi = {
  async list(
    q?: string,
    page = 1,
    limit = 10,
    status: string = "POSTED",
  ): Promise<JobsResponse> {
    const response = await apiClient.get<
      SuccessEnvelope<JobsListData> | JobsListData | Job[]
    >(apiEndpoints.jobs.list, {
      params: {
        status,
        ...(q ? { [apiEndpoints.jobs.listQueryParam]: q } : {}),
        [apiEndpoints.jobs.listPageParam]: page,
        [apiEndpoints.jobs.listLimitParam]: limit,
      },
    });

    return toJobsResponse(response.data);
  },

  getById(jobId: string): Promise<SuccessEnvelope<Job>> {
    return apiClient
      .get(resolveEndpoint(apiEndpoints.jobs.details, { jobId }))
      .then((response) => response.data);
  },

  // Full job profile detail (Mandate_Service_v2 job-service) — called when a
  // candidate opens a job to view, instead of relying on the list-cached data.
  async getJobProfile(jobProfileId: string): Promise<Job> {
    const response = await apiClient.get(
      resolveEndpoint(apiEndpoints.jobs.profileDetails, { jobProfileId }),
    );
    const data = response.data as Record<string, any>;
    return {
      jobId: data.jobReferenceNumber ?? jobProfileId,
      jobProfileId: data.jobProfileId ?? jobProfileId,
      title: data.positionTitle ?? "",
      company: data.client?.clientName ?? "",
      location: data.locationText ?? "",
      industry: data.industry?.industryName ?? "",
      employmentType: data.employmentType ?? "",
      workType: data.workType ?? "",
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
      salaryRange:
        data.salaryMin && data.salaryMax
          ? `R${Number(data.salaryMin).toLocaleString()} – R${Number(data.salaryMax).toLocaleString()}`
          : "",
      description: data.jobDescription ?? "",
      requirements: data.requirements ?? [],
      responsibilities: data.responsibilities ?? [],
      skills: (data.skills ?? []).map((s: Record<string, any>) => s.originalText).filter(Boolean),
      status: data.status ?? "",
      applicationCount: data.applicantCount ?? 0,
      postedDate: data.publishedAt ?? "",
      recruiterId: undefined,
    };
  },

  save(jobId: string): Promise<SaveJobResponse> {
    return apiClient
      .post(resolveEndpoint(apiEndpoints.jobs.save, { jobId }))
      .then((response) => response.data);
  },

  remove(jobId: string): Promise<SaveJobResponse> {
    return apiClient
      .delete(resolveEndpoint(apiEndpoints.jobs.save, { jobId }))
      .then((response) => response.data);
  },

  apply(jobId: string, payload: ApplyJobRequest): Promise<ApplyJobResponse> {
    return apiClient
      .post(resolveEndpoint(apiEndpoints.jobs.apply, { jobId }), payload)
      .then((response) => response.data);
  },

  create(payload: Partial<Job>): Promise<SuccessEnvelope<Job>> {
    return apiClient
      .post(apiEndpoints.jobs.list, payload)
      .then((response) => response.data);
  },
};
