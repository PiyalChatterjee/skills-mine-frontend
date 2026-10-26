import { beforeEach, describe, expect, it, vi } from "vitest";
import { jobsApi } from "./jobsApi";
import { mandateApi } from "./mandateApi";
import { industryApi } from "./industryApi";
import { recruiterCandidatesApi } from "./recruiterCandidatesApi";
import { JobPostStatus, PipelineStageCode } from "@/enums/statuses";

const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());
const mockPut = vi.hoisted(() => vi.fn());
const mockPatch = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axios", () => ({
  apiClient: { get: mockGet, post: mockPost, put: mockPut, patch: mockPatch, delete: mockDelete },
  mandateApiClient: { get: mockGet, post: mockPost, put: mockPut, patch: mockPatch, delete: mockDelete },
  pipelineApiClient: { get: mockGet, post: mockPost, put: mockPut, patch: mockPatch, delete: mockDelete },
}));

const summary = {
  jobProfileId: "00000003-0000-4000-8000-000000000001",
  jobReferenceNumber: "JOB-2026-0001",
  client: {
    clientId: "00000002-0000-4000-8000-000000000001",
    clientName: "Standard Bank",
    contactName: "Ayanda Maseko",
    contactEmail: "ayanda@example.com",
    contactPhoneNumber: "+27821234567",
  },
  positionTitle: "Senior Software Engineer",
  industry: {
    industryId: "00000001-0000-4000-8000-000000000001",
    industryName: "Technology",
    normalizedKey: "technology",
  },
  locationText: "Johannesburg, Gauteng",
  employmentType: "FULL_TIME",
  jobDescriptionSnippet: "Build reliable services.",
  fillByDate: "2027-01-15",
  status: "POSTED",
  publishedAt: "2026-08-20T09:00:00.000Z",
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-20T09:00:00.000Z",
};

