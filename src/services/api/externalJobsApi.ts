import { externalJobsApiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";

export type ExternalJobProvider = {
  provider_id: string;
  provider_code: string;
  display_name: string;
  base_url: string;
  is_enabled: boolean;
  last_sync_at: string | null;
  created_at: string;
};

export type BizCommunityPrefill = {
  job_title?: string;
  job_description?: string;
  city_name?: string;
  country_id?: number;
  area_id?: number;
  remote_work?: number;
  industry_id?: number;
  skills_required?: string;
  skills_advantageous?: string;
  personal_skills?: string;
  benefits?: string;
  travel_requirement?: number;
  remuneration_minimum?: number;
  remuneration_maximum?: number;
  remuneration_currency?: number;
  remuneration_package?: number;
  remuneration_basis?: number;
  seniority_level?: number;
  education_level?: number;
  employment_equity_policy?: number;
  is_permanent?: boolean;
  contact_name?: string;
  contact_telephone_number?: string;
  reference_number?: string;
  admin_email_address?: string;
  admin_first_name?: string;
  admin_last_name?: string;
};

export type BizCommunityPrefillResponse = {
  job_profile_id: string;
  missing_fields: string[];
  warnings: string[];
  prefill: BizCommunityPrefill;
};

export type PublishBizCommunityJobRequest = BizCommunityPrefill & {
  job_title: string;
  job_description: string;
  city_name: string;
  admin_email_address: string;
  admin_first_name: string;
  admin_last_name: string;
  response_handler_url: string;
  country_id: number;
  job_profile_id_ref: string;
  area_id?: number;
  remuneration_negotiable?: boolean;
  is_temporary?: boolean;
  is_contract?: boolean;
  own_transport?: boolean;
  company_name?: string;
  company_website?: string;
  company_description?: string;
  expiry_date?: string;
};

export type BizCommunityPublishRecord = {
  publish_id: string;
  job_profile_id_ref: string;
  biz_job_id: string | null;
  operation: string;
  status: string;
  job_title: string;
  job_description: string;
  city_name: string;
  country_id: number;
  area_id?: number;
  industry_id?: number;
  remote_work?: number;
  skills_required?: string;
  skills_advantageous?: string;
  personal_skills?: string;
  travel_requirement?: number;
  remuneration_minimum?: number;
  remuneration_maximum?: number;
  remuneration_currency?: number;
  remuneration_package?: number;
  remuneration_basis?: number;
  remuneration_description?: string;
  remuneration_negotiable?: boolean;
  own_transport?: boolean;
  benefits?: string;
  is_permanent?: boolean;
  is_temporary?: boolean;
  is_contract?: boolean;
  contract_period?: string;
  seniority_level?: number;
  education_level?: number;
  employment_equity_policy?: number;
  reference_number?: string;
  company_name?: string;
  company_website?: string;
  company_description?: string;
  contact_name?: string;
  contact_telephone_number?: string;
  response_handler_url?: string;
  expiry_date?: string;
  is_test_job?: boolean;
  job_url?: string;
  admin_email_address?: string;
  admin_first_name?: string;
  admin_last_name?: string;
  provider_message?: string;
  error_detail?: string;
  published_by_user_id?: string;
  created_at: string;
  completed_at?: string | null;
};

export type BizCommunityPublishesParams = {
  publish_id?: string;
  job_profile_id_ref?: string;
  biz_job_id?: string;
};

export type BizCommunityListedJob = {
  job_id: number | string;
  job_title: string;
  status: string;
  reference_number?: string;
  created_datetime?: string;
  expiry_date?: string;
  url?: string;
};

export type UpdateBizCommunityJobRequest = BizCommunityPrefill & {
  job_title: string;
  job_description: string;
  city_name: string;
  admin_email_address: string;
  admin_first_name: string;
  admin_last_name: string;
  response_handler_url: string;
  country_id?: number;
  area_id?: number;
  industry_id?: number;
  category_id?: number;
  expiry_date?: string;
  remuneration_negotiable?: boolean;
  is_temporary?: boolean;
  is_contract?: boolean;
  own_transport?: boolean;
  company_name?: string;
  company_website?: string;
  company_description?: string;
  job_profile_id_ref?: string;
};

export type PnetFieldOption = {
  id: number;
  name: string;
};

export type PnetFieldKey =
  | "workfield"
  | "geography"
  | "sector"
  | "contracttype"
  | "worktype"
  | "experience"
  | "situation";

export type PnetFields = Partial<Record<PnetFieldKey, PnetFieldOption[]>>;

export type PnetPrefill = {
  reference_id?: string;
  job_profile_id_ref?: string;
  action?: string;
  channel?: string;
  listingtype?: string;
  // PNet option ids per dropdown; 0 means "not set".
  idFields?: Partial<Record<PnetFieldKey, number>>;
  categorization?: PnetCategorization;
  jobdetails?: {
    language?: string;
    jobtitle?: string;
    introduction?: string;
    tasks?: string;
    profile?: string;
    offer?: string;
    keywords?: string;
    joblocations?: { countrycode?: string; city?: string }[];
    apply?: { url?: string; email?: string };
    salary?: {
      minimum?: number;
      maximum?: number;
      currency?: string;
      period?: string;
    };
  };
  companydetails?: {
    companyname?: string;
    recruiter?: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: string;
    };
  };
};

