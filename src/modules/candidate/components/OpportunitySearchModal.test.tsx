import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpportunitySearchModal } from "./OpportunitySearchModal";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSelectedDatePosted: vi.fn(),
  setSelectedJobTypes: vi.fn(),
  useOpportunitySearchModalState: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...await importOriginal<typeof import("react-router-dom")>(),
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/modules/candidate/hooks/useOpportunitySearchModalState", () => ({
  datePostedOptions: [
    { value: "TODAY", label: "Today" },
    { value: "LAST_7_DAYS", label: "Last 7 days" },
  ],
  jobTypeOptions: [
    { value: "FULL_TIME", label: "Full time" },
    { value: "CONTRACT", label: "Contract" },
  ],
  useOpportunitySearchModalState: mocks.useOpportunitySearchModalState,
}));

describe("OpportunitySearchModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useOpportunitySearchModalState.mockReturnValue({
      readableIndustryOptions: [],
      readableLocationOptions: [],
      selectedDatePosted: ["LAST_7_DAYS"],
      selectedIndustries: ["Technology"],
      selectedJobTypes: ["FULL_TIME"],
      selectedLocations: ["Cape Town"],
      setSelectedDatePosted: mocks.setSelectedDatePosted,
      setSelectedIndustries: vi.fn(),
      setSelectedJobTypes: mocks.setSelectedJobTypes,
      setSelectedLocations: vi.fn(),
    });
  });

  it("navigates to search results with text and selected filters", () => {
    const onClose = vi.fn();
    render(<OpportunitySearchModal open onClose={onClose} />);

    fireEvent.change(screen.getByLabelText("Search opportunities"), {
      target: { value: "developer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit opportunity search" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith(
      "/jobs/search?search=developer&industry=Technology&location=Cape+Town&datePosted=LAST_7_DAYS&jobType=FULL_TIME",
    );
  });

  it("selects only one job type", async () => {
    render(<OpportunitySearchModal open onClose={vi.fn()} />);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Job type" }));
    fireEvent.click(await screen.findByRole("option", { name: "Contract" }));

    expect(mocks.setSelectedJobTypes).toHaveBeenCalledWith(["CONTRACT"]);
  });

  it("clears the selected date posted filter", async () => {
    render(<OpportunitySearchModal open onClose={vi.fn()} />);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Date posted" }));
    fireEvent.click(await screen.findByRole("option", { name: "None" }));

    expect(mocks.setSelectedDatePosted).toHaveBeenCalledWith([]);
  });
});