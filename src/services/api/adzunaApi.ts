import { externalJobsApiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";

export type AdzunaJobLocation = {
  city?: string;
  state?: string;
  country: string;
};

export type AdzunaPrefill = {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  location?: AdzunaJobLocation;
  country?: string;
  remote?: number;
  company?: string;
  category?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_frequency?: "hour" | "day" | "month" | "year";
  contract_type?: "permanent" | "contract";
  contract_time?: "full_time" | "part_time";
  date?: string;
  job_profile_id_ref?: string;
};

export type AdzunaPrefillResponse = {
  job_profile_id: string;
  missing_fields: string[];
  warnings: string[];
  prefill: AdzunaPrefill;
};

export type PublishAdzunaJobRequest = Omit<
  AdzunaPrefill,
  "id" | "title" | "description" | "url" | "location" | "country"
> & {
  id: string;
  title: string;
  description: string;
  url: string;
  location: AdzunaJobLocation;
  country: string;
};

export type AdzunaPublishResult = {
  job_id: string;
  message: string;
  status: string;
};

export type AdzunaUpdateResult = AdzunaPublishResult;
export type AdzunaDeleteResult = AdzunaPublishResult;

export type AdzunaPublishRecord = {
  publish_id: string;
  job_profile_id_ref: string;
  adzuna_job_id?: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  status: "PENDING" | "PUBLISHED" | "FAILED" | "CANCELLED";
  job_title: string;
  job_description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  contract_type?: string;
  contract_time?: string;
  skills?: string[];
  company_name: string;
  company_description?: string;
  benefits?: string;
  job_type?: string;
  experience_level?: string;
  education_level?: string;
  remote_work?: boolean;
  contact_name?: string;
  contact_email: string;
  contact_phone?: string;
  reference_number?: string;
  job_url?: string;
  error_detail?: string | null;
  provider_message?: string | null;
  published_by_user_id?: string;
  created_at: string;
  completed_at?: string | null;
};

export type AdzunaJobJsonRecord = {
  publish_id: string;
  job_id: string;
  is_active: boolean;
  job_data: Omit<AdzunaPrefill, "remote"> & { remote?: number | string };
  created_at: string;
  updated_at: string;
};

export type AdzunaPublishesParams = {
  publish_id?: string;
  job_profile_id_ref?: string;
  adzuna_job_id?: string;
};

export type UpdateAdzunaJobRequest = PublishAdzunaJobRequest;

// Adzuna API calls can be slower due to external service integration
const ADZUNA_TIMEOUT_MS = 30000;

export const adzunaApi = {
  /**
   * Get prefilled Adzuna publish request data for a job profile
   */
  getAdzunaPrefill(jobProfileId: string) {
    return unwrapResponseData(
      externalJobsApiClient.get<AdzunaPrefillResponse>(
        apiEndpoints.externalJobs.adzunaPrefill,
        { params: { job_profile_id: jobProfileId } },
      ),
    );
  },

  /**
   * Publish a job to Adzuna
   */
  publishToAdzuna(body: PublishAdzunaJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.post<AdzunaPublishResult>(
        apiEndpoints.externalJobs.adzunaPublish,
        body,
        { timeout: ADZUNA_TIMEOUT_MS },
      ),
    );
  },

  /**
   * Get Adzuna jobs as JSON (converts XML to JSON)
   */
  getAdzunaJobsAsJson(jobId?: string) {
    return unwrapResponseData(
      externalJobsApiClient.get<AdzunaJobJsonRecord[]>(
        apiEndpoints.externalJobs.adzunaPublishes,
        jobId ? { params: { job_id: jobId } } : undefined,
      ),
    );
  },

  async getAdzunaEditData(jobId: string): Promise<AdzunaPrefillResponse> {
    const records = await adzunaApi.getAdzunaJobsAsJson(jobId);
    const record = records.find((item) => item.job_id === jobId);
    if (!record?.job_data) {
      throw new Error("The published Adzuna advert could not be found.");
    }
    const { remote, ...jobData } = record.job_data;
    if (remote != null && remote !== 0 && remote !== 1 && remote !== "0" && remote !== "1") {
      throw new Error("The published Adzuna advert has an unsupported remote work value.");
    }
    return {
      job_profile_id: record.job_data.job_profile_id_ref ?? jobId,
      prefill: {
        ...jobData,
        ...(remote != null ? { remote: Number(remote) } : {}),
      },
      missing_fields: [],
      warnings: [],
    };
  },

  /**
   * Update an existing job on Adzuna
   */
  updateAdzunaJob(jobId: string, body: UpdateAdzunaJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.put<AdzunaUpdateResult>(
        resolveEndpoint(apiEndpoints.externalJobs.adzunaJobUpdate, { jobId }),
        body,
        { timeout: ADZUNA_TIMEOUT_MS },
      ),
    );
  },

  /**
   * Delete (deactivate) a job on Adzuna
   */
  deleteAdzunaJob(jobId: string) {
    return unwrapResponseData(
      externalJobsApiClient.delete<AdzunaDeleteResult>(
        resolveEndpoint(apiEndpoints.externalJobs.adzunaJobDelete, { jobId }),
      ),
    );
  },

  /**
   * List Adzuna publish records (XML Feed)
   */
  listAdzunaPublishes(params?: AdzunaPublishesParams) {
    return unwrapResponseData(
      externalJobsApiClient.get<AdzunaPublishRecord[]>(
        apiEndpoints.externalJobs.adzunaJobPublishes,
        { params },
      ),
    );
  },
};
