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
import { useVisitorEmailCheck } from "./useVisitorEmailCheck";
import { extractResumeText } from "../utils/extractResumeText";
import { focusFirstErrorField } from "../utils/focusFirstError";
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

const RESUME_TEXT_EXTRACTION_TIMEOUT_MS = 30_000;

const extractResumeTextWithTimeout = (file: File) =>
  Promise.race([
    extractResumeText(file),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Resume text extraction timed out.")),
        RESUME_TEXT_EXTRACTION_TIMEOUT_MS,
      );
    }),
  ]);

const buildPrefillFromSavedCv = (
  buildMyCvData: BuildMyCvState,
): Partial<CvBuilderFormValues> => {
  // Tasks are joined with "; " into a single responsibilities string on save
  // (see buildBuildMyCvRequest); split on the same delimiter when reloading so
  // each responsibility renders as its own task row instead of one merged line.
  const splitResponsibilities = (value?: string): string[] => {
    const items = (value ?? "")
      .split(/;\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : [""];
  };
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
      tasks: splitResponsibilities(entry.responsibilities),
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
      email: buildMyCvData.personalDetails.email ?? "",
      phoneNumber: buildMyCvData.personalDetails.phoneNumber ?? "",
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReadingResume, setIsReadingResume] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [visitorId, setVisitorId] = useState<string | undefined>();
  const [uploadDocument, { isLoading: isUploadingResume }] =
    useUploadDocumentMutation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = user?.userId;
  const candidateResourceId = useCandidateResourceId();
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

  const {
    isCandidateExistsModalOpen,
    existingCandidateEmail,
    isCheckingEmail,
    checkEmail,
    closeModal: closeCandidateExistsModal,
    goToLogin: goToLoginFromCandidateExistsModal,
  } = useVisitorEmailCheck(guestApplicationJobId ?? undefined);

  const handleEmailBlur = (email: string) => {
    if (isGuestApplication) {
      void checkEmail(email);
    }
  };

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

  const { data: candidateProfile } = useCandidateProfileQuery(
    candidateResourceId,
    userId,
    Boolean(candidateResourceId),
  );
  const candidateId = candidateProfile?.candidateId ?? candidateResourceId;
  const { isLoading: isBuildMyCvLoading } = useBuildMyCvQuery(Boolean(candidateId), candidateId);
  const buildMyCvData = useSelector(selectBuildMyCv);
  const buildMyCvLoaded = useSelector(selectBuildMyCvLoaded);
  const buildMyCvExists = useSelector(selectBuildMyCvExists);

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

  // Scroll to and focus the first invalid field so the user immediately sees
  // what needs fixing when validation fails on submit.
  const validateForm = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      focusFirstErrorField(form.formState.errors);
    }
    return isValid;
  };

  const { handleDone, isSavingCandidateProfile } = useCvBuilderDone({
    candidateId,
    userId,
    candidateProfile,
    getFormValues: form.getValues,
    selectedLanguageEntries,
    buildMyCvExists,
    validateForm,
    hasFormChanges,
    userRole: user?.role,
    guestApplicationDraft,
  });

  const handleUploadDone = async () => {
    if (!selectedUploadFile) return;
    setUploadError(null);
    setIsReadingResume(true);
    let hasStartedParsing = false;

    try {
      const extractedText = await extractResumeTextWithTimeout(selectedUploadFile);
      setIsReadingResume(false);
      setIsParsingResume(true);
      hasStartedParsing = true;
      const parsedResume = await aiApi.parseResume({
        extracted_text: extractedText,
        ...(isGuestApplication
          ? { owner_type: "VISITOR" as const }
          : { owner_type: "CANDIDATE" as const }),
      });
      setVisitorId(parsedResume.visitor_id);
          setIsParsingResume(false);
      const prefillData = buildResumePrefillData(parsedResume, extractedText);
      const mergedPrefillData = {
        ...cvBuilderPrefillData,
        ...prefillData,
        personalDetails: {
          ...cvBuilderPrefillData?.personalDetails,
          ...prefillData.personalDetails,
        },
      };

      if (isGuestApplication && mergedPrefillData.personalDetails?.email) {
        void checkEmail(mergedPrefillData.personalDetails.email);
      }

      if (isGuestApplication) {
        setUploadModalOpen(false);
        openReviewFlowBlank(mergedPrefillData);
        return;
      }

      if (!candidateId) {
        setUploadError("Your candidate profile is still loading. Please try again shortly.");
        return;
      }

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
      setUploadError(
        hasStartedParsing
          ? "We could not process your CV. Please try again."
          : "We could not read your CV. Please use a text-based PDF or DOCX file and try again.",
      );
    } finally {
      setIsReadingResume(false);
      setIsParsingResume(false);
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
        onClick: () => {
          setUploadError(null);
          setUploadModalOpen(true);
        },
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
    isParsingResume,
    isReadingResume,
    isSavingCandidateProfile,
    isUploadingResume,
    openUploadPicker,
    reviewSource,
    selectUploadFile,
    selectedUploadFile,
    setUploadModalOpen,
    uploadInputRef,
    uploadError,
    uploadModalOpen,
    visitorId,
    guestJobTags: isGuestApplication ? guestJobTags : undefined,
    onEmailBlur: handleEmailBlur,
    isCandidateExistsModalOpen,
    existingCandidateEmail,
    isCheckingEmail,
    closeCandidateExistsModal,
    goToLoginFromCandidateExistsModal,
  };
};