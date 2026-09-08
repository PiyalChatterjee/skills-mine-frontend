import { mandateApiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import type {
  Job,
  JobsResponse,
  SuccessEnvelope,
} from "@/types";

type JobProfileSummary = {
  jobProfileId: string;
  jobReferenceNumber: string;
  client: { clientId: string; clientName: string; clientRate?: number | null };
  positionTitle: string;
  industry: { industryId: string; industryName: string; normalizedKey?: string } | null;
  locationText: string;
  employmentType: string | null;
  jobDescriptionSnippet: string | null;
  fillByDate: string;
  status: string;
  publishedAt: string | null;
};

type JobProfilePage = {
  data: JobProfileSummary[];
  total: number;
  page: number;
  size: number;
};

type JobProfileSkill = {
  originalText: string | null;
};

type JobProfileDetail = JobProfileSummary & {
  workType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobDescription: string | null;
  requirements: string[];
  responsibilities: string[];
  skills: JobProfileSkill[];
  applicantCount: number | null;
};

const toJob = (job: JobProfileSummary): Job => ({
  jobId: job.jobProfileId,
  jobProfileId: job.jobProfileId,
  title: job.positionTitle,
  company: job.client?.clientName ?? "",
  location: job.locationText,
  industry: job.industry?.industryName ?? "",
  employmentType: formatEnumLabel(job.employmentType),
  workType: "",
  salaryRange: "",
  description: job.jobDescriptionSnippet ?? "",
  responsibilities: [],
  status: job.status,
  applicationCount: 0,
  postedDate: job.publishedAt ?? "",
});

const toJobsResponse = (payload: JobProfilePage): JobsResponse => {
  return {
    jobs: payload.data.map(toJob),
    total: payload.total,
    page: payload.page,
    pageSize: payload.size,
  };
};

export const jobsApi = {
  // Dashboard/candidate feed listing (Mandate_Service_v3: GET /view/jobs).
  async list(
    q?: string,
    page = 1,
    limit = 10,
    status: string = "POSTED",
  ): Promise<JobsResponse> {
    const response = await mandateApiClient.get<JobProfilePage>(apiEndpoints.jobs.list, {
      params: {
        status,
        ...(q ? { [apiEndpoints.jobs.listQueryParam]: q } : {}),
        [apiEndpoints.jobs.listPageParam]: Math.max(0, page - 1),
        [apiEndpoints.jobs.listLimitParam]: limit,
      },
    });

    return toJobsResponse(response.data);
  },

  getById(jobId: string): Promise<SuccessEnvelope<Job>> {
    return this.getJobProfile(jobId).then((data) => ({
      success: true,
      statusCode: 200,
      message: "Job retrieved.",
      data,
    }));
  },

  // Full job profile detail (Mandate_Service_v2 job-service) — called when a
  // candidate opens a job to view, instead of relying on the list-cached data.
  async getJobProfile(jobProfileId: string): Promise<Job> {
    const response = await mandateApiClient.get<JobProfileDetail>(
      resolveEndpoint(apiEndpoints.jobs.profileDetails, { jobProfileId }),
    );
    const data = response.data;
    return {
      jobId: data.jobReferenceNumber ?? jobProfileId,
      jobProfileId: data.jobProfileId ?? jobProfileId,
      title: data.positionTitle ?? "",
      company: data.client?.clientName ?? "",
      location: data.locationText ?? "",
      industry: data.industry?.industryName ?? "",
      employmentType: formatEnumLabel(data.employmentType),
      workType: formatEnumLabel(data.workType),
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
      salaryRange:
        data.salaryMin && data.salaryMax
          ? `R${Number(data.salaryMin).toLocaleString()} – R${Number(data.salaryMax).toLocaleString()}`
          : "",
      description: data.jobDescription ?? "",
      requirements: data.requirements ?? [],
      responsibilities: data.responsibilities ?? [],
      skills: (data.skills ?? [])
        .map((skill) => skill.originalText)
        .filter((skill): skill is string => Boolean(skill)),
      status: data.status ?? "",
      applicationCount: data.applicantCount ?? 0,
      postedDate: data.publishedAt ?? "",
      recruiterId: undefined,
    };
  },

};
