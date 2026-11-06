import { act, renderHook, waitFor } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, it } from "vitest";
import useCvBuilder, { type CvBuilderPrefillData } from "./useCvBuilder";

const completePrefill: CvBuilderPrefillData = {
  personalDetails: {
    fullName: "Jane Doe",
    race: "african",
    gender: "Female",
    disabilityStatus: "None",
    nationality: "South African",
    residentialLocation: "Cape Town",
    currentCompany: "",
    currentPosition: "",
    noticePeriod: "",
  },
  skills: [{ name: "React" }],
  tertiaryEducation: [
    { institutionName: "UCT", degreeOrCertification: "BSc", yearCompleted: "2020" },
  ],
  secondaryEducation: [
    { institutionName: "High School", highestGradePassed: "Grade 12", yearCompleted: "2015" },
  ],
  languages: ["English"],
};

const incompletePrefill: CvBuilderPrefillData = {
  personalDetails: { fullName: "Jane Doe" },
};

describe("useCvBuilder", () => {
  it("starts on the launcher view with no validation errors and cannot view the CV", () => {
    const { result } = renderHook(() => useCvBuilder());

    expect(result.current.activeView).toBe("launcher");
    expect(result.current.canViewCv).toBe(false);
    expect(result.current.form.formState.errors).toEqual({});
  });

  it("does not surface validation errors after a forced prefill of incomplete data", async () => {
    const { result } = renderHook(() => useCvBuilder(incompletePrefill, true));

    await waitFor(() =>
      expect(result.current.form.getValues("personalDetails.fullName")).toBe("Jane Doe"),
    );
    expect(result.current.form.formState.errors).toEqual({});
  });

  it("does not surface validation errors after a merged (non-forced) prefill", async () => {
    const { result } = renderHook(() => useCvBuilder(incompletePrefill, false));

    await waitFor(() =>
      expect(result.current.form.getValues("personalDetails.fullName")).toBe("Jane Doe"),
    );
    expect(result.current.form.formState.errors).toEqual({});
  });

  it("normalises select values case-insensitively and enables View CV for complete data", async () => {
    const { result } = renderHook(() => useCvBuilder(completePrefill, true));

    await waitFor(() => expect(result.current.canViewCv).toBe(true));
    expect(result.current.form.getValues("personalDetails.race")).toBe("African");
  });

  it("merges prefill without overwriting values the user already entered", async () => {
    const { result, rerender } = renderHook(
      ({ prefill }: { prefill?: CvBuilderPrefillData }) => useCvBuilder(prefill, false),
      { initialProps: { prefill: undefined as CvBuilderPrefillData | undefined } },
    );

    act(() => {
      result.current.form.setValue("personalDetails.fullName", "Typed Name");
    });
    rerender({ prefill: completePrefill });

    await waitFor(() =>
      expect(result.current.form.getValues("skills")).toEqual([{ name: "React" }]),
    );
    expect(result.current.form.getValues("personalDetails.fullName")).toBe("Typed Name");
    expect(result.current.form.getValues("languages")).toEqual(["English"]);
  });

  it("clears career history errors when current company is empty", async () => {
    const { result } = renderHook(() => useCvBuilder());

    act(() => {
      result.current.form.setError("careerHistory", { message: "Required" });
      result.current.form.setValue("personalDetails.currentCompany", "Acme");
    });
    act(() => {
      result.current.form.setValue("personalDetails.currentCompany", "");
    });

    await waitFor(() =>
      expect(result.current.form.formState.errors.careerHistory).toBeUndefined(),
    );
  });

  it("requires career history only when a current company is set", async () => {
    const { result } = renderHook(() => useCvBuilder(completePrefill, true));
    await waitFor(() => expect(result.current.canViewCv).toBe(true));

    act(() => {
      result.current.form.setValue("careerHistory", []);
    });
    expect(result.current.canViewCv).toBe(true);

    act(() => {
      result.current.form.setValue("personalDetails.currentCompany", "Acme");
      result.current.form.setValue("personalDetails.currentPosition", "Engineer");
      result.current.form.setValue("personalDetails.noticePeriod", "1_MONTH");
    });
    await waitFor(() => expect(result.current.canViewCv).toBe(false));

    act(() => {
      result.current.form.setValue("careerHistory", [
        {
          companyName: "Acme",
          positionHeld: "Engineer",
          startDate: "January 2020",
          endDate: "Present",
          isCurrentRole: true,
          tasks: [""],
          projects: [""],
        },
      ]);
    });
    await waitFor(() => expect(result.current.canViewCv).toBe(true));
  });

  it("toggles languages and builds entries including a custom Other language", () => {
    const { result } = renderHook(() => useCvBuilder());

    act(() => {
      result.current.toggleLanguage("English");
      result.current.toggleLanguage("Other");
    });
    act(() => {
      result.current.updateOtherLanguage(" Klingon ");
    });

    expect(result.current.selectedLanguages.has("English")).toBe(true);
    expect(result.current.selectedLanguageEntries).toEqual(["English", "Klingon"]);

    act(() => {
      result.current.toggleLanguage("Other");
    });

    expect(result.current.otherLanguage).toBe("");
    expect(result.current.selectedLanguageEntries).toEqual(["English"]);
  });

  it("normalises ISO career dates and flags current roles", () => {
    const { result } = renderHook(() => useCvBuilder());

    act(() => {
      result.current.form.setValue("careerHistory.0.startDate", "2021-03-15");
      result.current.form.setValue("careerHistory.0.endDate", "Present");
    });
    act(() => {
      result.current.normalizeCareerDate(0, "startDate");
      result.current.normalizeCareerDate(0, "endDate");
    });

    expect(result.current.form.getValues("careerHistory.0.startDate")).toBe("15 March 2021");
    expect(result.current.form.getValues("careerHistory.0.isCurrentRole")).toBe(true);
  });

  it("switches between launcher and review flows", () => {
    const { result } = renderHook(() => useCvBuilder());

    act(() => result.current.openBuildFlow());
    expect(result.current.activeView).toBe("review");
    expect(result.current.reviewSource).toBe("build");

    act(() => result.current.goBack());
    expect(result.current.activeView).toBe("launcher");

    act(() => result.current.openReviewFlowBlank(incompletePrefill));
    expect(result.current.activeView).toBe("review");
    expect(result.current.reviewSource).toBe("upload");
    expect(result.current.form.getValues("personalDetails.fullName")).toBe("Jane Doe");
  });

  it("replaces saved details and ignores later saved prefill updates after an upload", async () => {
    const { result, rerender } = renderHook(
      ({ prefill }: { prefill: CvBuilderPrefillData }) => useCvBuilder(prefill, true),
      { initialProps: { prefill: completePrefill } },
    );

    await waitFor(() => expect(result.current.form.getValues("secondaryEducation")).toEqual(completePrefill.secondaryEducation));
    act(() => result.current.openReviewFlowBlank({
      personalDetails: { fullName: "Ben Hur" },
      skills: [{ name: "TypeScript" }],
    }));
    rerender({ prefill: { ...completePrefill } });

    expect(result.current.form.getValues("personalDetails.fullName")).toBe("Ben Hur");
    expect(result.current.form.getValues("personalDetails.nationality")).toBe("");
    expect(result.current.form.getValues("secondaryEducation")).toEqual([
      { institutionName: "", highestGradePassed: "", yearCompleted: "" },
    ]);
    expect(result.current.form.getValues("tertiaryEducation")).toEqual([
      { institutionName: "", degreeOrCertification: "", yearCompleted: "" },
    ]);
    expect(result.current.form.getValues("skills")).toEqual([{ name: "TypeScript" }]);
    expect(result.current.form.getValues("languages")).toEqual([]);
  });

  it("tracks the selected upload file and resets the native input", () => {
    const { result } = renderHook(() => useCvBuilder());
    const file = new File(["cv"], "cv.pdf", { type: "application/pdf" });
    const target = { files: [file], value: "C:\\fakepath\\cv.pdf" };

    act(() => {
      result.current.handleUploadFileSelect({ target } as unknown as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.selectedUploadFile).toBe(file);
    expect(target.value).toBe("");

    act(() => result.current.selectUploadFile(null));
    expect(result.current.selectedUploadFile).toBeNull();
  });
});
