import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cvBuilderSchema,
  personalDetailsSchema,
  careerHistoryEntrySchema,
  tertiaryEntrySchema,
  secondaryEntrySchema,
  type CvBuilderFormValues,
} from "../types/cvBuilderSchema";
import {
  CV_BUILDER_STEPS,
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  LANGUAGES_LIST,
  LOCATION_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
  type CvBuilderView,
  type Language,
} from "../types/cvBuilder";

const FIRST_STEP = 1;
const LAST_STEP = CV_BUILDER_STEPS.length;

const isoYearMonthPattern = /^(19|20)\d{2}-(0[1-9]|1[0-2])$/;
const currentRolePattern = /^(present|current)$/i;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const normalizeCareerDateValue = (value: string): string => {
  const normalized = value.trim();
  const isoMatch = normalized.match(isoYearMonthPattern);
  if (!isoMatch) return value;
  const year = normalized.slice(0, 4);
  const monthIndex = Number(normalized.slice(5, 7)) - 1;
  const monthName = monthNames[monthIndex];
  if (!monthName) return value;
  return `${monthName},${year}`;
};

const DEFAULT_FORM_VALUES: CvBuilderFormValues = {
  personalDetails: {
    fullName: "",
    race: "",
    gender: "",
    disabilityStatus: "",
    nationality: "",
    residentialLocation: "",
    currentCompany: "",
    currentPosition: "",
    noticePeriod: "",
  },
  careerHistory: [
    {
      companyName: "",
      positionHeld: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      tasks: [""],
      projects: [""],
    },
  ],
  skills: [{ name: "" }],
  tertiaryEducation: [
    { institutionName: "", degreeOrCertification: "", yearCompleted: "" },
  ],
  secondaryEducation: [
    { institutionName: "", highestGradePassed: "", yearCompleted: "" },
  ],
  languages: [],
  otherLanguage: "",
};

const PERSONAL_FIELD_KEYS: (keyof CvBuilderFormValues["personalDetails"])[] = [
  "fullName",
  "race",
  "gender",
  "disabilityStatus",
  "nationality",
  "residentialLocation",
  "currentCompany",
  "currentPosition",
  "noticePeriod",
];

const PERSONAL_SELECT_OPTIONS: Partial<
  Record<keyof CvBuilderFormValues["personalDetails"], readonly string[]>
> = {
  race: RACE_OPTIONS,
  gender: GENDER_OPTIONS,
  disabilityStatus: DISABILITY_OPTIONS,
  residentialLocation: LOCATION_OPTIONS,
  noticePeriod: NOTICE_PERIOD_OPTIONS,
};