export type PnetPrefillResponse = {
  job_profile_id: string;
  missing_fields: string[];
  warnings: string[];
  prefill: PnetPrefill;
  pnetFields?: PnetFields;
};

export type PnetCategorization = {
  experience?: string[];
  contracttype?: string[];
  contractime?: string[];
  workpolicy?: string[];
};

export type PnetAction = "INSERT" | "UPDATE" | "OFFLINE";
export type PnetChannel = "ZA" | string;
export type PnetLanguage = "EN" | "DE" | string;

export type PnetIdBasedFields = {
  workfield: number;
  geography: number;
  sector: number;
  contracttype: number;
  worktype: number;
  experience: number;
  situation: number;
};

export type PnetJobLocation = {
  countrycode: string;
  city: string;
};

export type PnetApply = {
  url?: string;
  email?: string;
};

export type PnetSalary = {
  minimum?: number;
  maximum?: number;
  currency?: string;
  period?: string;
};

export type PnetJobDetails = {
  language: string;
  jobtitle: string;
  introduction: string;
  tasks: string;
  profile: string;
  offer?: string;
  keywords?: string;
  contactinfo?: string;
  joblocations: PnetJobLocation[];
  apply: PnetApply;
  salary?: PnetSalary;
};

export type PnetLayoutDetails = {
  images?: Record<string, unknown>;
  video?: unknown[];
};

export type PnetRecruiter = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
};

export type PnetCompanyDetails = {
  companyname?: string;
  recruiter?: PnetRecruiter;
};

export type PublishPnetJobRequest = {
  reference_id: string;
  action: PnetAction;
  channel: PnetChannel;
  idFields: PnetIdBasedFields;
  listingtype?: string;
  categorization?: PnetCategorization;
  jobdetails: PnetJobDetails;
  layoutdetails?: PnetLayoutDetails;
  companydetails?: PnetCompanyDetails;
  job_profile_id_ref: string;
  sender_id?: string;
  organisation_id?: string;
};

export type PnetPublishPayload = {
  action?: string;
  channel?: string;
  listingtype?: string;
  idFields?: PnetIdBasedFields;
  jobdetails?: PnetJobDetails & {
    jobtitle?: string;
    salary?: PnetSalary;
    joblocations?: PnetJobLocation[];
    apply?: PnetApply;
  };
  categorization?: PnetCategorization;
  companydetails?: PnetCompanyDetails;
  reference_id?: string;
  job_profile_id_ref?: string;
  [key: string]: unknown;
};

