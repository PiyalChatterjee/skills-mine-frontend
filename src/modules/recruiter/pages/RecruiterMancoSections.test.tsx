import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MancoRecruiterDetail } from "@/services/api/mancoApi";
import { MancoAttentionSection, MancoRecruiterSection } from "./RecruiterMancoSections";

const mocks = vi.hoisted(() => ({
  useMancoAttention: vi.fn(),
  useMancoRecruiterDetail: vi.fn(),
  useMancoRecruiters: vi.fn(),
}));

vi.mock("@/modules/recruiter/hooks/useMancoDashboard", () => ({
  MANCO_SORT_OPTIONS: [
    { key: "mtdPlacements", label: "MTD Placements", sortBy: "MTD_PLACEMENTS" },
  ],
  useMancoAttention: mocks.useMancoAttention,
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
    totalCandidates: 0,
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

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe("MancoAttentionSection API alert text", () => {
  const alert = {
    alertId: null,
    recruiterId: "recruiter-1",
    fullName: "Swastika Basu",
    primaryEmail: "swastika.basu@ibm.com",
    calculationMonth: "2026-09",
    conversionRate: null,
    issue: "Low conversion rate (N/A)",
    metric: "Conversion Rate",
    recommendedActions: ["Review pipeline quality and candidate sourcing."],
  };

  beforeEach(() => {
    mocks.useMancoAttention.mockReturnValue({
      alertCount: 1,
      alerts: [alert],
      hasLoadedAlerts: true,
      hasResolveError: false,
      isError: false,
      isExpanded: true,
      isLoading: false,
      isResolving: false,
      selectedAlert: null,
      closeAlert: vi.fn(),
      resolveSelectedAlert: vi.fn(),
      selectAlert: vi.fn(),
      toggleExpanded: vi.fn(),
    });
  });

  it("renders the API issue in the attention list without an actualValue", () => {
    render(<MancoAttentionSection />);

    expect(screen.getByText(alert.issue)).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(mocks.useMancoAttention().selectAlert).toHaveBeenCalledWith(alert);
  });

  it("renders the API issue and metric verbatim in the details dialog", () => {
    mocks.useMancoAttention.mockReturnValue({
      ...mocks.useMancoAttention(),
      isExpanded: false,
      selectedAlert: alert,
    });

    render(<MancoAttentionSection />);

    expect(screen.getByRole("dialog")).toHaveTextContent(alert.issue);
    expect(screen.getByText(alert.metric)).toBeInTheDocument();
    expect(screen.getByText(alert.recommendedActions[0])).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});

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

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Conversion rates in employee cards reflect the current month. Conversion rates in the attention alerts above reflect last month.",
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

  it("routes View Pipeline to the universal recruiter dashboard", () => {
    render(
      <MemoryRouter>
        <MancoRecruiterSection />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Details" }));
    fireEvent.click(screen.getByRole("button", { name: "View Pipeline" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/recruiter/dashboard",
    );
  });
});