const normalizePersonalDetailsFieldValue = (
  field: keyof CvBuilderFormValues["personalDetails"],
  value: string,
): string => {
  const options = PERSONAL_SELECT_OPTIONS[field];
  if (!options) {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  const matchedOption = options.find(
    (option) => option.toLowerCase() === normalized,
  );
  return matchedOption ?? "";
};

const isCareerPristine = (entries: CvBuilderFormValues["careerHistory"]) =>
  entries.length === 1 &&
  !entries[0].companyName &&
  !entries[0].positionHeld &&
  !entries[0].startDate &&
  !entries[0].endDate &&
  entries[0].tasks.length === 1 &&
  !entries[0].tasks[0] &&
  entries[0].projects.length === 1 &&
  !entries[0].projects[0];

const isSkillsPristine = (entries: CvBuilderFormValues["skills"]) =>
  entries.length === 1 && !entries[0].name;

const isTertiaryPristine = (
  entries: CvBuilderFormValues["tertiaryEducation"],
) =>
  entries.length === 1 &&
  !entries[0].institutionName &&
  !entries[0].degreeOrCertification &&
  !entries[0].yearCompleted;

const isSecondaryPristine = (
  entries: CvBuilderFormValues["secondaryEducation"],
) =>
  entries.length === 1 &&
  !entries[0].institutionName &&
  !entries[0].highestGradePassed &&
  !entries[0].yearCompleted;

const buildLanguageEntries = (
  languages: string[],
  otherLanguage: string,
): string[] => {
  const entries = languages.filter((l) => l !== "Other");
  if (languages.includes("Other") && otherLanguage.trim()) {
    entries.push(otherLanguage.trim());
  }
  return entries;
};

export type CvBuilderPrefillData = Partial<CvBuilderFormValues>;

const useCvBuilder = (
  prefillData?: CvBuilderPrefillData,
  forceApply = false,
) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [activeView, setActiveView] = useState<CvBuilderView>("launcher");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
    null,
  );
  const [currentStepId, setCurrentStepId] = useState<number>(FIRST_STEP);

  const form = useForm<CvBuilderFormValues>({
    resolver: zodResolver(cvBuilderSchema) as never,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!prefillData) return;

    const {
      personalDetails: pd,
      careerHistory,
      skills,
      tertiaryEducation,
      secondaryEducation,
      languages,
      otherLanguage,
    } = prefillData;

    if (pd) {
      const current = form.getValues("personalDetails");
      PERSONAL_FIELD_KEYS.forEach((field) => {
        const value = pd[field];
        if (!value || (!forceApply && current[field])) {
          return;
        }

        const nextValue = normalizePersonalDetailsFieldValue(field, value);
        if (nextValue || !PERSONAL_SELECT_OPTIONS[field]) {
          form.setValue(`personalDetails.${field}`, nextValue);
        }
      });
    }
    if (
      careerHistory &&
      careerHistory.length > 0 &&
      (forceApply || isCareerPristine(form.getValues("careerHistory")))
    ) {
      form.setValue("careerHistory", careerHistory);
    }
    if (
      skills &&
      skills.length > 0 &&
      (forceApply || isSkillsPristine(form.getValues("skills")))
    ) {
      form.setValue("skills", skills);
    }
    if (
      tertiaryEducation &&
      tertiaryEducation.length > 0 &&
      (forceApply || isTertiaryPristine(form.getValues("tertiaryEducation")))
    ) {
      form.setValue("tertiaryEducation", tertiaryEducation);
    }
    if (
      secondaryEducation &&
      secondaryEducation.length > 0 &&
      (forceApply || isSecondaryPristine(form.getValues("secondaryEducation")))
    ) {
      form.setValue("secondaryEducation", secondaryEducation);
    }
    if (
      languages &&
      languages.length > 0 &&
      (forceApply || form.getValues("languages").length === 0)
    ) {
      form.setValue("languages", languages);
    }
    if (
      otherLanguage &&
      otherLanguage.trim() &&
      (forceApply || !form.getValues("otherLanguage"))
    ) {
      form.setValue("otherLanguage", otherLanguage);
    }
  }, [prefillData, forceApply]); // eslint-disable-line react-hooks/exhaustive-deps

  const personalDetailsValues = useWatch({
    control: form.control,
    name: "personalDetails",
  });
  const careerHistoryValues = useWatch({
    control: form.control,
    name: "careerHistory",
  });
  const skillsValues = useWatch({ control: form.control, name: "skills" });
  const tertiaryValues = useWatch({
    control: form.control,
    name: "tertiaryEducation",
  });
  const secondaryValues = useWatch({
    control: form.control,
    name: "secondaryEducation",
  });
  const languagesValues = useWatch({
    control: form.control,
    name: "languages",
  });
  const otherLanguageValue = useWatch({
    control: form.control,
    name: "otherLanguage",
  });

  const isPersonalDetailsValid = useMemo(
    () => personalDetailsSchema.safeParse(personalDetailsValues).success,
    [personalDetailsValues],
  );
  const isCareerHistoryValid = useMemo(() => {
    if (!personalDetailsValues?.currentPosition?.trim()) return true;
    if (!careerHistoryValues?.length) return false;
    return careerHistoryValues.every(
      (entry) => careerHistoryEntrySchema.safeParse(entry).success,
    );
  }, [personalDetailsValues, careerHistoryValues]);
  const isSkillsValid = useMemo(
    () => (skillsValues ?? []).some((s) => s.name.trim().length > 0),
    [skillsValues],
  );
  const isEducationValid = useMemo(() => {
    const total =
      (tertiaryValues?.length ?? 0) + (secondaryValues?.length ?? 0);
    if (!total) return false;
    return (
      (tertiaryValues ?? []).every(
        (e) => tertiaryEntrySchema.safeParse(e).success,
      ) &&
      (secondaryValues ?? []).every(
        (e) => secondaryEntrySchema.safeParse(e).success,
      )
    );
  }, [tertiaryValues, secondaryValues]);
  const isLanguagesValid = useMemo(() => {
    if (!languagesValues?.length) return false;
    if (languagesValues.includes("Other") && !otherLanguageValue?.trim())
      return false;
    return true;
  }, [languagesValues, otherLanguageValue]);

  const canViewCv =
    isPersonalDetailsValid &&
    isCareerHistoryValid &&
    isSkillsValid &&
    isEducationValid &&
    isLanguagesValid;
  const canGoNext =
    activeView === "form" &&
    ((currentStepId === 1 && isPersonalDetailsValid) ||
      (currentStepId === 2 && isCareerHistoryValid) ||
      (currentStepId === 3 && isSkillsValid) ||
      (currentStepId === 4 && isEducationValid) ||
      (currentStepId === 5 && isLanguagesValid));

  const validateStep = async (stepId: number): Promise<boolean> => {
    switch (stepId) {
      case 1:
        return form.trigger("personalDetails");

      case 2: {
        const currentPosition = form
          .getValues("personalDetails.currentPosition")
          .trim();
        if (!currentPosition) return true;
        form.clearErrors("careerHistory");
        const careerHistory = form.getValues("careerHistory");
        if (!careerHistory.length) {
          form.setError("careerHistory", {
            type: "custom",
            message:
              "At least one position is required when current position is provided",
          });
          return false;
        }
        return form.trigger("careerHistory");
      }

      case 3: {
        form.clearErrors("skills");
        if (!form.getValues("skills").some((s) => s.name.trim())) {
          form.setError("skills", {
            type: "custom",
            message: "At least one skill is required",
          });
          return false;
        }
        return true;
      }

      case 4: {
        form.clearErrors("tertiaryEducation");
        const tertiaryLen = form.getValues("tertiaryEducation").length;
        const secondaryLen = form.getValues("secondaryEducation").length;
        if (!tertiaryLen && !secondaryLen) {
          form.setError("tertiaryEducation", {
            type: "custom",
            message: "At least one education entry is required",
          });
          return false;
        }
        const tertiaryOk = await form.trigger("tertiaryEducation");
        const secondaryOk = await form.trigger("secondaryEducation");
        return tertiaryOk && secondaryOk;
      }

      case 5: {
        form.clearErrors("languages");
        form.clearErrors("otherLanguage");
        const langs = form.getValues("languages");
        if (!langs.length) {
          form.setError("languages", {
            type: "custom",
            message: "At least one language must be selected",
          });
          return false;
        }
        if (
          langs.includes("Other") &&
          !form.getValues("otherLanguage").trim()
        ) {
          form.setError("otherLanguage", {
            type: "custom",
            message: "Please enter the other language",
          });
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  const handleUploadFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedUploadFile(nextFile);
    event.target.value = "";
  };
  const openUploadPicker = () => uploadInputRef.current?.click();
  const openBuildFlow = () => {
    setActiveView("form");
    setCurrentStepId(FIRST_STEP);
  };
  const openPreview = () => setActiveView("preview");
  const closePreview = () => setActiveView("review");

  const goBack = () => {
    if (activeView === "preview" || activeView === "view-cv") {
      setActiveView("review");
      return;
    }
    if (activeView === "review") {
      setActiveView("form");
      setCurrentStepId(LAST_STEP);
      return;
    }
    if (currentStepId > FIRST_STEP) {
      setCurrentStepId((prev) => prev - 1);
      return;
    }
    setActiveView("launcher");
  };

  const goNext = async () => {
    if (activeView === "preview") return;
    if (activeView === "view-cv") {
      setActiveView("launcher");
      setCurrentStepId(FIRST_STEP);
      return;
    }

    if (activeView === "review") {
      let allValid = true;
      for (let step = 1; step <= LAST_STEP; step++) {
        if (!(await validateStep(step))) allValid = false;
      }
      if (allValid) setActiveView("view-cv");
      return;
    }

    if (!(await validateStep(currentStepId))) return;
    if (currentStepId < LAST_STEP) {
      setCurrentStepId((prev) => prev + 1);
    } else {
      setActiveView("review");
    }
  };

  const toggleLanguage = (language: Language) => {
    const current = form.getValues("languages");
    const isSelected = current.includes(language);
    form.setValue(
      "languages",
      isSelected
        ? current.filter((l) => l !== language)
        : [...current, language],
      { shouldValidate: form.formState.submitCount > 0 },
    );
    if (isSelected && language === "Other") form.setValue("otherLanguage", "");
  };

  const updateOtherLanguage = (value: string) => {
    form.setValue("otherLanguage", value, {
      shouldValidate: form.formState.submitCount > 0,
    });
  };

  const normalizeCareerDate = (
    entryIndex: number,
    field: "startDate" | "endDate",
  ) => {
    const current = form.getValues(`careerHistory.${entryIndex}.${field}`);
    const normalized = normalizeCareerDateValue(current);
    if (normalized !== current)
      form.setValue(`careerHistory.${entryIndex}.${field}`, normalized);
    if (field === "endDate") {
      form.setValue(
        `careerHistory.${entryIndex}.isCurrentRole`,
        currentRolePattern.test(normalized.trim()),
      );
    }
  };

  const selectedLanguages = useMemo(
    () =>
      new Set<Language>(
        (languagesValues ?? []).filter((l): l is Language =>
          LANGUAGES_LIST.includes(l as Language),
        ),
      ),
    [languagesValues],
  );
  const selectedLanguageEntries = useMemo(
    () => buildLanguageEntries(languagesValues ?? [], otherLanguageValue ?? ""),
    [languagesValues, otherLanguageValue],
  );

  return {
    form,
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    canViewCv,
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    openPreview,
    closePreview,
    goBack,
    goNext,
    selectedLanguages,
    selectedLanguageEntries,
    otherLanguage: otherLanguageValue ?? "",
    toggleLanguage,
    updateOtherLanguage,
    normalizeCareerDate,
  };
};

export default useCvBuilder;
