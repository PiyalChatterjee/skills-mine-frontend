import { externalJobsApiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";

export type AdzunaPrefill = {
  job_title?: string;
  job_description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  contract_type?: string;
  contract_time?: string;
  skills?: string[];
  company_name?: string;
  company_description?: string;
  benefits?: string;
  job_type?: string;
  experience_level?: string;
  education_level?: string;
  remote_work?: boolean;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  reference_number?: string;
};

export type AdzunaPrefillResponse = {
  job_profile_id: string;
  missing_fields: string[];
  warnings: string[];
  prefill: AdzunaPrefill;
};

export type PublishAdzunaJobRequest = AdzunaPrefill & {
  job_title: string;
  job_description: string;
  location: string;
  company_name: string;
  contact_email: string;
  job_profile_id_ref: string;
  response_handler_url?: string;
  expiry_date?: string;
  job_id?: string;
};

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

export type AdzunaJobPublishRecord = {
  job_id: string;
  job_title: string;
  location: string;
  company_name: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  contract_time?: string;
  status: string;
  job_url?: string;
  created_date?: string;
  expiry_date?: string;
  reference_number?: string;
  job_description?: string;
};

export type AdzunaPublishesParams = {
  publish_id?: string;
  job_profile_id_ref?: string;
  adzuna_job_id?: string;
};

export type UpdateAdzunaJobRequest = Partial<PublishAdzunaJobRequest>;

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
      externalJobsApiClient.post<unknown>(
        apiEndpoints.externalJobs.adzunaPublish,
        body,
        { timeout: ADZUNA_TIMEOUT_MS },
      ),
    );
  },

  /**
   * Get Adzuna jobs as JSON (converts XML to JSON)
   */
  getAdzunaJobsAsJson() {
    return unwrapResponseData(
      externalJobsApiClient.get<AdzunaJobPublishRecord[]>(
        apiEndpoints.externalJobs.adzunaPublishes,
      ),
    );
  },

  /**
   * Update an existing job on Adzuna
   */
  updateAdzunaJob(jobId: string, body: UpdateAdzunaJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.put<unknown>(
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
      externalJobsApiClient.delete<unknown>(
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
