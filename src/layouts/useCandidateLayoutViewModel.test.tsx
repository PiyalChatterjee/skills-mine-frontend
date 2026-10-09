import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCandidateLayoutViewModel } from "./useCandidateLayoutViewModel";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  fetchCandidateProfileThunk: vi.fn(),
  isJwtExpired: vi.fn(),
  navigate: vi.fn(),
  unsubscribe: vi.fn(),
  useAuth: vi.fn(),
  useLocation: vi.fn(),
  isOnboarding: false,
}));

vi.mock("@/modules/candidate/hooks/useCandidateOnboardingStatus", () => ({
  useCandidateOnboardingStatus: () => ({ isOnboarding: mocks.isOnboarding }),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
}));

vi.mock("react-router-dom", () => ({
  useLocation: mocks.useLocation,
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/app/auth/jwt", () => ({
  isJwtExpired: mocks.isJwtExpired,
}));

vi.mock("@/store/slices/candidateThunks", () => ({
  fetchCandidateProfileThunk: mocks.fetchCandidateProfileThunk,
}));

describe("useCandidateLayoutViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnboarding = false;
    mocks.useLocation.mockReturnValue({ pathname: "/candidate/dashboard" });
    mocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      tokens: { accessToken: "token" },
      user: { role: "JOB_SEEKER", userId: "u-1", candidateId: "c-1" },
    });
    mocks.isJwtExpired.mockReturnValue(false);
    mocks.fetchCandidateProfileThunk.mockReturnValue({ type: "candidate/fetchProfile" });
    mocks.dispatch.mockReturnValue({ unsubscribe: mocks.unsubscribe });
  });

  it("prefetches the candidate profile and builds candidate nav state", () => {
    const { result, unmount } = renderHook(() => useCandidateLayoutViewModel());

    expect(mocks.fetchCandidateProfileThunk).toHaveBeenCalledWith("c-1", "u-1");
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: "candidate/fetchProfile" });
    expect(result.current.canAccessProtectedRoutes).toBe(true);
    expect(result.current.candidateNavItems.map((item) => item.id)).toEqual([
      "candidateDashboard",
      "candidateSavedJobPosts",
      "candidateCvBuilder",
      "candidateSkillsBuild",
      "candidateCareerSupport",
    ]);
    expect(result.current.candidateNavItems[0].isActive).toBe(true);

    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });

  it("keeps nav visible but blocks internal navigation while onboarding", () => {
    mocks.isOnboarding = true;
    const preventDefault = vi.fn();
    const { result } = renderHook(() => useCandidateLayoutViewModel());

    expect(result.current.candidateNavItems.map((item) => item.id)).toEqual([
      "candidateDashboard",
      "candidateSavedJobPosts",
      "candidateCvBuilder",
      "candidateSkillsBuild",
      "candidateCareerSupport",
    ]);

    result.current.handleProtectedNavClick({ preventDefault } as never, "/jobs/saved");
    act(() => {
      result.current.handleSearchClick();
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(result.current.isSearchModalOpen).toBe(false);
  });

  it("routes action-based nav items only when onboarding is complete", () => {
    mocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      tokens: { accessToken: "token" },
      user: { role: "RECRUITER", userId: "u-2" },
    });
    const { result, rerender } = renderHook(() => useCandidateLayoutViewModel());
    const findItem = (id: string) =>
      result.current.candidateNavItems.find((item) => item.id === id);

    act(() => {
      findItem("recruiterSavedJobPosts")?.onClick?.();
      findItem("recruiterCvBuilder")?.onClick?.();
    });
    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/saved");
    expect(mocks.navigate).toHaveBeenCalledWith("/candidate/cv-builder");

    mocks.navigate.mockClear();
    mocks.isOnboarding = true;
    rerender();
    act(() => {
      findItem("recruiterSavedJobPosts")?.onClick?.();
      findItem("recruiterCvBuilder")?.onClick?.();
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("allows protected nav clicks through for an authenticated, onboarded user", () => {
    const preventDefault = vi.fn();
    const { result } = renderHook(() => useCandidateLayoutViewModel());

    result.current.handleProtectedNavClick({ preventDefault } as never, "/jobs/saved");

    expect(preventDefault).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("opens and closes the search modal through exposed handlers", () => {
    const { result } = renderHook(() => useCandidateLayoutViewModel());

    expect(result.current.isSearchModalOpen).toBe(false);

    act(() => {
      result.current.handleSearchClick();
    });
    expect(result.current.isSearchModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseSearch();
    });
    expect(result.current.isSearchModalOpen).toBe(false);
  });

  it("redirects protected nav clicks to login when the token is expired", () => {
    mocks.isJwtExpired.mockReturnValue(true);
    const preventDefault = vi.fn();
    const { result } = renderHook(() => useCandidateLayoutViewModel());

    result.current.handleProtectedNavClick(
      { preventDefault } as never,
      "/jobs/saved",
    );

    expect(result.current.canAccessProtectedRoutes).toBe(false);
    expect(preventDefault).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith("/login", {
      state: { from: "/jobs/saved" },
    });
  });

  it("preserves candidate header route targets and action callbacks", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() => useCandidateLayoutViewModel());
    const savedJobs = result.current.candidateNavItems.find((item) => item.id === "candidateSavedJobPosts");
    const cvBuilder = result.current.candidateNavItems.find((item) => item.id === "candidateCvBuilder");
    const skillsBuild = result.current.candidateNavItems.find((item) => item.id === "candidateSkillsBuild");

    act(() => {
      skillsBuild?.onClick?.();
    });

    expect(savedJobs?.to).toBe("/jobs/saved");
    expect(cvBuilder?.to).toBe("/candidate/cv-builder");
    expect(open).toHaveBeenCalledWith("https://skillsbuild.org/", "_blank");
    open.mockRestore();
  });
});