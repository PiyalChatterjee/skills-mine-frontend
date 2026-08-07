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
    status: "Open" | "Closed" | "Draft" = "Open",
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

  save(jobId: string): Promise<SaveJobResponse> {
    return apiClient
      .post(resolveEndpoint(apiEndpoints.jobs.save, { jobId }))
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
