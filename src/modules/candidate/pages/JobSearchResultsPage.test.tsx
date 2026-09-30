import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JobSearchResultsPage from "./JobSearchResultsPage";

const mocks = vi.hoisted(() => ({
  useListJobsPageQuery: vi.fn(),
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
  OpportunityJobCard: ({ title }: { title: string }) => <article>{title}</article>,
}));

describe("JobSearchResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
});