export type PnetPublishRecord = {
  publish_id: string;
  job_profile_id_ref?: string;
  reference_id?: string;
  reference_number?: string;
  listingid?: number | string | null;
  listing_id?: number | string | null;
  action?: string;
  operation?: string;
  status: string;
  payload_json?: PnetPublishPayload | string | null;
  channel?: string;
  listingtype?: string;
  job_title?: string;
  jobtitle?: string;
  city_name?: string;
  city?: string;
  countrycode?: string;
  salary_minimum?: number;
  salary_maximum?: number;
  salary_currency?: string;
  salary_period?: string;
  contract_type?: string;
  work_type?: string;
  experience?: string;
  job_url?: string;
  url?: string;
  error_detail?: string | null;
  provider_message?: string | null;
  published_by_user_id?: string;
  created_at: string;
  completed_at?: string | null;
  jobdetails?: PnetJobDetails;
  categorization?: PnetCategorization;
  companydetails?: PnetCompanyDetails;
  idFields?: PnetIdBasedFields;
  [key: string]: unknown;
};

export type PnetPublishesParams = {
  publish_id?: string;
  job_profile_id_ref?: string;
  listingid?: number;
};

export const HARAMBEE_CONTRACT_TYPES = [
  "Fixedterm",
  "Fulltimepermanent",
  "Permanentparttime",
  "Paidemploymentprogramme",
] as const;

export const HARAMBEE_ROLES = [
  "Administration",
  "Callcentrework",
  "Codingdesigningandwebrelatedwork",
  "Community",
  "Dataandanalytics",
  "Driver",
  "Entrepreneur",
  "FoodPreparation",
  "Hardphysicalwork",
  "HealthcareProfessionals",
  "IRM",
  "ITSupport",
  "LightPhysical",
  "ManufacturingOperatorsAssemblers",
  "Professional",
  "Retail",
  "SalesBasic",
  "SalesComplex",
  "SecurityGuard",
  "Services",
  "Teaching",
  "Teamlead",
  "Other",
] as const;

export type HarambeeContractType = (typeof HARAMBEE_CONTRACT_TYPES)[number];
export type HarambeeRole = (typeof HARAMBEE_ROLES)[number];

export type HarambeeAddress = {
  address_name: string;
  address_line_1: string;
  suburb_name: string;
  city_name: string;
  postal_code: string;
  province: string;
};

// HarambeeAggregatedOpportunityRequest
export type PublishHarambeeJobRequest = {
  job_title: string;
  job_description: string;
  address: HarambeeAddress;
  employment_start_date: string;
  closing_date: string;
  duration: string;
  contract_type: HarambeeContractType;
  salary: string;
  application_url: string;
  reference_number?: string | null;
  archetypal_role: HarambeeRole;
  // Internal SkillsMine job_profile UUID; not sent on to Harambee.
  job_profile_id_ref: string;
};

// Fields that could not be resolved come back as empty strings (see missing_fields).
export type HarambeePrefill = Partial<Omit<PublishHarambeeJobRequest, "address">> & {
  address?: Partial<HarambeeAddress>;
};

export type HarambeePrefillResponse = {
  job_profile_id: string;
  missing_fields: string[];
  warnings: string[];
  prefill: HarambeePrefill;
};

export type HarambeeOperation = "PUBLISH" | "EDIT" | "DELETE";

// One row per opportunity (ext_harambee_publish): the current state, created on the
// first successful publish and overwritten by each later successful edit.
export type HarambeePublishRecord = Partial<PublishHarambeeJobRequest> & {
  publish_id: string;
  harambee_opportunity_id?: string;
  // Last operation applied: PUBLISH = never edited, EDIT = edited, DELETE = removed from SA Youth.
  operation?: HarambeeOperation | string;
  status?: string;
  job_url?: string;
  error_detail?: string | null;
  provider_message?: string | null;
  published_by_user_id?: string;
  created_at: string;
  completed_at?: string | null;
};

export type HarambeePublishesParams = {
  publish_id?: string;
  job_profile_id_ref?: string;
  harambee_opportunity_id?: string;
  operation?: HarambeeOperation;
};

// The BizCommunity webservice call is forwarded as XML and can be slower than
// the default client timeout.
const PUBLISH_TIMEOUT_MS = 30000;

