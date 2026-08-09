import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
} from "@/store/api/apiSlice";
import type { CandidateProfile } from "@/modules/candidate/types";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import {
  setBuildMyCvExists,
  setBuildMyCvLastModified,
} from "@/store/slices/candidateSlice";
import type { SaveBuildMyCvRequest } from "@/types";
import type { CvBuilderView, Language } from "../types/cvBuilder";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

const KNOWN_LANGUAGES: Language[] = [
  "Afrikaans",
  "Southern Sotho",
  "Swati",
  "English",
  "Northern Sotho",
  "Ndebele",
  "Xhosa",
  "Venda",
  "Tsonga",
  "Zulu",
  "Tswana",
  "South African Sign",
  "Other",
];

const isKnownLanguage = (value: string): value is Language =>
  KNOWN_LANGUAGES.includes(value as Language);

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

const monthNameToIso = (value: string): string => {
  const normalized = value.trim();
  const [month, year] = normalized.split(",").map((part) => part.trim());
  if (!month || !year || !/^\d{4}$/.test(year)) {
    return value;
  }

  const monthIndex = monthNames.findIndex(
    (name) => name.toLowerCase() === month.toLowerCase(),
  );
  if (monthIndex < 0) {
    return value;
  }

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
};

export const isoToMonthName = (value: string): string => {
  const match = value.match(/^(19|20)\d{2}-(0[1-9]|1[0-2])$/);
  if (!match) {
    return value;
  }

  const year = value.slice(0, 4);
  const monthIndex = Number(value.slice(5, 7)) - 1;
  const monthName = monthNames[monthIndex];
  return monthName ? `${monthName},${year}` : value;
};

export const buildCvBuilderPrefillData = (
  profile: CandidateProfile | undefined,
): Partial<CvBuilderFormValues> | undefined => {
  if (!profile) {
    return undefined;
  }

  const profileLanguages = Array.isArray(profile.languages)
    ? profile.languages
    : [];
  const languageNames = profileLanguages.map((item) => item.language);
  const knownLanguages = languageNames.filter(isKnownLanguage);
  const customOtherLanguage = languageNames.find(
    (language) => !isKnownLanguage(language),
  );

  const experience = Array.isArray(profile.experience)
    ? profile.experience
    : [];
  const primaryExperience = experience[0];

  return {
    personalDetails: {
      fullName:
        `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`.trim(),
      race: profile.personalDetails.eeStatus ?? "",
      gender: "",
      disabilityStatus: "",
      nationality: profile.personalDetails.nationality ?? "",
      residentialLocation: profile.personalDetails.location ?? "",
      currentCompany: primaryExperience?.company ?? "",
      currentPosition:
        primaryExperience?.jobTitle ?? profile.desiredJob?.jobTitle ?? "",
      noticePeriod: profile.desiredJob?.availableFrom ?? "",
    },
    careerHistory: experience.map((entry) => ({
      companyName: entry.company ?? "",
      positionHeld: entry.jobTitle ?? "",
      startDate: isoToMonthName(entry.startDate ?? ""),
      endDate: isoToMonthName(entry.endDate ?? ""),
      isCurrentRole: (entry.endDate ?? "").toLowerCase() === "present",
      tasks: [entry.responsibilities ?? ""],
      projects: [""],
    })),
    skills: (Array.isArray(profile.skills) ? profile.skills : []).map(
      (skill) => ({ name: skill }),
    ),
    tertiaryEducation: (Array.isArray(profile.education)
      ? profile.education
      : []
    ).map((entry) => ({
      institutionName: entry.institution ?? "",
      degreeOrCertification: entry.qualification ?? "",
      yearCompleted: String(entry.year ?? ""),
    })),
    secondaryEducation: [],
    languages: [
      ...knownLanguages,
      ...(customOtherLanguage ? (["Other"] as Language[]) : []),
    ],
    otherLanguage: customOtherLanguage ?? "",
  };
};

type UseCvBuilderDoneArgs = {
  activeView: CvBuilderView;
  goNext: () => void;
  userId?: string;
  candidateProfile?: CandidateProfile;
  getFormValues: () => CvBuilderFormValues;
  selectedLanguageEntries: string[];
  buildMyCvExists: boolean;
};

