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
} from "@/app/validation.schema";
import {
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  LANGUAGES_LIST,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
  type CvBuilderView,
  type Language,
} from "../types/cvBuilder";

const isoDatePattern = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
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
  const isoMatch = normalized.match(isoDatePattern);
  if (!isoMatch) return value;
  const year = normalized.slice(0, 4);
  const monthIndex = Number(normalized.slice(5, 7)) - 1;
  const day = normalized.slice(8, 10);
  const monthName = monthNames[monthIndex];
  if (!monthName) return value;
  return `${day},${monthName},${year}`;
};

const DEFAULT_FORM_VALUES: CvBuilderFormValues = {
  personalDetails: {
    fullName: "",
    email: "",
    phoneNumber: "",
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
  entries.length === 0 ||
  (entries.length === 1 &&
    !entries[0].companyName &&
    !entries[0].positionHeld &&
    !entries[0].startDate &&
    !entries[0].endDate &&
    entries[0].tasks.length === 1 &&
    !entries[0].tasks[0] &&
    entries[0].projects.length === 1 &&
    !entries[0].projects[0]);

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

export type CvBuilderPrefillData = Omit<
  Partial<CvBuilderFormValues>,
  "personalDetails"
> & {
  personalDetails?: Partial<CvBuilderFormValues["personalDetails"]>;
};

const useCvBuilder = (
  prefillData?: CvBuilderPrefillData,
  forceApply = false,
  initialView: CvBuilderView = "launcher",
) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [activeView, setActiveView] = useState<CvBuilderView>(initialView);
  const [reviewSource, setReviewSource] = useState<"build" | "upload">("build");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
    null,
  );

  const form = useForm<CvBuilderFormValues>({
    resolver: zodResolver(cvBuilderSchema) as never,
    defaultValues: DEFAULT_FORM_VALUES,
    // onBlur avoids re-running the (large, nested) schema on every keystroke;
    // reValidateMode still clears/updates errors immediately once a field is fixed.
    mode: "onBlur",
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

    if (forceApply) {
      const nextPersonalDetails = { ...DEFAULT_FORM_VALUES.personalDetails };
      if (pd) {
        PERSONAL_FIELD_KEYS.forEach((field) => {
          const value = pd[field];
          if (!value) return;

          const nextValue = normalizePersonalDetailsFieldValue(field, value);
          if (nextValue || !PERSONAL_SELECT_OPTIONS[field]) {
            nextPersonalDetails[field] = nextValue;
          }
        });
      }

      form.reset({
        ...DEFAULT_FORM_VALUES,
        personalDetails: nextPersonalDetails,
        careerHistory: careerHistory?.length
          ? careerHistory
          : DEFAULT_FORM_VALUES.careerHistory,
        skills: skills?.length ? skills : DEFAULT_FORM_VALUES.skills,
        tertiaryEducation: tertiaryEducation?.length
          ? tertiaryEducation
          : DEFAULT_FORM_VALUES.tertiaryEducation,
        secondaryEducation: secondaryEducation?.length
          ? secondaryEducation
          : DEFAULT_FORM_VALUES.secondaryEducation,
        languages: languages ?? DEFAULT_FORM_VALUES.languages,
        otherLanguage: otherLanguage ?? DEFAULT_FORM_VALUES.otherLanguage,
      });
      // Surface incomplete prefilled fields, but do not validate optional career history.
      void form.trigger().then(() => {
        if (!form.getValues("personalDetails.currentCompany").trim()) {
          form.clearErrors("careerHistory");
        }
      });
      return;
    }

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
    // Surface incomplete prefilled fields, but do not validate optional career history.
    void form.trigger().then(() => {
      if (!form.getValues("personalDetails.currentCompany").trim()) {
        form.clearErrors("careerHistory");
      }
    });
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

  useEffect(() => {
    if (personalDetailsValues?.currentCompany?.trim()) {
      void form.trigger("careerHistory");
      return;
    }

    form.clearErrors("careerHistory");
  }, [form, personalDetailsValues?.currentCompany]);

  const isPersonalDetailsValid = useMemo(
    () => personalDetailsSchema.safeParse(personalDetailsValues).success,
    [personalDetailsValues],
  );
  const isCareerHistoryValid = useMemo(() => {
    if (!personalDetailsValues?.currentCompany?.trim()) return true;
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

  const handleUploadFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedUploadFile(nextFile);
    event.target.value = "";
  };
  const selectUploadFile = (file: File | null) => setSelectedUploadFile(file);
  const openUploadPicker = () => uploadInputRef.current?.click();
  const openBuildFlow = () => {
    setReviewSource("build");
    setActiveView("review");
  };
  const goBack = () => setActiveView("launcher");
  // Resume extraction isn't wired up to the mock API yet, so the uploaded-CV
  // flow shows a blank form instead of stale/unrelated profile data.
  const openReviewFlowBlank = (prefillData?: CvBuilderPrefillData) => {
    form.reset({
      ...DEFAULT_FORM_VALUES,
      ...prefillData,
      personalDetails: {
        ...DEFAULT_FORM_VALUES.personalDetails,
        ...prefillData?.personalDetails,
      },
    });
    setReviewSource("upload");
    setActiveView("review");
  };

  const toggleLanguage = (language: Language) => {
    const current = form.getValues("languages");
    const isSelected = current.includes(language);
    form.setValue(
      "languages",
      isSelected
        ? current.filter((l) => l !== language)
        : [...current, language],
      { shouldDirty: true, shouldValidate: form.formState.submitCount > 0 },
    );
    if (isSelected && language === "Other") {
      form.setValue("otherLanguage", "", { shouldDirty: true });
    }
  };

  const updateOtherLanguage = (value: string) => {
    form.setValue("otherLanguage", value, {
      shouldDirty: true,
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
      form.setValue(`careerHistory.${entryIndex}.${field}`, normalized, {
        shouldDirty: true,
      });
    if (field === "endDate") {
      form.setValue(
        `careerHistory.${entryIndex}.isCurrentRole`,
        currentRolePattern.test(normalized.trim()),
        { shouldDirty: true },
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
    reviewSource,
    selectedUploadFile,
    canViewCv,
    handleUploadFileSelect,
    selectUploadFile,
    openUploadPicker,
    openBuildFlow,
    openReviewFlowBlank,
    goBack,
    selectedLanguages,
    selectedLanguageEntries,
    otherLanguage: otherLanguageValue ?? "",
    toggleLanguage,
    updateOtherLanguage,
    normalizeCareerDate,
  };
};

export default useCvBuilder;
