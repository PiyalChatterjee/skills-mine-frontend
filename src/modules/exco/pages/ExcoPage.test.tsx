import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { excoApi, type ExcoDashboard } from "@/services/api/excoApi";
import { apiSlice } from "@/store/api/apiSlice";
import ExcoPage from "./ExcoPage";

vi.mock("@/modules/recruiter/components/RecruiterSidebar", () => ({
  RecruiterSidebar: ({ variant }: { variant: string }) => <nav aria-label={`${variant} navigation`} />,
}));
vi.mock("@/services/api/excoApi", () => ({ excoApi: { getDashboard: vi.fn() } }));

const snapshot: ExcoDashboard = {
  metricDate: "2026-10-28",
  strategicKpis: {
    placementsYtd: 83, avgContractValue: 32100, revenueEarnedYtd: 720000, revenueEarnedMtd: 65400,
  },
  topHiringIndustries: [
    { industryName: "Energy", placementCount: 51 },
    { industryName: "Education", placementCount: 12 },
  ],
  riskIndicators: { clientChurnRate: 4.1, atRiskClientCount: 2 },
  activeClientsCount: 42, avgPostedJobsPerActiveClientPerWeek: 1.33,
  placementVelocity: 3.6, avgTimeToFillDays: 21, offerAcceptanceRate: 89,
};

function renderPage() {
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
  render(<Provider store={store}><ExcoPage /></Provider>);
}

describe("live EXCO dashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(excoApi.getDashboard).mockResolvedValue(snapshot);
  });

  it("renders all cards using server values, Rand formatting and server industry ordering", async () => {
    renderPage();
    const strategic = await screen.findByRole("region", { name: "Strategic KPIs" });
    expect(screen.getByRole("heading", { name: "EXCO Dashboard", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "exco navigation" })).toBeInTheDocument();
    for (const value of ["83", "R32 100", "R720 000", "R65 400"]) {
      expect(within(strategic).getByText(value)).toBeInTheDocument();
    }
    const industries = screen.getByRole("region", { name: "Top Hiring Industries (12mo)" });
    expect(within(industries).getAllByRole("term").map((term) => term.textContent)).toEqual(["Energy", "Education"]);
    expect(within(industries).getByText("51")).toBeInTheDocument();
    expect(screen.getByText("4.1%")).toBeInTheDocument();
    expect(screen.getByText("2 at risk")).toBeInTheDocument();
    for (const value of ["42", "1.33 reqs/week avg", "3.6", "21", "89%", "per week", "days"]) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    expect(excoApi.getDashboard).toHaveBeenCalledExactlyOnceWith();
  });

  it("preserves zero metrics and displays an explicit empty industry state", async () => {
    vi.mocked(excoApi.getDashboard).mockResolvedValue({
      ...snapshot,
      strategicKpis: { placementsYtd: 0, avgContractValue: 0, revenueEarnedYtd: 0, revenueEarnedMtd: 0 },
      topHiringIndustries: [],
      riskIndicators: { clientChurnRate: 0, atRiskClientCount: 0 },
      activeClientsCount: 0, avgPostedJobsPerActiveClientPerWeek: 0,
      placementVelocity: 0, avgTimeToFillDays: 0, offerAcceptanceRate: 0,
    });
    renderPage();
    expect(await screen.findByText("No hiring industry data for this snapshot.")).toBeInTheDocument();
    expect(screen.getAllByText("R0")).toHaveLength(3);
    expect(screen.getAllByText("0")).toHaveLength(4);
    expect(screen.getAllByText("0%")).toHaveLength(2);
    expect(screen.getByText("0 reqs/week avg")).toBeInTheDocument();
    expect(screen.getByText("0 at risk")).toBeInTheDocument();
    expect(screen.queryByText("Not available")).not.toBeInTheDocument();
  });

  it("does not convert null metrics to zeros or expose fabricated units", async () => {
    vi.mocked(excoApi.getDashboard).mockResolvedValue({
      ...snapshot,
      strategicKpis: { placementsYtd: 83, avgContractValue: null, revenueEarnedYtd: null, revenueEarnedMtd: null },
      riskIndicators: { clientChurnRate: null, atRiskClientCount: null },
      activeClientsCount: null, avgPostedJobsPerActiveClientPerWeek: null,
      placementVelocity: null, avgTimeToFillDays: null, offerAcceptanceRate: null,
    });
    renderPage();
    expect(await screen.findAllByText("Not available")).toHaveLength(8);
    expect(screen.getByText("At-risk client count not available")).toBeInTheDocument();
    expect(screen.queryByText("per week")).not.toBeInTheDocument();
    expect(screen.queryByText("days")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.queryByText(/reqs\/week avg/)).not.toBeInTheDocument();
  });

  it("shows loading without sample metrics until the request resolves", () => {
    vi.mocked(excoApi.getDashboard).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole("status")).toHaveTextContent("Loading executive overview...");
    expect(screen.queryByRole("region", { name: "Strategic KPIs" })).not.toBeInTheDocument();
  });

  it("surfaces API errors and loads real metrics after retry", async () => {
    vi.mocked(excoApi.getDashboard).mockRejectedValueOnce(new Error("Executive metrics unavailable"))
      .mockResolvedValueOnce(snapshot);
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Executive metrics unavailable");
    expect(screen.queryByRole("region", { name: "Strategic KPIs" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("R720 000")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(excoApi.getDashboard).toHaveBeenCalledTimes(2);
  });
});
