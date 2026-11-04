import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCvBuilderPageViewModel } from "./useCvBuilderPageViewModel";

const mocks = vi.hoisted(() => ({
  getGuestApplicationDrafts: vi.fn(),
  parseResume: vi.fn(),
  handleDone: vi.fn(),
  handleUploadFileSelect: vi.fn(),
  navigate: vi.fn(),
  openBuildFlow: vi.fn(),
  openReviewFlowBlank: vi.fn(),
  openUploadPicker: vi.fn(),
  selectBuildMyCv: vi.fn(),
  selectBuildMyCvExists: vi.fn(),
  selectBuildMyCvLoaded: vi.fn(),
  selectUploadFile: vi.fn(),
  uploadDocument: vi.fn(),
  useAuth: vi.fn(),
  useBuildMyCvQuery: vi.fn(),
  useCandidateProfileQuery: vi.fn(),
  useCandidateResourceId: vi.fn(),
  useCvBuilder: vi.fn(),
  useCvBuilderDone: vi.fn(),
  useLocation: vi.fn(),
  useSelector: vi.fn(),
  useUploadDocumentMutation: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useSelector: mocks.useSelector,
}));

vi.mock("react-router-dom", () => ({
  useLocation: mocks.useLocation,
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/app/auth/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/services/api/aiApi", () => ({
  aiApi: {
    parseResume: mocks.parseResume,
  },
}));

vi.mock("../utils/extractResumeText", () => ({
  extractResumeText: vi.fn().mockResolvedValue("cv"),
}));

vi.mock("@/app/formatEnumLabel", () => ({
  formatEnumLabel: (value?: string) => value ?? "",
}));

vi.mock("@/modules/candidate/hooks/useCandidateQueries", () => ({
  useBuildMyCvQuery: mocks.useBuildMyCvQuery,
  useCandidateProfileQuery: mocks.useCandidateProfileQuery,
  useCandidateResourceId: mocks.useCandidateResourceId,
}));

vi.mock("@/modules/candidate/utils/guestApplicationDraft", () => ({
  getGuestApplicationDrafts: mocks.getGuestApplicationDrafts,
}));

vi.mock("@/store/api/apiSlice", () => ({
  useUploadDocumentMutation: mocks.useUploadDocumentMutation,
}));

vi.mock("@/store/selectors", () => ({
  selectBuildMyCv: mocks.selectBuildMyCv,
  selectBuildMyCvExists: mocks.selectBuildMyCvExists,
  selectBuildMyCvLoaded: mocks.selectBuildMyCvLoaded,
}));

vi.mock("./useCvBuilder", () => ({
  default: mocks.useCvBuilder,
}));

vi.mock("./useCvBuilderDone", async () => {
  const actual = await vi.importActual<typeof import("./useCvBuilderDone")>("./useCvBuilderDone");
  return {
    ...actual,
    useCvBuilderDone: mocks.useCvBuilderDone,
  };
});

const selectedUploadFile = new File(["cv"], "jane-cv.pdf", { type: "application/pdf" });

const form = {
  formState: { isDirty: false },
  getValues: vi.fn(),
  getFieldState: vi.fn(),
  trigger: vi.fn(),
};

const savedCv = {
  personalDetails: {
    firstName: "Jane",
    lastName: "Doe",
    location: "Cape Town",
    nationality: "South African",
    noticePeriod: "1 month",
    currentCompany: "Acme",
    currentPosition: "Engineer",
    race: "African",
    gender: "Female",
    disabilityStatus: "No",
  },
  careerHistory: [
    {
      company: "Acme",
      jobTitle: "Engineer",
      startDate: "2020-01",
      endDate: "Present",
      responsibilities: "Built UI",
      projects: ["Analytics dashboard", "Reporting portal"],
    },
  ],
  skills: ["React"],
  education: {
    tertiaryEducation: [{ institution: "UCT", qualification: "BSc", yearCompleted: 2020 }],
    secondaryEducation: [{ schoolName: "High School", qualification: "Grade 12", yearCompleted: 2015 }],
  },
  languages: [
    { language: "English", proficiency: "Fluent" },
    { language: "Klingon", proficiency: "Conversational" },
  ],
  validation: [],
};

