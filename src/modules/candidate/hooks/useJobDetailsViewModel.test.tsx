import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useJobDetailsViewModel } from "./useJobDetailsViewModel";

const mocks = vi.hoisted(() => ({
  applyToJob: vi.fn(),
  createGuestApplicationDraft: vi.fn(),
  isJobApplied: vi.fn(),
  isJobSaved: vi.fn(),
  isJobSaving: vi.fn(),
  navigate: vi.fn(),
  toggleJobSaved: vi.fn(),
  useAppliedJobIds: vi.fn(),
  useApplyToJobMutation: vi.fn(),
  useAuth: vi.fn(),
  useGetJobByIdQuery: vi.fn(),
  useGetJobProfileQuery: vi.fn(),
  useJobs: vi.fn(),
  useLocation: vi.fn(),
  useOptimisticSaveJob: vi.fn(),
  useParams: vi.fn(),
  useSavedJobsQuery: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useLocation: mocks.useLocation,
  useNavigate: () => mocks.navigate,
  useParams: mocks.useParams,
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/modules/public/hooks/useJobs", () => ({
  useJobs: mocks.useJobs,
}));

vi.mock("@/store/api/apiSlice", () => ({
  useApplyToJobMutation: mocks.useApplyToJobMutation,
  useGetJobByIdQuery: mocks.useGetJobByIdQuery,
  useGetJobProfileQuery: mocks.useGetJobProfileQuery,
}));

vi.mock("../utils/guestApplicationDraft", () => ({
  createGuestApplicationDraft: mocks.createGuestApplicationDraft,
}));

vi.mock("./useAppliedJobIds", () => ({
  useAppliedJobIds: mocks.useAppliedJobIds,
}));

vi.mock("./useCandidateQueries", () => ({
  useSavedJobsQuery: mocks.useSavedJobsQuery,
}));

vi.mock("./useOptimisticSaveJob", () => ({
  useOptimisticSaveJob: mocks.useOptimisticSaveJob,
}));

const listJob = {
  jobId: "job-1",
  jobProfileId: "profile-1",
  title: "Frontend Engineer",
  company: "Acme",
  location: "Cape Town, Western Cape",
  industry: "Technology",
  employmentType: "Permanent",
  workType: "Remote",
  salaryRange: "R1",
  description: "Build product UI.",
  requirements: ["React"],
  responsibilities: ["Ship UI"],
  skills: ["React", "TypeScript", "Testing", "CSS", "Accessibility", "Node"],
  status: "Open",
  applicationCount: 0,
  postedDate: "2026-01-02T00:00:00.000Z",
};

