import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCandidateFilters } from "./useCandidateFilters";

const filterKeys = ["industry", "location"] as const;

describe("useCandidateFilters", () => {
  it("tracks and removes values by filter key", () => {
    const { result } = renderHook(() => useCandidateFilters(filterKeys, false));

    act(() => {
      result.current.setFilterValues("industry", ["Technology"]);
      result.current.setFilterValues("location", ["Remote"]);
    });

    expect(result.current.hasSelectedFilters).toBe(true);

    act(() => {
      result.current.removeFilterValue("industry", "Technology");
      result.current.removeFilterValue("location", "Remote");
    });

    expect(result.current.selectedFilters).toEqual({ industry: [], location: [] });
    expect(result.current.hasSelectedFilters).toBe(false);
  });

  it("resets all filter values when the reset signal becomes true", () => {
    const { result, rerender } = renderHook(
      ({ resetSignal }) => useCandidateFilters(filterKeys, resetSignal),
      { initialProps: { resetSignal: false } },
    );

    act(() => {
      result.current.setFilterValues("industry", ["Technology"]);
    });

    rerender({ resetSignal: true });

    expect(result.current.selectedFilters).toEqual({ industry: [], location: [] });
  });
});