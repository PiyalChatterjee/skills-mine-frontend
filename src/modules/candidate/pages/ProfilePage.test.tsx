import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./ProfilePage";

const mocks = vi.hoisted(() => ({
  useCandidateProfileViewModel: vi.fn(),
}));

vi.mock("@/modules/candidate/hooks/useCandidateProfileViewModel", () => ({
  useCandidateProfileViewModel: mocks.useCandidateProfileViewModel,
}));

vi.mock("@/hooks/usePageTitle", () => ({ usePageTitle: vi.fn() }));

vi.mock("@/modules/candidate/components/ProfileFormFields", () => ({
  formatProfileLabel: (label: string) => label,
  ProfileSelectField: () => null,
  ProfileTextField: () => null,
}));

const buildViewModel = (overrides: Record<string, unknown> = {}) => ({
  activeProfilePhotoUrl: null,
  control: {},
  handleDashboard: vi.fn(),
  handleEditDesired: vi.fn(),
  handleEditPersonal: vi.fn(),
  handleProfilePhotoSelect: vi.fn(),
  handleUploadPhotoClick: vi.fn(),
  industryOptions: [],
  isDesiredEditing: false,
  isDirty: false,
  isError: false,
  isFetching: false,
  isInitialProfileLoading: false,
  isLoading: false,
  isMissingUser: false,
  isPersonalEditing: false,
  loadErrorMessage: "",
  profilePhotoInputRef: { current: null },
  ...overrides,
});

describe("ProfilePage footer button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the dashboard label when nothing is being edited", () => {
    mocks.useCandidateProfileViewModel.mockReturnValue(buildViewModel());
    render(<ProfilePage />);

    expect(screen.getByRole("button", { name: "Go to Your Dashboard" })).toBeInTheDocument();
  });

  it.each([
    ["personal section is in edit mode", { isPersonalEditing: true }],
    ["desired section is in edit mode", { isDesiredEditing: true }],
    ["form has changes", { isDirty: true }],
  ])("shows Save Changes when the %s", (_label, overrides) => {
    mocks.useCandidateProfileViewModel.mockReturnValue(buildViewModel(overrides));
    render(<ProfilePage />);

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });
});