describe("useJobDetailsViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useParams.mockReturnValue({ jobId: "job-1" });
    mocks.useLocation.mockReturnValue({ state: { job: listJob, from: "/jobs/saved" } });
    mocks.useAuth.mockReturnValue({ isAuthenticated: true, user: { role: "JOB_SEEKER" } });
    mocks.useSavedJobsQuery.mockReturnValue({ data: { jobs: [] } });
    mocks.useOptimisticSaveJob.mockReturnValue({
      isJobSaved: mocks.isJobSaved,
      isJobSaving: mocks.isJobSaving,
      toggleJobSaved: mocks.toggleJobSaved,
    });
    mocks.useAppliedJobIds.mockReturnValue({ isJobApplied: mocks.isJobApplied });
    mocks.isJobSaved.mockReturnValue(true);
    mocks.isJobSaving.mockReturnValue(false);
    mocks.isJobApplied.mockReturnValue(false);
    mocks.applyToJob.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.useApplyToJobMutation.mockReturnValue([mocks.applyToJob, { isLoading: false }]);
    mocks.useJobs.mockReturnValue({
      data: { pages: [{ jobs: [listJob] }] },
      isLoading: false,
    });
    mocks.useGetJobByIdQuery.mockReturnValue({ data: undefined });
    mocks.useGetJobProfileQuery.mockReturnValue({
      data: {
        ...listJob,
        title: "Senior Frontend Engineer",
        salaryRange: "R900,000",
      },
      isFetching: false,
    });
  });

  it("returns display-ready job details from route state and profile detail data", () => {
    const { result } = renderHook(() => useJobDetailsViewModel());

    expect(mocks.useJobs).toHaveBeenCalledWith(undefined, true, 50);
    expect(mocks.useGetJobByIdQuery).toHaveBeenCalledWith("job-1", { skip: true });
    expect(mocks.useGetJobProfileQuery).toHaveBeenCalledWith("profile-1", { skip: false });
    expect(result.current).toMatchObject({
      backRoute: "/jobs/saved",
      title: "Senior Frontend Engineer",
      companyName: "Acme",
      industry: "Technology",
      locationName: "Cape Town",
      workType: "Remote",
      employmentType: "Permanent",
      requirements: ["React"],
      responsibilities: ["Ship UI"],
      salaryRange: "R900,000",
      postedDate: "2 January 2026",
      jobReferenceNumber: "job-1",
      isSaved: true,
      isSaving: false,
      isApplied: false,
      isApplyDisabled: false,
      isApplySuccessModalOpen: false,
      applyButtonLabel: "Apply",
      footerSaveLabel: "Saved",
      saveAriaLabel: "Unsave Senior Frontend Engineer",
    });
    expect(result.current.skills).toEqual(["React", "TypeScript", "Testing", "CSS", "Accessibility"]);
  });

  it("falls back to latest jobs when route state has an unsupported back route", () => {
    mocks.useLocation.mockReturnValue({ state: { job: listJob, from: "/unsupported" } });

    const { result } = renderHook(() => useJobDetailsViewModel());

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.backRoute).toBe("/jobs/latest");
    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/latest");
  });

  it("hides salary from the latest profile while preserving benefits", () => {
    mocks.useGetJobProfileQuery.mockReturnValue({
      data: { ...listJob, salaryRange: "R900,000", isSalaryHidden: true, benefitsText: ["Medical aid"] },
      isFetching: false,
    });

    const { result } = renderHook(() => useJobDetailsViewModel());

    expect(result.current.salaryRange).toBe("");
    expect(result.current.benefitsText).toEqual(["Medical aid"]);
  });

  it("does not reveal a cached salary while the job profile is loading", () => {
    mocks.useGetJobProfileQuery.mockReturnValue({ data: undefined, isFetching: true });

    const { result } = renderHook(() => useJobDetailsViewModel());

    expect(result.current.salaryRange).toBe("");
  });

  it("creates a guest application draft and navigates guests to CV builder", async () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, user: undefined });
    const summaryJob = { ...listJob, workType: "" };
    mocks.useLocation.mockReturnValue({ state: { job: summaryJob } });
    mocks.useJobs.mockReturnValue({ data: { pages: [{ jobs: [summaryJob] }] }, isLoading: false });
    mocks.useGetJobProfileQuery.mockReturnValue({
      data: { ...listJob, title: "Senior Frontend Engineer", workType: "ONSITE" },
      isFetching: false,
    });

    const { result } = renderHook(() => useJobDetailsViewModel());
    expect(result.current.workType).toBe("On-site");

    await act(async () => {
      await result.current.handleApply();
    });

    expect(mocks.createGuestApplicationDraft).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: "job-1", title: "Senior Frontend Engineer", workType: "ONSITE" }),
    );
    expect(mocks.navigate).toHaveBeenCalledWith("/candidate/cv-builder?job=job-1", {
      state: { guestApplicationJobId: "job-1" },
    });

  });

  it("uses the available job for a guest draft when profile details are unavailable", async () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, user: undefined });
    mocks.useGetJobProfileQuery.mockReturnValue({ data: undefined, isFetching: false });
    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    expect(mocks.createGuestApplicationDraft).toHaveBeenCalledWith(listJob);
  });

  it.each([true, false])("blocks applications for a closed profile (authenticated: %s)", async (isAuthenticated) => {
    mocks.useAuth.mockReturnValue({ isAuthenticated, user: isAuthenticated ? { role: "JOB_SEEKER" } : undefined });
    mocks.useGetJobProfileQuery.mockReturnValue({
      data: { ...listJob, status: " closed " },
      isFetching: false,
    });

    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    expect(result.current.isApplyDisabled).toBe(true);
    expect(result.current.applyButtonLabel).toBe("Closed");
    expect(mocks.applyToJob).not.toHaveBeenCalled();
    expect(mocks.createGuestApplicationDraft).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("waits for the job profile before automatically applying", () => {
    mocks.useLocation.mockReturnValue({ state: { job: listJob, autoApply: true } });
    mocks.useGetJobProfileQuery.mockReturnValue({ data: undefined, isFetching: true });
    const { result, rerender } = renderHook(() => useJobDetailsViewModel());

    expect(result.current.isApplyDisabled).toBe(true);
    expect(mocks.applyToJob).not.toHaveBeenCalled();

    mocks.useGetJobProfileQuery.mockReturnValue({
      data: { ...listJob, status: "CLOSED" },
      isFetching: false,
    });
    rerender();

    expect(result.current.isApplyDisabled).toBe(true);
    expect(mocks.applyToJob).not.toHaveBeenCalled();
  });

  it("sets an error when an authenticated non-candidate applies", async () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: true, user: { role: "RECRUITER" } });

    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    expect(result.current.applyError).toBe("Only candidate accounts can apply for jobs.");
    expect(mocks.applyToJob).not.toHaveBeenCalled();
  });

  it("applies to a job and updates applied display state", async () => {
    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    act(() => {
      result.current.handleToggleSave();
    });

    expect(mocks.applyToJob).toHaveBeenCalledWith({ jobProfileId: "profile-1" });
    expect(result.current.isApplied).toBe(true);
    expect(result.current.isApplySuccessModalOpen).toBe(true);
    expect(result.current.applyButtonLabel).toBe("Applied");
    expect(mocks.toggleJobSaved).toHaveBeenCalledWith("profile-1");
  });

  it("closes the apply success modal without leaving job details", async () => {
    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    act(() => {
      result.current.handleApplySuccessClose();
    });

    expect(result.current.isApplySuccessModalOpen).toBe(false);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("navigates to candidate dashboard from the apply success modal", () => {
    const { result } = renderHook(() => useJobDetailsViewModel());

    act(() => {
      result.current.handleApplySuccessDashboard();
    });

    expect(mocks.navigate).toHaveBeenCalledWith("/candidate/dashboard");
  });

  it("treats a job as saved when the candidate saved the canonical jobProfileId", () => {
    mocks.isJobSaved.mockImplementation((jobKey: string) => jobKey === "profile-1");
    mocks.useLocation.mockReturnValue({ state: { job: { ...listJob, jobId: "job-reference-1", jobProfileId: "profile-1" }, from: "/jobs/saved" } });

    const { result } = renderHook(() => useJobDetailsViewModel());

    expect(result.current.isSaved).toBe(true);
    expect(result.current.footerSaveLabel).toBe("Saved");
    expect(result.current.saveAriaLabel).toBe("Unsave Senior Frontend Engineer");
  });

  it("uses the compatibility lookup only when no job profile ID is available", () => {
    mocks.useLocation.mockReturnValue({ state: null });
    mocks.useJobs.mockReturnValue({ data: { pages: [] }, isLoading: false });
    mocks.useGetJobByIdQuery.mockReturnValue({ data: listJob });

    renderHook(() => useJobDetailsViewModel());

    expect(mocks.useGetJobByIdQuery).toHaveBeenCalledWith("job-1", { skip: false });
    expect(mocks.useGetJobProfileQuery).toHaveBeenCalledWith("profile-1", { skip: false });
  });

  it("exposes loading and not-found states without a resolved job", () => {
    mocks.useLocation.mockReturnValue({ state: null });
    mocks.useJobs.mockReturnValue({ data: { pages: [] }, isLoading: true });
    mocks.useGetJobByIdQuery.mockReturnValue({ data: undefined });
    mocks.useGetJobProfileQuery.mockReturnValue({ data: undefined, isFetching: false });

    const { result } = renderHook(() => useJobDetailsViewModel());

    expect(mocks.useGetJobByIdQuery).toHaveBeenCalledWith("job-1", { skip: false });
    expect(mocks.useGetJobProfileQuery).toHaveBeenCalledWith("", { skip: true });
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isNotFound).toBe(true);
    act(() => {
      result.current.handleBackToLatest();
    });
    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/latest");
  });

  it("does not submit a duplicate application", async () => {
    mocks.isJobApplied.mockReturnValue(true);

    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    expect(mocks.applyToJob).not.toHaveBeenCalled();
    expect(result.current.isApplied).toBe(true);
    expect(result.current.isApplySuccessModalOpen).toBe(false);
  });

  it("exposes a recoverable error when application submission fails", async () => {
    mocks.applyToJob.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ message: "Application failed" }),
    });

    const { result } = renderHook(() => useJobDetailsViewModel());

    await act(async () => {
      await result.current.handleApply();
    });

    expect(result.current.applyError).toBe("Application failed");
    expect(result.current.isApplied).toBe(false);
    expect(result.current.isApplySuccessModalOpen).toBe(false);
  });
});