import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JobSearchResultsPage from "./JobSearchResultsPage";

const mocks = vi.hoisted(() => ({
  isAuthenticated: false,
  isJobSaved: vi.fn(),
  isJobSaving: vi.fn(),
  toggleJobSaved: vi.fn(),
  useListJobsPageQuery: vi.fn(),
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("@/modules/candidate/hooks/useOptimisticSaveJob", () => ({
  useOptimisticSaveJob: () => ({
    isJobSaved: mocks.isJobSaved,
    isJobSaving: mocks.isJobSaving,
    toggleJobSaved: mocks.toggleJobSaved,
  }),
}));

vi.mock("@/store/api/apiSlice", () => ({
  useListJobsPageQuery: mocks.useListJobsPageQuery,
}));

vi.mock("@/modules/candidate/hooks/useIndustryOptions", () => ({
  useIndustryOptions: () => ["Technology", "Finance"],
}));

vi.mock("@/modules/candidate/hooks/useLocationOptions", () => ({
  useLocationOptions: () => ["Cape Town", "Remote"],
}));

vi.mock("@/modules/candidate/components/OpportunitySearchControls", () => ({
  OpportunitySearchControls: () => <div>Search controls</div>,
}));

vi.mock("@/components/jobs", () => ({
  getJobTags: () => [],
  OpportunityJobCard: ({
    title,
    showSaveButton,
    onToggleSave,
    saveLabel,
  }: {
    title: string;
    showSaveButton: boolean;
    onToggleSave: () => void;
    saveLabel: string;
  }) => (
    <article>
      {title}
      {showSaveButton ? <button onClick={onToggleSave}>{saveLabel}</button> : null}
    </article>
  ),
}));

describe("JobSearchResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAuthenticated = false;
    mocks.isJobSaved.mockReturnValue(false);
    mocks.isJobSaving.mockReturnValue(false);
    mocks.useListJobsPageQuery.mockReturnValue({
      data: {
        jobs: [
          {
            jobId: "job-6",
            title: "Developer",
            description: "Build products",
          },
        ],
        total: 8,
        page: 1,
        pageSize: 5,
      },
      isError: false,
      isFetching: false,
      isLoading: false,
    });
  });

  it("loads the requested page using URL search and filter parameters", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/jobs/search?search=developer&industry=Technology&industry=Finance&location=Cape+Town&datePosted=LAST_7_DAYS&jobType=FULL_TIME&page=2",
        ]}
      >
        <JobSearchResultsPage />
      </MemoryRouter>,
    );

    expect(mocks.useListJobsPageQuery).toHaveBeenCalledWith({
      searchQuery: "developer",
      page: 2,
      pageSize: 5,
      filters: {
        industries: ["Technology", "Finance"],
        locations: ["Cape Town"],
        datePosted: "LAST_7_DAYS",
        jobTypes: ["FULL_TIME"],
      },
    });
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Showing 6 to 8 of 8 results")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Developer" })).not.toBeInTheDocument();
  });

  it("shows a functional bookmark for an authenticated candidate", () => {
    mocks.isAuthenticated = true;
    render(
      <MemoryRouter initialEntries={["/jobs/search?search=developer"]}>
        <JobSearchResultsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save Developer" }));

    expect(mocks.isJobSaved).toHaveBeenCalledWith("job-6");
    expect(mocks.isJobSaving).toHaveBeenCalledWith("job-6");
    expect(mocks.toggleJobSaved).toHaveBeenCalledWith("job-6");
  });
});