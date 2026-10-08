import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_APPLICATION_STATUS_CONFIG,
  useCandidateDashboardViewModel,
} from "./useCandidateDashboardViewModel";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useCandidateDashboardQuery: vi.fn(),
  useCandidateStatisticsQuery: vi.fn(),
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/modules/candidate/hooks/useCandidateQueries", () => ({
  useCandidateDashboardQuery: mocks.useCandidateDashboardQuery,
  useCandidateStatisticsQuery: mocks.useCandidateStatisticsQuery,
}));

describe("useCandidateDashboardViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ user: { firstName: "Jane" } });
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: { applications: [] },
      isLoading: false,
    });
    mocks.useCandidateStatisticsQuery.mockReturnValue({
      data: { statistics: {} },
    });
  });

  it("maps dashboard and statistics data into render-ready values", () => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-1",
            job: { id: "job-1", title: "Product Designer" },
            stage: "interview",
            pipeline: ["applied", "screening", "interview", "offer_accepted"],
            statusMessage: "Interview scheduled.",
          },
        ],
      },
      isLoading: false,
    });
    mocks.useCandidateStatisticsQuery.mockReturnValue({
      data: {
        statistics: {
          totalApplications: 3,
          successfulApplications: 1,
          inProgressApplications: 2,
        },
      },
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(mocks.useCandidateDashboardQuery).toHaveBeenCalledWith(true);
    expect(mocks.useCandidateStatisticsQuery).toHaveBeenCalledWith(true);
    expect(result.current.firstName).toBe("Jane");
    expect(result.current.isNewUser).toBe(false);
    expect(result.current.statistics).toEqual({
      totalApplications: 3,
      successfulApplications: 1,
      inProgressApplications: 2,
    });
    expect(result.current.applications[0]).toMatchObject({
      id: "app-1",
      jobId: "job-1",
      title: "Product Designer",
      status: "interview",
      fillPercent: 58,
      message: "Interview scheduled.",
      offerAccepted: false,
    });
    expect(result.current.applications[0].pipelineStages).toEqual([
      { key: "APPLIED", label: "Applied", isActive: false },
      { key: "SCREENING", label: "Screening", isActive: false },
      { key: "ASSESSMENT", label: "Assessment", isActive: false },
      { key: "INTERVIEW", label: "Interview", isActive: true },
      { key: "SHORTLISTED", label: "Shortlisted", isActive: false },
      { key: "OFFER", label: "Offer", isActive: false },
    ]);
  });

  it("keeps the full pipeline when the API returns only the current stage", () => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-3",
            job: { id: "job-3", title: "UI/UX Designer" },
            stage: "INBOUND",
            pipeline: ["INBOUND"],
            statusMessage: "Your application has been submitted.",
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current.applications[0]).toMatchObject({
      status: "applied",
      fillPercent: 8,
    });
    expect(result.current.applications[0].pipelineStages).toEqual([
      { key: "APPLIED", label: "Applied", isActive: true },
      { key: "SCREENING", label: "Screening", isActive: false },
      { key: "ASSESSMENT", label: "Assessment", isActive: false },
      { key: "INTERVIEW", label: "Interview", isActive: false },
      { key: "SHORTLISTED", label: "Shortlisted", isActive: false },
      { key: "OFFER", label: "Offer", isActive: false },
    ]);
  });

  it("preserves new-user detection and empty statistic fallbacks", () => {
    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current).toMatchObject({
      firstName: "Jane",
      isLoading: false,
      isNewUser: true,
      applications: [],
      statistics: {
        totalApplications: 0,
        successfulApplications: 0,
        inProgressApplications: 0,
      },
    });
  });

  it("marks closed stages as complete", () => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-2",
            job: { id: "job-2", title: "Engineer" },
            stage: "offer_declined",
            pipeline: ["applied", "offer_declined"],
            statusMessage: "Closed.",
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current.applications[0].status).toBe("offer_declined");
    expect(result.current.applications[0].fillPercent).toBe(100);
    expect(DASHBOARD_APPLICATION_STATUS_CONFIG.offer_declined.label).toBe("Closed");
  });

  it("maps backend REJECT stage to a closed rejected status", () => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-3",
            job: { id: "job-3", title: "Application Developer" },
            stage: "REJECT",
            pipeline: [],
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current.applications[0].status).toBe("rejected");
    expect(result.current.applications[0].fillPercent).toBe(100);
    expect(DASHBOARD_APPLICATION_STATUS_CONFIG.rejected.label).toBe("Closed");
  });
});