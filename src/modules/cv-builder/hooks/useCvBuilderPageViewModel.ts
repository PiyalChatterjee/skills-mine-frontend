import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import settingsIcon from "@/assets/cv-builder/settings-4-line.svg";
import uploadIcon from "@/assets/cv-builder/upload-2-line.svg";
import {
  useBuildMyCvQuery,
  useCandidateProfileQuery,
  useCandidateResourceId,
} from "@/modules/candidate/hooks/useCandidateQueries";
import { getGuestApplicationDrafts } from "@/modules/candidate/utils/guestApplicationDraft";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { aiApi } from "@/services/api/aiApi";
import { useUploadDocumentMutation } from "@/store/api/apiSlice";
import {
  selectBuildMyCv,
  selectBuildMyCvExists,
  selectBuildMyCvLoaded,
} from "@/store/selectors";
import type { BuildMyCvState } from "@/types";
import useCvBuilder from "./useCvBuilder";
import {
  buildCvBuilderPrefillData,
  isoToMonthName,
  useCvBuilderDone,
} from "./useCvBuilderDone";
import { extractResumeText } from "../utils/extractResumeText";
import { buildResumePrefillData } from "../utils/resumePrefill";
import { LANGUAGES_LIST, type CvActionCard } from "../types/cvBuilder";
import type { CvBuilderFormValues } from "@/app/validation.schema";

const EMPTY_CAREER_HISTORY = {
  companyName: "",
  positionHeld: "",
  startDate: "",
  endDate: "",
  isCurrentRole: false,
  tasks: [""],
  projects: [""],
};

const buildPrefillFromSavedCv = (
  buildMyCvData: BuildMyCvState,
): Partial<CvBuilderFormValues> => {
  const savedEntries = (Array.isArray(buildMyCvData.careerHistory)
    ? buildMyCvData.careerHistory
    : []
  )
    .filter(
      (entry) =>
        entry.company?.trim() ||
        entry.jobTitle?.trim() ||
        entry.startDate?.trim() ||
        entry.endDate?.trim() ||
        entry.responsibilities?.trim(),
    )
    .map((entry) => ({
      companyName: entry.company ?? "",
      positionHeld: entry.jobTitle ?? "",
      startDate: isoToMonthName(entry.startDate ?? ""),
      endDate:
        entry.endDate == null || (entry.endDate ?? "").toLowerCase() === "present"
          ? "Present"
          : isoToMonthName(entry.endDate),
      isCurrentRole:
        entry.endDate == null || (entry.endDate ?? "").toLowerCase() === "present",
      tasks: [entry.responsibilities ?? ""],
      projects: [""],
    }));
  const currentEntry = savedEntries.find((entry) => entry.isCurrentRole);
  const currentCompany =
    buildMyCvData.personalDetails.currentCompany ?? currentEntry?.companyName ?? "";
  const currentPosition =
    buildMyCvData.personalDetails.currentPosition ?? currentEntry?.positionHeld ?? "";

  return {
    personalDetails: {
      fullName:
        `${buildMyCvData.personalDetails.firstName ?? ""} ${buildMyCvData.personalDetails.lastName ?? ""}`.trim(),
      residentialLocation: buildMyCvData.personalDetails.location ?? "",
      nationality: buildMyCvData.personalDetails.nationality ?? "",
      noticePeriod: buildMyCvData.personalDetails.noticePeriod ?? "",
      currentCompany,
      currentPosition,
      race: buildMyCvData.personalDetails.race ?? "",
      gender: buildMyCvData.personalDetails.gender ?? "",
      disabilityStatus: buildMyCvData.personalDetails.disabilityStatus ?? "",
    },
    careerHistory:
      savedEntries.length > 0 ? savedEntries : [EMPTY_CAREER_HISTORY],
    skills: (Array.isArray(buildMyCvData.skills) ? buildMyCvData.skills : []).map((name) => ({ name })),
    tertiaryEducation: (buildMyCvData.education?.tertiaryEducation ?? []).map((entry) => ({
      institutionName: entry.institution ?? "",
      degreeOrCertification: entry.qualification ?? "",
      yearCompleted: String(entry.yearCompleted ?? ""),
    })),
    secondaryEducation: (buildMyCvData.education?.secondaryEducation ?? []).map((entry) => ({
      // mapBuildResponse (candidateApi.ts) normalizes both levels onto `institution`, not `schoolName`.
      institutionName: entry.institution ?? entry.schoolName ?? "",
      highestGradePassed: entry.qualification ?? "",
      yearCompleted: String(entry.yearCompleted ?? ""),
    })),
    languages: (Array.isArray(buildMyCvData.languages) ? buildMyCvData.languages : [])
    .map((language) => language.language)
    .filter((language): language is (typeof LANGUAGES_LIST)[number] =>
      LANGUAGES_LIST.includes(language as never),
    ),
    otherLanguage:
      (Array.isArray(buildMyCvData.languages) ? buildMyCvData.languages : [])
        .map((language) => language.language)
        .find((language) => !LANGUAGES_LIST.includes(language as never)) ?? "",
  };
};