const candidateProfile = {
  personalDetails: {
    firstName: "Jane",
    lastName: "Doe",
    nationality: "South African",
    location: "Cape Town",
  },
  desiredJob: { jobTitle: "Engineer", availableFrom: "Immediately" },
  experience: [],
};

describe("useCvBuilderPageViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ user: { userId: "u-1", role: "JOB_SEEKER" } });
    mocks.useLocation.mockReturnValue({ search: "", state: null });
    mocks.useCandidateResourceId.mockReturnValue("c-1");
    mocks.getGuestApplicationDrafts.mockReturnValue([]);
    mocks.parseResume.mockResolvedValue({});
    mocks.useBuildMyCvQuery.mockReturnValue({ isLoading: false });
    mocks.useCandidateProfileQuery.mockReturnValue({ data: candidateProfile });
    mocks.useSelector.mockImplementation((selector: unknown) => {
      if (selector === mocks.selectBuildMyCv) return savedCv;
      if (selector === mocks.selectBuildMyCvLoaded) return true;
      if (selector === mocks.selectBuildMyCvExists) return true;
      return undefined;
    });
    mocks.uploadDocument.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.useUploadDocumentMutation.mockReturnValue([mocks.uploadDocument, { isLoading: false }]);
    mocks.useCvBuilder.mockReturnValue({
      form,
      uploadInputRef: { current: null },
      activeView: "launcher",
      reviewSource: "build",
      selectedUploadFile,
      canViewCv: true,
      selectedLanguageEntries: ["English"],
      handleUploadFileSelect: mocks.handleUploadFileSelect,
      selectUploadFile: mocks.selectUploadFile,
      openUploadPicker: mocks.openUploadPicker,
      openBuildFlow: mocks.openBuildFlow,
      openReviewFlowBlank: mocks.openReviewFlowBlank,
      goBack: vi.fn(),
    });
    mocks.useCvBuilderDone.mockReturnValue({
      handleDone: mocks.handleDone,
      isSavingCandidateProfile: false,
    });
  });

  it("prefills useCvBuilder from the saved CV record before falling back to profile data", () => {
    const { result } = renderHook(() => useCvBuilderPageViewModel());

    expect(mocks.useBuildMyCvQuery).toHaveBeenCalledWith(true, "c-1");
    expect(mocks.useCandidateProfileQuery).toHaveBeenCalledWith("c-1", "u-1", true);
    expect(mocks.useCvBuilderDone).toHaveBeenCalledWith(
      expect.objectContaining({ candidateId: "c-1" }),
    );
    expect(mocks.useCvBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        personalDetails: expect.objectContaining({
          fullName: "Jane Doe",
          residentialLocation: "Cape Town",
          currentCompany: "Acme",
        }),
        careerHistory: [
          expect.objectContaining({
            companyName: "Acme",
            positionHeld: "Engineer",
            startDate: "January 2020",
            endDate: "Present",
            isCurrentRole: true,
            projects: ["Analytics dashboard", "Reporting portal"],
          }),
        ],
        skills: [{ name: "React" }],
        languages: ["English", "Other"],
        otherLanguage: "Klingon",
      }),
      true,
      undefined,
      false,
    );
    expect(result.current.heroHeading).toBe("CV Builder");
    expect(result.current.actionCards[0]).toMatchObject({
      id: "upload",
      description: "Upload your CV directly from your computer.",
      tone: "coral",
    });
  });

  it.each([
    {
      savedLanguages: ["English", "Setswana (Tswana)", "Hindi"],
      languages: ["English", "Setswana (Tswana)", "Other"],
      otherLanguage: "Hindi",
    },
    {
      savedLanguages: ["English", " Hindi ", "French"],
      languages: ["English", "Other"],
      otherLanguage: "Hindi, French",
    },
    {
      savedLanguages: ["English"],
      languages: ["English"],
      otherLanguage: "",
    },
    {
      savedLanguages: [],
      languages: [],
      otherLanguage: "",
    },
  ])("prefills language selections from $savedLanguages", ({ savedLanguages, languages, otherLanguage }) => {
    mocks.useSelector.mockImplementation((selector: unknown) => {
      if (selector === mocks.selectBuildMyCv) {
        return {
          ...savedCv,
          languages: savedLanguages.map((language) => ({ language, proficiency: "Fluent" })),
        };
      }
      if (selector === mocks.selectBuildMyCvLoaded) return true;
      if (selector === mocks.selectBuildMyCvExists) return true;
      return undefined;
    });

    renderHook(() => useCvBuilderPageViewModel());

    expect(mocks.useCvBuilder).toHaveBeenCalledWith(
      expect.objectContaining({ languages, otherLanguage }),
      true,
      undefined,
      false,
    );
  });

  it("focuses the current invalid CV field even when rendered form errors are stale", async () => {
    form.trigger.mockResolvedValue(false);
    form.getValues.mockReturnValue({ personalDetails: { fullName: "" } });
    form.getFieldState.mockReturnValue({
      error: { fullName: { type: "required", message: "Full name is required" } },
    });
    render(
      <div data-field="personalDetails.fullName" data-testid="cv-field">
        <input aria-label="Full name" />
      </div>,
    );
    screen.getByTestId("cv-field").scrollIntoView = vi.fn();
    renderHook(() => useCvBuilderPageViewModel());
    const { validateForm } = mocks.useCvBuilderDone.mock.calls.at(-1)![0];

    await act(async () => {
      expect(await validateForm()).toBe(false);
    });

    expect(form.trigger).toHaveBeenCalledWith(undefined, { shouldFocus: true });
    expect(form.getFieldState).toHaveBeenCalledWith("personalDetails");
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
  });

  it("derives current employment fields from the current saved CV experience", () => {
    const savedCvWithoutCurrentEmploymentFields = {
      ...savedCv,
      personalDetails: {
        ...savedCv.personalDetails,
        currentCompany: undefined,
        currentPosition: undefined,
      },
      careerHistory: [
        {
          company: "Accenture",
          jobTitle: "App Developer",
          startDate: "2021-01-01",
          endDate: "Present",
          responsibilities: "Built applications",
        },
      ],
    };
    mocks.useSelector.mockImplementation((selector: unknown) => {
      if (selector === mocks.selectBuildMyCv) return savedCvWithoutCurrentEmploymentFields;
      if (selector === mocks.selectBuildMyCvLoaded) return true;
      if (selector === mocks.selectBuildMyCvExists) return true;
      return undefined;
    });

    renderHook(() => useCvBuilderPageViewModel());

    expect(mocks.useCvBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        personalDetails: expect.objectContaining({
          currentCompany: "Accenture",
          currentPosition: "App Developer",
        }),
      }),
      true,
      undefined,
      false,
    );
  });

  it("falls back to candidate profile prefill when saved CV data is not loaded", () => {
    mocks.useSelector.mockImplementation((selector: unknown) => {
      if (selector === mocks.selectBuildMyCv) return undefined;
      if (selector === mocks.selectBuildMyCvLoaded) return false;
      if (selector === mocks.selectBuildMyCvExists) return false;
      return undefined;
    });

    renderHook(() => useCvBuilderPageViewModel());

    expect(mocks.useCvBuilder).toHaveBeenCalledWith(
      expect.objectContaining({
        personalDetails: expect.objectContaining({
          fullName: "Jane Doe",
          residentialLocation: "Cape Town",
          currentPosition: "Engineer",
        }),
      }),
      false,
      undefined,
      false,
    );
  });

  it("uses the profile response candidate ID for newly created candidate resources", () => {
    mocks.useCandidateResourceId.mockReturnValue("u-1");
    mocks.useCandidateProfileQuery.mockReturnValue({
      data: { ...candidateProfile, candidateId: "c-created" },
    });

    renderHook(() => useCvBuilderPageViewModel());

    expect(mocks.useCandidateProfileQuery).toHaveBeenCalledWith("u-1", "u-1", true);
    expect(mocks.useBuildMyCvQuery).toHaveBeenCalledWith(true, "c-created");
    expect(mocks.useCvBuilderDone).toHaveBeenCalledWith(
      expect.objectContaining({ candidateId: "c-created" }),
    );
  });

  it("derives guest application hero state and back navigation", () => {
    mocks.useAuth.mockReturnValue({ user: undefined });
    mocks.useLocation.mockReturnValue({ search: "?job=job-1", state: null });
    mocks.getGuestApplicationDrafts.mockReturnValue([
      {
        jobId: "job-1",
        jobTitle: "Frontend Engineer",
        applicationStatus: "pending-authentication",
        expiresAt: "2099-01-01T00:00:00.000Z",
        job: {
          jobId: "job-1",
          title: "Frontend Engineer",
          industry: "Technology",
          location: "Cape Town, Western Cape",
          workType: "Remote",
          employmentType: "Permanent",
        },
      },
    ]);

    const { result } = renderHook(() => useCvBuilderPageViewModel());

    expect(result.current.isGuestApplication).toBe(true);
    expect(result.current.heroHeading).toBe("Frontend Engineer");
    expect(result.current.guestJobTags).toEqual(["Technology", "Cape Town", "Remote", "Permanent"]);

    act(() => {
      result.current.heroBackHandler?.();
    });

    expect(mocks.navigate).toHaveBeenCalledWith("/jobs/job-1");
  });

  it("uploads a selected resume for authenticated candidates before opening blank review", async () => {
    mocks.parseResume.mockResolvedValue({
      personal_details: {
        first_name: "Ben",
        last_name: "Hur",
      },
    });

    const { result } = renderHook(() => useCvBuilderPageViewModel());

    await act(async () => {
      await result.current.handleUploadDone();
    });

    expect(mocks.uploadDocument).toHaveBeenCalledWith({
      candidateId: "c-1",
      file: selectedUploadFile,
      fileName: "jane-cv.pdf",
      documentType: "RESUME",
    });
    expect(mocks.parseResume).toHaveBeenCalledWith({
      extracted_text: "cv",
      owner_type: "CANDIDATE",
    });
    expect(mocks.openReviewFlowBlank).toHaveBeenCalled();
    expect(mocks.openReviewFlowBlank).toHaveBeenCalledWith(
      expect.objectContaining({
        personalDetails: expect.objectContaining({
          fullName: "Ben Hur",
          currentCompany: "Acme",
          currentPosition: "Engineer",
          noticePeriod: "1 month",
        }),
      }),
    );
    expect(result.current.uploadModalOpen).toBe(false);
  });

  it("reports when a new candidate identity is not ready for upload", async () => {
    mocks.useCandidateResourceId.mockReturnValue("");
    const { result } = renderHook(() => useCvBuilderPageViewModel());

    await act(async () => {
      await result.current.handleUploadDone();
    });

    expect(mocks.uploadDocument).not.toHaveBeenCalled();
    expect(result.current.uploadError).toBe(
      "Your candidate profile is still loading. Please try again shortly.",
    );
  });

  it("reports upload pipeline failures", async () => {
    mocks.parseResume.mockRejectedValue(new Error("Parsing failed"));
    const { result } = renderHook(() => useCvBuilderPageViewModel());

    await act(async () => {
      await result.current.handleUploadDone();
    });

    expect(result.current.uploadError).toBe(
      "We could not process your CV. Please try again.",
    );
  });

  it("reports a recoverable error when the parsed resume upload fails", async () => {
    mocks.parseResume.mockResolvedValue({
      personal_details: { first_name: "Ben", last_name: "Hur" },
    });
    mocks.uploadDocument.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("Upload failed")),
    });

    const { result } = renderHook(() => useCvBuilderPageViewModel());

    await act(async () => {
      await result.current.handleUploadDone();
    });

    expect(result.current.uploadError).toBe(
      "We could not process your CV. Please try again.",
    );
    expect(mocks.openReviewFlowBlank).not.toHaveBeenCalled();
  });

  it("skips upload API for guest applications and opens blank review", async () => {
    mocks.useAuth.mockReturnValue({ user: undefined });
    mocks.getGuestApplicationDrafts.mockReturnValue([
      {
        jobId: "job-1",
        jobTitle: "Frontend Engineer",
        applicationStatus: "pending-authentication",
        expiresAt: "2099-01-01T00:00:00.000Z",
        job: { jobId: "job-1", title: "Frontend Engineer" },
      },
    ]);

    const { result } = renderHook(() => useCvBuilderPageViewModel());

    await act(async () => {
      await result.current.handleUploadDone();
    });

    expect(mocks.uploadDocument).not.toHaveBeenCalled();
    expect(mocks.parseResume).toHaveBeenCalledWith({
      extracted_text: "cv",
      owner_type: "VISITOR",
    });
    expect(mocks.openReviewFlowBlank).toHaveBeenCalled();
  });
});