const buildBuildMyCvRequest = ({
  formValues,
  selectedLanguageEntries,
}: {
  formValues: CvBuilderFormValues;
  selectedLanguageEntries: string[];
}): SaveBuildMyCvRequest => {
  const [firstName, ...lastNameParts] = formValues.personalDetails.fullName
    .trim()
    .split(" ");
  const languages = selectedLanguageEntries
    .filter(Boolean)
    .map((language) => ({ language, proficiency: "Conversational" }));

  return {
    personalDetails: {
      firstName: firstName || "",
      lastName: lastNameParts.join(" ").trim(),
      race: formValues.personalDetails.race.trim(),
      gender: formValues.personalDetails.gender.trim(),
      disabilityStatus: formValues.personalDetails.disabilityStatus.trim(),
      nationality: formValues.personalDetails.nationality.trim(),
      location: formValues.personalDetails.residentialLocation.trim(),
      currentCompany: formValues.personalDetails.currentCompany.trim(),
      currentPosition: formValues.personalDetails.currentPosition.trim(),
      noticePeriod: formValues.personalDetails.noticePeriod.trim(),
    },
    careerHistory: formValues.careerHistory
      .filter((entry) => entry.companyName.trim() || entry.positionHeld.trim())
      .map((entry) => ({
        company: entry.companyName.trim(),
        jobTitle: entry.positionHeld.trim(),
        startDate: monthNameToIso(entry.startDate.trim()),
        endDate: entry.isCurrentRole
          ? "Present"
          : monthNameToIso(entry.endDate.trim()),
        responsibilities: entry.tasks
          .map((task) => task.trim())
          .filter(Boolean)
          .join("; "),
      })),
    skills: formValues.skills.map((skill) => skill.name.trim()).filter(Boolean),
    education: {
      tertiaryEducation: formValues.tertiaryEducation
        .filter(
          (entry) =>
            entry.institutionName.trim() && entry.degreeOrCertification.trim(),
        )
        .map((entry) => ({
          institution: entry.institutionName.trim(),
          qualification: entry.degreeOrCertification.trim(),
          yearCompleted: Number(entry.yearCompleted.trim()),
        })),
      secondaryEducation: formValues.secondaryEducation
        .filter(
          (entry) =>
            entry.institutionName.trim() && entry.highestGradePassed.trim(),
        )
        .map((entry) => ({
          schoolName: entry.institutionName.trim(),
          qualification: entry.highestGradePassed.trim(),
          yearCompleted: Number(entry.yearCompleted.trim()),
        })),
    },
    languages,
  };
};

export const useCvBuilderDone = ({
  activeView,
  goNext,
  getFormValues,
  selectedLanguageEntries,
  buildMyCvExists,
}: UseCvBuilderDoneArgs) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [triggerCreate, { isLoading: isCreating }] = useSaveBuildMyCvMutation();
  const [triggerUpdate, { isLoading: isUpdating }] =
    useUpdateBuildMyCvMutation();

  const isSavingCandidateProfile = isCreating || isUpdating;

  const handleDone = useCallback(async () => {
    if (activeView !== "view-cv") {
      goNext();
      return;
    }

    const payload = buildBuildMyCvRequest({
      formValues: getFormValues(),
      selectedLanguageEntries,
    });

    try {
      const result = buildMyCvExists
        ? await triggerUpdate(payload).unwrap()
        : await triggerCreate(payload).unwrap();

      dispatch(setBuildMyCvExists(true));
      dispatch(
        setBuildMyCvLastModified(
          result.lastModified ?? new Date().toISOString(),
        ),
      );

      dispatch(
        pushNotification({
          title: buildMyCvExists ? "Changes saved" : "CV created",
          message: buildMyCvExists
            ? "Changes saved successfully."
            : "CV information saved successfully.",
          level: "success",
        }),
      );
      navigate(ROUTE_PATHS.candidateDashboard);
    } catch (error) {
      const fallbackMessage =
        "We could not save your CV right now. Please try again.";
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message ?? fallbackMessage)
          : fallbackMessage;

      dispatch(
        pushNotification({
          title: "Save failed",
          message: errorMessage,
          level: "error",
        }),
      );
    }
  }, [
    activeView,
    goNext,
    buildMyCvExists,
    dispatch,
    getFormValues,
    selectedLanguageEntries,
    triggerCreate,
    triggerUpdate,
    navigate,
  ]);

  return {
    handleDone,
    isSavingCandidateProfile,
  };
};
