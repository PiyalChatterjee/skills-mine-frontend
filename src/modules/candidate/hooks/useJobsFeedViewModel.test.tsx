import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useJobsFeedViewModel } from "./useJobsFeedViewModel";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  fetchNextPage: vi.fn(),
  handleSearchChange: vi.fn(),
  handleClearSearch: vi.fn(),
  isJobSaved: vi.fn(),
  isJobSaving: vi.fn(),
  navigate: vi.fn(),
  toggleJobSaved: vi.fn(),
  useAppliedJobIds: vi.fn(),
  useInfiniteScrollTrigger: vi.fn(),
  useJobsSearch: vi.fn(),
  useOptimisticSaveJob: vi.fn(),
  useRecommendedPositionsQuery: vi.fn(),
  useSavedJobsQuery: vi.fn(),
  useSearchQueryState: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: mocks.useSelector,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/hooks/useInfiniteScrollTrigger", () => ({
  useInfiniteScrollTrigger: mocks.useInfiniteScrollTrigger,
}));

vi.mock("@/hooks/useSearchQueryState", () => ({
  useSearchQueryState: mocks.useSearchQueryState,
}));

vi.mock("@/modules/public/hooks/useJobsSearch", () => ({
  useJobsSearch: mocks.useJobsSearch,
}));

vi.mock("./useAppliedJobIds", () => ({
  useAppliedJobIds: mocks.useAppliedJobIds,
}));

vi.mock("./useCandidateQueries", () => ({
  useRecommendedPositionsQuery: mocks.useRecommendedPositionsQuery,
  useSavedJobsQuery: mocks.useSavedJobsQuery,
}));

vi.mock("./useOptimisticSaveJob", () => ({
  useOptimisticSaveJob: mocks.useOptimisticSaveJob,
}));

const latestJob = {
  jobId: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  location: "Cape Town, Western Cape",
  industry: "Technology",
  employmentType: "Permanent",
  workType: "Remote",
  salaryRange: "R1",
  description: "Build product UI.",
  responsibilities: [],
  status: "Open",
  applicationCount: 0,
  postedDate: "2026-01-01",
};

const recommendedJob = {
  ...latestJob,
  jobId: "job-2",
  title: "UX Designer",
  location: "Johannesburg, Gauteng",
  employmentType: undefined,
  matchScore: 87,
  skills: [],
};