export const useCvBuilderPageViewModel = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDocument, { isLoading: isUploadingResume }] =
    useUploadDocumentMutation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = user?.userId;
  const candidateId = useCandidateResourceId();
  const guestApplicationJobIdFromState = (
    location.state as { guestApplicationJobId?: string } | null
  )?.guestApplicationJobId;
  const guestApplicationJobId =
    new URLSearchParams(location.search).get("job") ??
    guestApplicationJobIdFromState;

  const guestApplicationDraft = useMemo(() => {
    if (userId) return undefined;
    const drafts = getGuestApplicationDrafts();
    return (
      drafts.find((draft) => draft.jobId === guestApplicationJobId) ??
      drafts.find((draft) => draft.applicationStatus === "pending-authentication")
    );
  }, [guestApplicationJobId, userId]);
  const isGuestApplication = Boolean(guestApplicationDraft);

  const guestJobTags = useMemo(() => {
    const job = guestApplicationDraft?.job;
    if (!job) return [];

    return [
      job.industry,
      job.location?.split(",")[0]?.trim(),
      formatEnumLabel(job.workType),
      formatEnumLabel(job.employmentType),
    ].filter((tag): tag is string => Boolean(tag));
  }, [guestApplicationDraft]);

  const { isLoading: isBuildMyCvLoading } = useBuildMyCvQuery(Boolean(candidateId), candidateId);
  const buildMyCvData = useSelector(selectBuildMyCv);
  const buildMyCvLoaded = useSelector(selectBuildMyCvLoaded);
  const buildMyCvExists = useSelector(selectBuildMyCvExists);
  const { data: candidateProfile } = useCandidateProfileQuery(candidateId, userId, Boolean(candidateId));

  const cvBuilderPrefillData = useMemo(() => {
    if (buildMyCvLoaded && buildMyCvData) {
      return buildPrefillFromSavedCv(buildMyCvData);
    }

    return buildCvBuilderPrefillData(candidateProfile);
  }, [buildMyCvLoaded, buildMyCvData, candidateProfile]);

  const {
    form,
    uploadInputRef,
    activeView,
    reviewSource,
    selectedUploadFile,
    canViewCv,
    selectedLanguageEntries,
    handleUploadFileSelect,
    selectUploadFile,
    openUploadPicker,
    openBuildFlow,
    openReviewFlowBlank,
    goBack,
  } = useCvBuilder(
    cvBuilderPrefillData,
    buildMyCvLoaded && Boolean(buildMyCvData),
  );
  const hasFormChanges = form.formState.isDirty;

  const { handleDone, isSavingCandidateProfile } = useCvBuilderDone({
    userId,
    candidateProfile,
    getFormValues: form.getValues,
    selectedLanguageEntries,
    buildMyCvExists,
    validateForm: form.trigger,
    hasFormChanges,
    userRole: user?.role,
    guestApplicationDraft,
  });

  const handleUploadDone = async () => {
    if (!selectedUploadFile) return;

    try {
      const extractedText = await extractResumeText(selectedUploadFile);
      const parsedResume = await aiApi.parseResume({
        extracted_text: extractedText,
        ...(isGuestApplication
          ? { owner_type: "VISITOR" as const }
          : { owner_type: "CANDIDATE" as const }),
      });
      const prefillData = buildResumePrefillData(parsedResume, extractedText);
      const mergedPrefillData = {
        ...cvBuilderPrefillData,
        ...prefillData,
        personalDetails: {
          ...cvBuilderPrefillData?.personalDetails,
          ...prefillData.personalDetails,
        },
      };

      if (isGuestApplication) {
        setUploadModalOpen(false);
        openReviewFlowBlank(mergedPrefillData);
        return;
      }

      if (!candidateId) return;

      await uploadDocument({
        candidateId,
        file: selectedUploadFile,
        fileName: selectedUploadFile.name,
        documentType: "RESUME",
      }).unwrap();

      setUploadModalOpen(false);
      openReviewFlowBlank(mergedPrefillData);
      return;
    } catch {
      // Keep the modal open when extraction, parsing, or upload fails.
    }
  };

  const actionCards: CvActionCard[] = useMemo(
    () => [
      {
        id: "upload",
        title: "Upload my CV",
        description: "Upload your CV directly from your computer.",
        icon: uploadIcon,
        tone: "coral",
        onClick: () => setUploadModalOpen(true),
      },
      {
        id: "build",
        title: "Build my CV",
        description: isBuildMyCvLoading
          ? "Loading your saved data..."
          : "Create a CV with The Skills Mine CV builder.",
        icon: settingsIcon,
        tone: "teal",
        onClick: openBuildFlow,
      },
    ],
    [openBuildFlow, isBuildMyCvLoading],
  );

  const heroBackHandler = isGuestApplication
    ? () =>
        navigate(
          ROUTE_PATHS.jobDetails.replace(
            ":jobId",
            guestApplicationDraft!.jobId,
          ),
        )
    : activeView === "review"
      ? goBack
      : undefined;

  const heroHeading = isGuestApplication
    ? guestApplicationDraft?.jobTitle
    : activeView === "review" && reviewSource === "upload"
      ? "Your CV"
      : "CV Builder";

  return {
    actionCards,
    activeView,
    buildMyCvExists,
    canViewCv,
    form,
    handleDone,
    handleUploadDone,
    handleUploadFileSelect,
    heroBackHandler,
    heroHeading,
    isGuestApplication,
    isSavingCandidateProfile,
    isUploadingResume,
    openUploadPicker,
    reviewSource,
    selectUploadFile,
    selectedUploadFile,
    setUploadModalOpen,
    uploadInputRef,
    uploadModalOpen,
    guestJobTags: isGuestApplication ? guestJobTags : undefined,
  };
};