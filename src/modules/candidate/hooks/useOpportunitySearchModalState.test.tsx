import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOpportunitySearchModalState } from "./useOpportunitySearchModalState";

const mocks = vi.hoisted(() => ({
  useIndustryOptions: vi.fn(),
}));

vi.mock("@/modules/candidate/hooks/useIndustryOptions", () => ({
  useIndustryOptions: mocks.useIndustryOptions,
}));

describe("useOpportunitySearchModalState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useIndustryOptions.mockReturnValue(["Technology", "Finance"]);
  });

  it("builds readable filter options and label lookups", () => {
    const { result } = renderHook(() => useOpportunitySearchModalState(false));

    expect(result.current.readableIndustryOptions).toEqual([
      { value: "Technology", label: "Technology" },
      { value: "Finance", label: "Finance" },
    ]);
    expect(result.current.readableLocationOptions).toEqual([
      { value: "Hybrid", label: "Hybrid" },
      { value: "Remote", label: "Remote" },
      { value: "On-site", label: "On-site" },
    ]);
    expect(result.current.getDatePostedLabel("LAST_7_DAYS")).toBe("Last 7 days");
    expect(result.current.getJobTypeLabel("FULL_TIME")).toBe("Full time");
    expect(result.current.getJobTypeLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("tracks and removes selected filters", () => {
    const { result } = renderHook(() => useOpportunitySearchModalState(false));

    act(() => {
      result.current.setSelectedDatePosted(["TODAY"]);
      result.current.setSelectedIndustries(["Technology"]);
      result.current.setSelectedLocations(["Remote"]);
      result.current.setSelectedJobTypes(["FULL_TIME"]);
    });

    expect(result.current.hasSelectedFilters).toBe(true);

    act(() => {
      result.current.removeDatePostedFilter("TODAY");
      result.current.removeIndustryFilter("Technology");
      result.current.removeLocationFilter("Remote");
      result.current.removeJobTypeFilter("FULL_TIME");
    });

    expect(result.current.selectedDatePosted).toEqual([]);
    expect(result.current.selectedIndustries).toEqual([]);
    expect(result.current.selectedLocations).toEqual([]);
    expect(result.current.selectedJobTypes).toEqual([]);
    expect(result.current.hasSelectedFilters).toBe(false);
  });

  it("resets filters when the modal opens", () => {
    const { result, rerender } = renderHook(
      ({ open }) => useOpportunitySearchModalState(open),
      { initialProps: { open: false } },
    );

    act(() => {
      result.current.setSelectedIndustries(["Technology"]);
      result.current.setSelectedLocations(["Remote"]);
    });

    expect(result.current.hasSelectedFilters).toBe(true);

    rerender({ open: true });

    expect(result.current.selectedIndustries).toEqual([]);
    expect(result.current.selectedLocations).toEqual([]);
    expect(result.current.hasSelectedFilters).toBe(false);
  });
});