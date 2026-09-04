import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCandidateProfileViewModel } from "./useCandidateProfileViewModel";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  getCandidateProfileUpdatePayload: vi.fn(),
  getProfileFormValues: vi.fn(),
  getValues: vi.fn(),
  navigate: vi.fn(),
  reset: vi.fn(),
  saveProfileThunk: vi.fn(),
  trigger: vi.fn(),
  useAuth: vi.fn(),
  useCandidateProfileQuery: vi.fn(),
  useCandidateResourceId: vi.fn(),
  useIndustryOptions: vi.fn(),
  useUserProfile: vi.fn(),
  useZodForm: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/hooks/useZodForm", () => ({
  useZodForm: mocks.useZodForm,
}));

vi.mock("@/store/slices/candidateThunks", () => ({
  saveProfileThunk: mocks.saveProfileThunk,
}));

vi.mock("@/modules/candidate/hooks/useIndustryOptions", () => ({
  useIndustryOptions: mocks.useIndustryOptions,
}));

vi.mock("@/modules/candidate/pages/profileForm.config", () => ({
  PROFILE_SELECT_OPTIONS: {
    targetedIndustries: ["Technology", "Finance"],
  },
  getCandidateProfileUpdatePayload: mocks.getCandidateProfileUpdatePayload,
  getProfileFormValues: mocks.getProfileFormValues,
  profileFormSchema: {},
}));

vi.mock("@/modules/candidate/hooks/useCandidateQueries", () => ({
  useCandidateProfileQuery: mocks.useCandidateProfileQuery,
  useCandidateResourceId: mocks.useCandidateResourceId,
  useUserProfile: mocks.useUserProfile,
}));

const candidateProfile = {
  personalDetails: {
    profileImageUrl: "https://example.com/profile.jpg",
  },
};

describe("useCandidateProfileViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ user: { userId: "u-1" } });
    mocks.useCandidateResourceId.mockReturnValue("c-1");
    mocks.useCandidateProfileQuery.mockReturnValue({
      data: candidateProfile,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: undefined,
    });
    mocks.useUserProfile.mockReturnValue({
      data: { authentication: { password: "masked" } },
    });
    mocks.useIndustryOptions.mockReturnValue(["Technology"]);
    mocks.getProfileFormValues.mockReturnValue({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "0821234567",
      residentialLocation: "Cape Town",
      preferredJobTitle: "Designer",
      targetedIndustries: "Technology",
      preferredLocations: "Remote",
      employmentType: "Permanent",
      availability: "Immediately",
      password: "",
    });
    mocks.getCandidateProfileUpdatePayload.mockReturnValue({ personalDetails: { firstName: "Jane" } });
    mocks.getValues.mockReturnValue({ fullName: "Jane Doe" });
    mocks.trigger.mockResolvedValue(true);
    mocks.useZodForm.mockReturnValue({
      control: { name: "control" },
      formState: { isDirty: false },
      getValues: mocks.getValues,
      reset: mocks.reset,
      trigger: mocks.trigger,
    });
    mocks.dispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(candidateProfile),
    });
  });

  it("returns profile rendering state and resets form values from loaded data", () => {
    const { result } = renderHook(() => useCandidateProfileViewModel());

    expect(mocks.useCandidateProfileQuery).toHaveBeenCalledWith("c-1", "u-1", true);
    expect(mocks.useUserProfile).toHaveBeenCalledWith("u-1");
    expect(mocks.useIndustryOptions).toHaveBeenCalledWith(["Technology", "Finance"]);
    expect(mocks.reset).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Jane Doe",
        password: "masked",
      }),
    );
    expect(result.current).toMatchObject({
      activeProfilePhotoUrl: "https://example.com/profile.jpg",
      industryOptions: ["Technology"],
      isDesiredEditing: false,
      isDirty: false,
      isInitialProfileLoading: false,
      isMissingUser: false,
      isPersonalEditing: false,
      loadErrorMessage: "Failed to load profile.",
    });
    expect(result.current.control).toEqual({ name: "control" });
  });

  it("toggles edit state through exposed handlers", () => {
    const { result } = renderHook(() => useCandidateProfileViewModel());

    act(() => {
      result.current.handleEditPersonal();
      result.current.handleEditDesired();
    });

    expect(result.current.isPersonalEditing).toBe(true);
    expect(result.current.isDesiredEditing).toBe(true);
  });

  it("navigates directly when the profile form has no dirty changes", async () => {
    const { result } = renderHook(() => useCandidateProfileViewModel());

    await act(async () => {
      await result.current.handleDashboard();
    });

    expect(mocks.trigger).not.toHaveBeenCalled();
    expect(mocks.saveProfileThunk).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith("/candidate/dashboard");
  });

  it("validates and saves dirty profile changes before navigating", async () => {
    mocks.useZodForm.mockReturnValue({
      control: { name: "control" },
      formState: { isDirty: true },
      getValues: mocks.getValues,
      reset: mocks.reset,
      trigger: mocks.trigger,
    });

    const { result } = renderHook(() => useCandidateProfileViewModel());

    await act(async () => {
      await result.current.handleDashboard();
    });

    expect(mocks.trigger).toHaveBeenCalled();
    expect(mocks.getCandidateProfileUpdatePayload).toHaveBeenCalledWith(
      { fullName: "Jane Doe" },
      candidateProfile,
    );
    expect(mocks.saveProfileThunk).toHaveBeenCalledWith({
      userId: "u-1",
      payload: { personalDetails: { firstName: "Jane" } },
    });
    expect(mocks.dispatch).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith("/candidate/dashboard");
  });

  it("exposes missing-user and loading derived states", () => {
    mocks.useAuth.mockReturnValue({ user: undefined });
    mocks.useCandidateProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      error: undefined,
    });

    const { result } = renderHook(() => useCandidateProfileViewModel());

    expect(result.current.isMissingUser).toBe(true);
    expect(result.current.isInitialProfileLoading).toBe(true);
  });
});