describe("useJobsFeedViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSelector.mockReturnValue(new Set(["job-2"]));
    mocks.isJobSaved.mockImplementation((jobId: string) => jobId === "job-1");
    mocks.isJobSaving.mockImplementation((jobId: string) => jobId === "job-2");
    mocks.useOptimisticSaveJob.mockReturnValue({
      savedJobIds: new Set(["job-1"]),
      isJobSaved: mocks.isJobSaved,
      isJobSaving: mocks.isJobSaving,
      toggleJobSaved: mocks.toggleJobSaved,
    });
    mocks.useAppliedJobIds.mockReturnValue({
      applicationStages: new Map([["job-1", "screening"]]),
    });
    mocks.useSearchQueryState.mockReturnValue({
      inputValue: "",
      normalizedValue: "",
      debouncedValue: "",
      shouldFilter: false,
      shouldUseDebouncedQuery: false,
      handleInputChange: mocks.handleSearchChange,
      clear: mocks.handleClearSearch,
    });
    mocks.useJobsSearch.mockReturnValue({
      allJobs: [latestJob],
      visibleJobs: [latestJob],
      isJobsError: false,
      jobsError: undefined,
      isJobsLoading: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mocks.fetchNextPage,
    });
    mocks.useInfiniteScrollTrigger.mockReturnValue({ current: null });
    mocks.useSavedJobsQuery.mockReturnValue({ data: { jobs: [] }, isError: false, isLoading: false });
    mocks.useRecommendedPositionsQuery.mockReturnValue({ data: { jobs: [] }, isError: false, isLoading: false });
  });

  it("returns latest jobs as render-ready cards", () => {
    const { result } = renderHook(() => useJobsFeedViewModel("latest"));

    expect(mocks.useJobsSearch).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
    expect(mocks.useSavedJobsQuery).toHaveBeenCalledWith(true);
    expect(mocks.useRecommendedPositionsQuery).toHaveBeenCalledWith(false);
    expect(result.current.modeConfig.title).toBe("Latest Opportunities");
    expect(result.current.isLatestMode).toBe(true);
    expect(result.current.hasJobs).toBe(true);
    expect(result.current.jobCards[0]).toMatchObject({
      jobId: "job-1",
      title: "Frontend Engineer",
      description: "Build product UI.",
      tags: ["Technology", "Cape Town", "Permanent"],
      matchScore: undefined,
      applicationStatus: "Screening",
      applicationStatusKey: "screening",
      isSaved: true,
      isSaving: false,
      saveLabel: "Unsave Frontend Engineer",
    });
  });

  it("normalizes recommended jobs and preserves match scores", () => {
    mocks.useRecommendedPositionsQuery.mockReturnValue({
      data: { jobs: [recommendedJob] },
      isError: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useJobsFeedViewModel("recommended"));

    expect(mocks.useJobsSearch).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(mocks.useRecommendedPositionsQuery).toHaveBeenCalledWith(true);
    expect(result.current.modeConfig.title).toBe("Recommended Jobs");
    expect(result.current.jobCards[0]).toMatchObject({
      jobId: "job-2",
      tags: ["Technology", "Johannesburg", "Permanent"],
      matchScore: 87,
      isSaving: true,
      saveLabel: "Save UX Designer",
    });
    expect(result.current.jobCards[0].job).toMatchObject({
      employmentType: "Permanent",
      status: "Open",
      applicationCount: 0,
      requirements: [],
      responsibilities: [],
    });
  });

  it("filters saved jobs by title and returns the saved empty search message", () => {
    mocks.useSearchQueryState.mockReturnValue({
      inputValue: "design",
      normalizedValue: "design",
      debouncedValue: "design",
      shouldFilter: true,
      shouldUseDebouncedQuery: true,
      handleInputChange: mocks.handleSearchChange,
      clear: mocks.handleClearSearch,
    });
    mocks.useSavedJobsQuery.mockReturnValue({
      data: { jobs: [{ ...recommendedJob, title: "Data Analyst" }] },
      isError: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useJobsFeedViewModel("saved"));

    expect(mocks.useSavedJobsQuery).toHaveBeenCalledWith(true);
    expect(result.current.modeConfig.showSearch).toBe(false);
    expect(result.current.jobCards).toEqual([]);
    expect(result.current.emptyMessage).toBe("No saved jobs found for your search.");
  });

  it("navigates to job details with selected job state", () => {
    const { result } = renderHook(() => useJobsFeedViewModel("latest"));

    result.current.handleViewJob(result.current.jobCards[0].job);

    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/job-1", {
      state: { job: result.current.jobCards[0].job, from: "/jobs/latest" },
    });
  });

  it("exposes an empty state when the latest jobs query has no results", () => {
    mocks.useJobsSearch.mockReturnValue({
      allJobs: [],
      visibleJobs: [],
      isJobsError: false,
      jobsError: undefined,
      isJobsLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mocks.fetchNextPage,
    });

    const { result } = renderHook(() => useJobsFeedViewModel("latest"));

    expect(result.current.hasJobs).toBe(false);
    expect(result.current.emptyMessage).toBe("No jobs available right now.");
    expect(result.current.isError).toBe(false);
  });

  it("preserves the jobs API error for an accessible page-level error state", () => {
    mocks.useJobsSearch.mockReturnValue({
      allJobs: [],
      visibleJobs: [],
      isJobsError: true,
      jobsError: { message: "Jobs service unavailable" },
      isJobsLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mocks.fetchNextPage,
    });

    const { result } = renderHook(() => useJobsFeedViewModel("latest"));

    expect(result.current.isError).toBe(true);
    expect(result.current.loadErrorMessage).toBe("Jobs service unavailable");
  });
});