export const externalJobsApi = {
  getProviders() {
    return unwrapResponseData(
      externalJobsApiClient.get<ExternalJobProvider[]>(
        apiEndpoints.externalJobs.providers,
      ),
    );
  },
  publishToBizCommunity(body: PublishBizCommunityJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.post<unknown>(
        apiEndpoints.externalJobs.bizCommunityPublish,
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  publishToHarambee(body: PublishHarambeeJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.post<unknown>(
        apiEndpoints.externalJobs.harambeePublish,
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  getHarambeePrefill(jobProfileId: string) {
    return unwrapResponseData(
      externalJobsApiClient.get<HarambeePrefillResponse>(
        apiEndpoints.externalJobs.harambeePrefill,
        { params: { job_profile_id: jobProfileId } },
      ),
    );
  },
  updateHarambeeJob(
    harambeeOpportunityId: string | number,
    body: PublishHarambeeJobRequest,
  ) {
    return unwrapResponseData(
      externalJobsApiClient.put<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.harambeeJobUpdate, {
          harambeeOpportunityId,
        }),
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  deleteHarambeeJob(harambeeOpportunityId: string | number, reason: string) {
    return unwrapResponseData(
      externalJobsApiClient.delete<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.harambeeJobDelete, {
          harambeeOpportunityId,
        }),
        { params: { reason } },
      ),
    );
  },
  getHarambeePublishes(params?: HarambeePublishesParams) {
    return unwrapResponseData(
      externalJobsApiClient.get<HarambeePublishRecord[]>(
        apiEndpoints.externalJobs.harambeePublishes,
        { params },
      ),
    );
  },
  getBizCommunityPrefill(jobProfileId: string) {
    return unwrapResponseData(
      externalJobsApiClient.get<BizCommunityPrefillResponse>(
        apiEndpoints.externalJobs.bizCommunityPrefill,
        { params: { job_profile_id: jobProfileId } },
      ),
    );
  },
  getPnetPrefill(jobProfileId: string) {
    return unwrapResponseData(
      externalJobsApiClient.get<PnetPrefillResponse>(
        apiEndpoints.externalJobs.pnetPrefill,
        { params: { job_profile_id: jobProfileId } },
      ),
    );
  },
  publishToPnet(body: PublishPnetJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.post<unknown>(
        apiEndpoints.externalJobs.pnetPublish,
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  updatePnetJob(referenceId: string, body: PublishPnetJobRequest) {
    return unwrapResponseData(
      externalJobsApiClient.put<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.pnetJobUpdate, {
          referenceId,
        }),
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  deletePnetJob(referenceId: string) {
    return unwrapResponseData(
      externalJobsApiClient.delete<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.pnetJobDelete, {
          referenceId,
        }),
      ),
    );
  },
  getPnetPublishes(params?: PnetPublishesParams) {
    return unwrapResponseData(
      externalJobsApiClient.get<PnetPublishRecord[]>(
        apiEndpoints.externalJobs.pnetPublishes,
        { params },
      ),
    );
  },
  getBizCommunityPublishes(params?: BizCommunityPublishesParams) {
    return unwrapResponseData(
      externalJobsApiClient.get<BizCommunityPublishRecord[]>(
        apiEndpoints.externalJobs.bizCommunityPublishes,
        { params },
      ),
    );
  },
  getBizCommunityJobs() {
    return unwrapResponseData(
      externalJobsApiClient.get<BizCommunityListedJob[]>(
        apiEndpoints.externalJobs.bizCommunityJobs,
      ),
    );
  },
  updateBizCommunityJob(
    bizJobId: string | number,
    body: UpdateBizCommunityJobRequest,
  ) {
    return unwrapResponseData(
      externalJobsApiClient.put<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.bizCommunityJobUpdate, {
          bizJobId,
        }),
        body,
        { timeout: PUBLISH_TIMEOUT_MS },
      ),
    );
  },
  deleteBizCommunityJob(bizJobId: string | number) {
    return unwrapResponseData(
      externalJobsApiClient.delete<unknown>(
        resolveEndpoint(apiEndpoints.externalJobs.bizCommunityJobDelete, {
          bizJobId,
        }),
      ),
    );
  },
};