describe("Mandate Service v2 frontend adapters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the first v2 jobs page with search and size parameters", async () => {
    mockGet.mockResolvedValue({ data: { data: [summary], total: 1, page: 0, size: 6 } });

    const result = await jobsApi.list("software", 1, 6, "POSTED");

    expect(mockGet).toHaveBeenCalledWith("/view/jobs", {
      params: { status: "POSTED", search: "software", page: 0, size: 6 },
      paramsSerializer: { indexes: null },
    });

    expect(result).toMatchObject({ total: 1, page: 0, pageSize: 6 });
    expect(result.jobs[0]).toMatchObject({
      jobId: summary.jobProfileId,
      title: "Senior Software Engineer",
      company: "Standard Bank",
      industry: "Technology",
      employmentType: "Full Time",
    });
  });

  it("closes a job with the shared enum while preserving the API payload", async () => {
    mockPatch.mockResolvedValue({ data: { ...summary, status: "CLOSED" } });

    const result = await mandateApi.updateJobStatus(summary.jobProfileId, JobPostStatus.CLOSED);

    expect(mockPatch).toHaveBeenCalledExactlyOnceWith(
      `/jobs/${summary.jobProfileId}`, { status: "CLOSED" },
    );
    expect(result.data).toEqual({ mandateId: summary.jobProfileId, status: "CLOSED" });
  });

  it("preserves unknown job statuses from backend responses", async () => {
    mockGet.mockResolvedValue({ data: { data: [{ ...summary, status: "FUTURE_STATUS" }], total: 1, page: 0, size: 10 } });

    const result = await jobsApi.list();

    expect(result.jobs[0].status).toBe("FUTURE_STATUS");
  });

  it("sends rejection codes unchanged through the pipeline service", async () => {
    mockPut.mockResolvedValue({ data: { targetStage: "OFFER_REJECT", succeeded: [], failed: [] } });

    await mandateApi.advanceJobStage(summary.jobProfileId, {
      applicationId: ["app-1"], toStageCode: PipelineStageCode.OFFER_REJECT,
    });

    expect(mockPut).toHaveBeenCalledExactlyOnceWith(
      `/pipelines/jobs/${summary.jobProfileId}/stage`,
      { applicationId: ["app-1"], toStageCode: "OFFER_REJECT" },
    );
  });

  it("sends global job-search filters using backend industry ids", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: [{ industryId: "industry-1", industryName: "Technology" }],
      })
      .mockResolvedValueOnce({ data: { data: [summary], total: 1, page: 0, size: 20 } });

    await jobsApi.list("developer", 1, 20, "POSTED", {
      industries: ["Technology"],
      locations: ["Cape Town", "Remote"],
      datePosted: "LAST_7_DAYS",
      jobTypes: ["FULL_TIME", "CONTRACT"],
    });

    expect(mockGet).toHaveBeenNthCalledWith(2, "/view/jobs", {
      params: {
        status: "POSTED",
        search: "developer",
        industryId: ["industry-1"],
        locationText: ["Cape Town", "Remote"],
        datePosted: "LAST_7_DAYS",
        jobType: ["FULL_TIME", "CONTRACT"],
        page: 0,
        size: 20,
      },
      paramsSerializer: { indexes: null },
    });
  });

  it("maps a typed v2 job profile detail into the candidate job contract", async () => {
    mockGet.mockResolvedValue({
      data: {
        ...summary,
        workType: "REMOTE",
        salaryMin: 28000,
        salaryMax: 46000,
        jobDescription: "Build reliable services.",
        requirements: ["Relevant tertiary qualification"],
        responsibilities: ["Own delivery outcomes"],
        skills: [
          { originalText: "TypeScript" },
          { originalText: null },
        ],
        applicantCount: 4,
      },
    });

    const result = await jobsApi.getJobProfile(summary.jobProfileId);

    expect(mockGet).toHaveBeenCalledWith(
      `/view/jobs/${summary.jobProfileId}`,
    );
    expect(result).toMatchObject({
      jobId: summary.jobReferenceNumber,
      jobProfileId: summary.jobProfileId,
      title: summary.positionTitle,
      workType: "Remote",
      salaryRange: "R28,000 – R46,000",
      skills: ["TypeScript"],
      applicationCount: 4,
    });
  });

  it("maps recruiter dashboard data into existing recruiter pipeline cards", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "Recruiter dashboard retrieved.",
        data: {
          weeklyTodo: [],
          pipeline: [{ stage: "Inbound", count: 4 }],
        },
      },
    });

    const result = await mandateApi.getRecruiterDashboard();

    expect(mockGet).toHaveBeenCalledWith(
      "https://13-245-120-61.nip.io/recruiter/dashboard",
    );
    expect(result.data.pipeline).toEqual([{ stage: "Inbound", count: 4 }]);
  });

  it("maps v2 job summaries into recruiter job posts", async () => {
    mockGet.mockResolvedValue({ data: { data: [summary], total: 1, page: 0, size: 100 } });

    const result = await mandateApi.getJobPosts();

    expect(mockGet).toHaveBeenCalledWith("/view/jobs", {
      params: { search: undefined, status: undefined, page: 0, size: 100 },
    });
    expect(result.data[0]).toMatchObject({
      mandateId: summary.jobProfileId,
      title: summary.positionTitle,
      client: summary.client.clientName,
      targetCloseDate: summary.fillByDate,
    });
  });

  it("uses bare industry and company responses", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: [{ industryId: summary.industry.industryId, industryName: "Technology" }],
      })
      .mockResolvedValueOnce({
        data: { data: [summary.client], total: 1, page: 0, size: 100 },
      });

    const industries = await industryApi.getIndustries();
    const companies = await mandateApi.getCompanies();

    expect(industries.data).toEqual([
      { industryId: summary.industry.industryId, name: "Technology" },
    ]);
    expect(companies).toEqual([summary.client]);
  });

  it("maps CandidatePage rows into the existing candidates screen model", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [{
          applicantType: "CANDIDATE",
          source: "APPLIED",
          applicationId: "00000007-0000-4000-8000-000000000001",
          applicantId: "00000004-0000-4000-8000-000000000001",
          firstName: "Ayanda",
          lastName: "Maseko",
          fullName: "Ayanda Maseko",
          title: "Software Engineer",
          companyName: "Standard Bank",
          locationText: "Johannesburg, Gauteng",
          matchPercentage: 82,
          status: "ACTIVE",
          jobProfileId: summary.jobProfileId,
        }],
        total: 1,
        page: 0,
        size: 100,
      },
    });

    const result = await recruiterCandidatesApi.listCandidates();

    expect(mockGet).toHaveBeenCalledWith("/applicants", {
      params: { page: 0, size: 100, search: undefined, locationText: undefined },
    });
    expect(result.data.candidates[0]).toMatchObject({
      fullName: "Ayanda Maseko",
      currentTitle: "Software Engineer",
      currentCompany: "Standard Bank",
    });
  });
});