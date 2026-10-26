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
      fillPercent: 75,
      message: "Good news! You have been invited to an interview for this position.",
      offerAccepted: false,
    });
    expect(result.current.applications[0].pipelineStages).toEqual([
      { key: "INBOUND", label: "Applied", isActive: false },
      { key: "SCREENING", label: "Screening", isActive: false },
      { key: "ASSESSMENT", label: "Assessment", isActive: false },
      { key: "SHORTLIST", label: "Shortlisted", isActive: false },
      { key: "INTERVIEW", label: "Interview", isActive: true },
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
      { key: "INBOUND", label: "Applied", isActive: true },
      { key: "SCREENING", label: "Screening", isActive: false },
      { key: "ASSESSMENT", label: "Assessment", isActive: false },
      { key: "SHORTLIST", label: "Shortlisted", isActive: false },
      { key: "INTERVIEW", label: "Interview", isActive: false },
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

  it("maps backend CLOSED stage to an accepted offer", () => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-4",
            job: { id: "job-4", title: "Application Developer" },
            stage: "CLOSED",
            pipeline: [],
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current.applications[0].status).toBe("offer_accepted");
    expect(result.current.applications[0].fillPercent).toBe(100);
  });

  it.each(["REJECT", "OFFER_REJECT"])("maps backend %s stage to a closed rejected status", (stage) => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-3",
            job: { id: "job-3", title: "Application Developer" },
            stage,
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

  it.each([
    ["INBOUND", "applied", "INBOUND", "Applied", 8],
    ["SCREENING", "screening", "SCREENING", "Screening", 25],
    ["ASSESSMENT", "assessment", "ASSESSMENT", "Assessment", 42],
    ["SHORTLIST", "shortlisted", "SHORTLIST", "Shortlisted", 58],
    ["INTERVIEW", "interview", "INTERVIEW", "Interview", 75],
  ] as const)("shows %s instead of Closed for a recruiter rejection", (rejectedAtStage, status, activeStage, label, fillPercent) => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-5",
            job: { id: "job-5", title: "Application Developer" },
            stage: "REJECT",
            pipeline: ["SCREENING", "ASSESSMENT", "SCREENING", "REJECT"],
            rejectedAtStage,
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());
    const [app] = result.current.applications;

    expect(app.status).toBe(status);
    expect(DASHBOARD_APPLICATION_STATUS_CONFIG[app.status].label).toBe(label);
    expect(app.fillPercent).toBe(fillPercent);
    expect(app.pipelineStages.find((stage) => stage.isActive)?.key).toBe(activeStage);
    expect(app.message).toBe(DASHBOARD_APPLICATION_STATUS_CONFIG[status].caption);
  });

  it.each(["OFFER", "offer_extended", " offer "])("shows a complete red Closed status for rejection at %s", (rejectedAtStage) => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-6",
            job: { id: "job-6", title: "Application Developer" },
            stage: "REJECT",
            rejectedAtStage,
            statusMessage: "Your application was not successful. Find out more",
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());
    const [app] = result.current.applications;

    expect(app.status).toBe("offer_declined");
    expect(DASHBOARD_APPLICATION_STATUS_CONFIG[app.status]).toMatchObject({
      label: "Closed",
      color: "#D64545",
    });
    expect(app.fillPercent).toBe(100);
    expect(app.pipelineStages.find((stage) => stage.isActive)?.key).toBe("OFFER");
    expect(app.message).toBe("You have declined the offer for this position. Thank you for your interest!");
  });

  it.each([
    ["INBOUND", "Your job application has been successfully submitted and is now with the recruiter."],
    ["SCREENING", "The recruiter is currently reviewing your application."],
    ["ASSESSMENT", "You have been invited to complete an assessment for this position."],
    ["INTERVIEW", "Good news! You have been invited to an interview for this position."],
    ["SHORTLIST", "Good news! You have been shortlisted for this position."],
    ["OFFER", "Good news! An offer for this position has been extended to you!"],
    ["CLOSED", "Good news! You have accepted the offer for this position."],
    ["offer_declined", "You have declined the offer for this position. Thank you for your interest!"],
    ["REJECT", "Unfortunately, your application for this position was not successful. Thank you for your interest!"],
  ])("uses the local dictionary for %s instead of API copy", (stage, message) => {
    mocks.useCandidateDashboardQuery.mockReturnValue({
      data: {
        applications: [{
          id: "app-copy",
          job: { id: "job-copy", title: "Application Developer" },
          stage,
          statusMessage: "API message. Find out more",
        }],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useCandidateDashboardViewModel());

    expect(result.current.applications[0].message).toBe(message);
    expect(result.current.applications[0].message).not.toContain("Find out more");
  });

  it("uses a neutral dictionary message for an unknown stage", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      mocks.useCandidateDashboardQuery.mockReturnValue({
        data: {
          applications: [{
            id: "app-unknown",
            job: { id: "job-unknown", title: "Application Developer" },
            stage: "UNRECOGNIZED",
            statusMessage: "API message. Find out more",
          }],
        },
        isLoading: false,
      });

      const { result } = renderHook(() => useCandidateDashboardViewModel());

      expect(result.current.applications[0].message).toBe("Your application status is currently unavailable.");
    } finally {
      warn.mockRestore();
    }
  });
});