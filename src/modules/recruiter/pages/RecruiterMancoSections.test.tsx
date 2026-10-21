import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MancoRecruiterDetail } from "@/services/api/mancoApi";
import { MancoRecruiterSection } from "./RecruiterMancoSections";

const mocks = vi.hoisted(() => ({
  useMancoRecruiterDetail: vi.fn(),
  useMancoRecruiters: vi.fn(),
}));

vi.mock("@/modules/recruiter/hooks/useMancoDashboard", () => ({
  MANCO_SORT_OPTIONS: [
    { key: "mtdPlacements", label: "MTD Placements", sortBy: "MTD_PLACEMENTS" },
  ],
  useMancoRecruiterDetail: mocks.useMancoRecruiterDetail,
  useMancoRecruiters: mocks.useMancoRecruiters,
}));

const recruiter = {
  recruiterId: "recruiter-1",
  staffId: "staff-1",
  fullName: "Swastika Basu",
  roleName: "Recruiter",
  metrics: {
    mtdPlacements: 0,
    activeRoles: 0,
    revenueEarnedMtd: 0,
    revenueEarnedYtd: 0,
    conversionRate: 0,
  },
  calculatedOn: "2026-10-21",
};

const recruiterDetail: MancoRecruiterDetail = {
  recruiter: {
    recruiterId: recruiter.recruiterId,
    staffId: recruiter.staffId,
    fullName: recruiter.fullName,
    roleName: recruiter.roleName,
  },
  calculatedOn: "2026-10-21",
  metrics: recruiter.metrics,
  pipelineDistribution: {
    inbound: 6,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 1,
    filled: 0,
    totalPipeline: 7,
  },
  performanceSummary: { averageCandidatesPerRole: null },
};

describe("MancoRecruiterSection pipeline distribution", () => {
  beforeEach(() => {
    mocks.useMancoRecruiters.mockReturnValue({
      activeSort: "mtdPlacements",
      handleSearchChange: vi.fn(),
      handleSortChange: vi.fn(),
      recruiters: [recruiter],
      recruiterQuery: {
        data: { items: [recruiter] },
        isError: false,
        isLoading: false,
        refetch: vi.fn(),
      },
      searchQuery: "",
    });
    mocks.useMancoRecruiterDetail.mockReturnValue({
      data: recruiterDetail,
      isError: false,
      isLoading: false,
    });
  });

  it("uses totalPipeline for proportions and renders zero stages without colored bars", () => {
    render(
      <MemoryRouter>
        <MancoRecruiterSection />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Pipeline distribution for Swastika Basu",
      }),
    );

    const inbound = screen.getByRole("meter", { name: "Inbound: 6" });
    expect(inbound).toHaveStyle({ width: `${(6 / 7) * 100}%` });
    expect(inbound).toHaveAttribute("aria-valuemax", "7");

    const screening = screen.getByRole("meter", { name: "Screening: 0" });
    expect(screening).toHaveTextContent("Screening");
    expect(screening).toHaveTextContent("0");
    expect(screening.querySelector("[data-stage='screening']")).toBeNull();

    expect(
      screen.getByRole("meter", { name: "Rejected: 1" }),
    ).toHaveTextContent("Rejected");
  });
});