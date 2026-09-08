import { beforeEach, describe, expect, it, vi } from "vitest";
import { jobsApi } from "./jobsApi";
import { mandateApi } from "./mandateApi";
import { industryApi } from "./industryApi";
import { recruiterCandidatesApi } from "./recruiterCandidatesApi";

const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());
const mockPut = vi.hoisted(() => vi.fn());
const mockPatch = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axios", () => ({
  apiClient: { get: mockGet, post: mockPost, put: mockPut, patch: mockPatch, delete: mockDelete },
  mandateApiClient: { get: mockGet, post: mockPost, put: mockPut, patch: mockPatch, delete: mockDelete },
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
      `/jobs/${summary.jobProfileId}`,
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

    expect(mockGet).toHaveBeenCalledWith("/recruiter/dashboard");
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
          applicationId: "00000007-0000-4000-8000-000000000001",
          candidateId: "00000004-0000-4000-8000-000000000001",
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

    expect(mockGet).toHaveBeenCalledWith("/candidates", {
      params: { page: 0, size: 100, search: undefined, locationText: undefined },
    });
    expect(result.data.candidates[0]).toMatchObject({
      fullName: "Ayanda Maseko",
      currentTitle: "Software Engineer",
      currentCompany: "Standard Bank",
    });
  });
});