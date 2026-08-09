import { Box } from "@mui/material";
import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { useAuth } from "@/app/auth/AuthContext";
import settingsIcon from "@/assets/cv-builder/settings-4-line.svg";
import uploadIcon from "@/assets/cv-builder/upload-2-line.svg";
import {
  useBuildMyCvQuery,
  useCandidateProfileQuery,
} from "@/modules/candidate/hooks/useCandidateQueries";
import { useSelector } from "react-redux";
import {
  selectBuildMyCv,
  selectBuildMyCvExists,
  selectBuildMyCvLastModified,
  selectBuildMyCvLoaded,
} from "@/store/selectors";
import CvBuilderCareerHistoryForm from "../components/CvBuilderCareerHistoryForm";
import CvBuilderEducationForm from "../components/CvBuilderEducationForm";
import CvBuilderFooterActions from "../components/CvBuilderFooterActions";
import CvBuilderHeroSection from "../components/CvBuilderHeroSection";
import CvBuilderLauncher from "../components/CvBuilderLauncher";
import CvBuilderPersonalDetailsForm from "../components/CvBuilderPersonalDetailsForm";
import CvBuilderProgressRail from "../components/CvBuilderProgressRail";
import CvBuilderPreviewPage from "../components/CvBuilderPreviewPage";
import CvBuilderReviewScreen from "../components/CvBuilderReviewScreen";
import CvBuilderLanguagesForm from "../components/CvBuilderLanguagesForm";
import CvBuilderSkillsForm from "../components/CvBuilderSkillsForm";
import useCvBuilder from "../hooks/useCvBuilder";
import {
  buildCvBuilderPrefillData,
  isoToMonthName,
  useCvBuilderDone,
} from "../hooks/useCvBuilderDone";
import {
  CV_BUILDER_STEPS,
  LANGUAGES_LIST,
  type CvActionCard,
} from "../types/cvBuilder";
import styles from "./CvBuilderPage.module.css";
import CvBuilderViewCvPage from "../components/CvBuilderViewCvPage";

const CvBuilderPage = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  // Load existing CV Builder state from GET endpoint and hydrate Redux
  const { isLoading: isBuildMyCvLoading } = useBuildMyCvQuery(Boolean(userId));
  const buildMyCvData = useSelector(selectBuildMyCv);
  const buildMyCvLoaded = useSelector(selectBuildMyCvLoaded);
  const buildMyCvExists = useSelector(selectBuildMyCvExists);
  const buildMyCvLastModified = useSelector(selectBuildMyCvLastModified);

  const { data: candidateProfile } = useCandidateProfileQuery(userId);

  // Prefer buildMyCv API data; fall back to candidate profile for prefill
  const cvBuilderPrefillData = useMemo(() => {
    if (buildMyCvLoaded && buildMyCvData) {
      return {
        personalDetails: {
          fullName:
            `${buildMyCvData.personalDetails.firstName ?? ""} ${buildMyCvData.personalDetails.lastName ?? ""}`.trim(),
          residentialLocation: buildMyCvData.personalDetails.location ?? "",
          nationality: buildMyCvData.personalDetails.nationality ?? "",
          noticePeriod: buildMyCvData.personalDetails.noticePeriod ?? "",
          currentCompany: buildMyCvData.personalDetails.currentCompany ?? "",
          currentPosition: buildMyCvData.personalDetails.currentPosition ?? "",
          race: buildMyCvData.personalDetails.race ?? "",
          gender: buildMyCvData.personalDetails.gender ?? "",
          disabilityStatus:
            buildMyCvData.personalDetails.disabilityStatus ?? "",
        },
        careerHistory: (Array.isArray(buildMyCvData.careerHistory)
          ? buildMyCvData.careerHistory
          : []
        ).map((entry) => ({
          companyName: entry.company ?? "",
          positionHeld: entry.jobTitle ?? "",
          startDate: isoToMonthName(entry.startDate ?? ""),
          endDate:
            entry.endDate == null ||
            (entry.endDate ?? "").toLowerCase() === "present"
              ? "Present"
              : isoToMonthName(entry.endDate),
          isCurrentRole:
            entry.endDate == null ||
            (entry.endDate ?? "").toLowerCase() === "present",
          tasks: [entry.responsibilities ?? ""],
          projects: [""],
        })),
        skills: (Array.isArray(buildMyCvData.skills)
          ? buildMyCvData.skills
          : []
        ).map((name) => ({ name })),
        tertiaryEducation: (
          buildMyCvData.education?.tertiaryEducation ?? []
        ).map((entry) => ({
          institutionName: entry.institution ?? "",
          degreeOrCertification: entry.qualification ?? "",
          yearCompleted: String(entry.yearCompleted ?? ""),
        })),
        secondaryEducation: (
          buildMyCvData.education?.secondaryEducation ?? []
        ).map((entry) => ({
          institutionName: entry.schoolName ?? "",
          highestGradePassed: entry.qualification ?? "",
          yearCompleted: String(entry.yearCompleted ?? ""),
        })),
        languages: (Array.isArray(buildMyCvData.languages)
          ? buildMyCvData.languages
          : []
        )
          .map((l) => l.language)
          .filter((lang): lang is (typeof LANGUAGES_LIST)[number] =>
            LANGUAGES_LIST.includes(lang as never),
          ),
        otherLanguage:
          (Array.isArray(buildMyCvData.languages)
            ? buildMyCvData.languages
            : []
          )
            .map((l) => l.language)
            .find((lang) => !LANGUAGES_LIST.includes(lang as never)) ?? "",
      };
    }

    return buildCvBuilderPrefillData(candidateProfile);
  }, [buildMyCvLoaded, buildMyCvData, candidateProfile]);

  const {
    form,
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    canViewCv,
    canGoNext,
    selectedLanguageEntries,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    openPreview,
    closePreview,
    goBack,
    goNext,
  } = useCvBuilder(
    cvBuilderPrefillData,
    buildMyCvLoaded && Boolean(buildMyCvData),
  );

  const { handleDone, isSavingCandidateProfile } = useCvBuilderDone({
    activeView,
    goNext,
    userId,
    candidateProfile,
    getFormValues: form.getValues,
    selectedLanguageEntries,
    buildMyCvExists,
  });

  const actionCards: CvActionCard[] = useMemo(
    () => [
      {
        id: "upload",
        title: "Upload my CV",
        description: selectedUploadFile
          ? `Selected file: ${selectedUploadFile.name}`
          : "Upload your CV directly from your computer.",
        icon: uploadIcon,
        tone: "coral",
        onClick: openUploadPicker,
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
    [selectedUploadFile, openUploadPicker, openBuildFlow, isBuildMyCvLoading],
  );

  return (
    <FormProvider {...form}>
      <Box
        className={`${styles.pageRoot} ${activeView === "view-cv" ? styles.pageRootViewCv : ""}`}
      >
        <input
          ref={uploadInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUploadFileSelect}
          className={styles.hiddenFileInput}
          tabIndex={-1}
          aria-hidden="true"
        />

        {activeView !== "view-cv" && (
          <CvBuilderHeroSection
            totalSteps={CV_BUILDER_STEPS.length}
            activeStepId={activeView === "launcher" ? 1 : currentStepId}
          />
        )}

        <Box
          component="section"
          className={`${styles.contentSection} ${activeView === "view-cv" ? styles.contentSectionViewCv : ""}`}
        >
          {activeView === "launcher" ? (
            <CvBuilderLauncher cards={actionCards} />
          ) : activeView === "preview" ? (
            <CvBuilderPreviewPage onClose={closePreview} />
          ) : activeView === "review" ? (
            <CvBuilderReviewScreen onPreview={openPreview} />
          ) : activeView === "view-cv" ? (
            <CvBuilderViewCvPage />
          ) : (
            <Box className={styles.contentLayout}>
              <CvBuilderProgressRail
                steps={CV_BUILDER_STEPS}
                activeStepId={currentStepId}
              />
              <Box key={currentStepId}>
                {currentStepId === 1 && <CvBuilderPersonalDetailsForm />}
                {currentStepId === 2 && <CvBuilderCareerHistoryForm />}
                {currentStepId === 3 && <CvBuilderSkillsForm />}
                {currentStepId === 4 && <CvBuilderEducationForm />}
                {currentStepId === 5 && <CvBuilderLanguagesForm />}
              </Box>
            </Box>
          )}
        </Box>

        {activeView === "form" && (
          <CvBuilderFooterActions
            onBack={goBack}
            onNext={goNext}
            isNextDisabled={!canGoNext}
          />
        )}

        {activeView === "review" && (
          <CvBuilderFooterActions
            onBack={goBack}
            onNext={goNext}
            isNextDisabled={!canViewCv}
            nextLabel="View CV"
            showNextIcon={false}
          />
        )}

        {activeView === "view-cv" && (
          <CvBuilderFooterActions
            onBack={goBack}
            onNext={handleDone}
            isNextDisabled={isSavingCandidateProfile}
            nextLabel={isSavingCandidateProfile ? "Saving…" : "Done"}
            showNextIcon={false}
            subLabel={
              buildMyCvLastModified
                ? `Last saved ${new Date(buildMyCvLastModified).toLocaleString()}`
                : undefined
            }
          />
        )}
      </Box>
    </FormProvider>
  );
};

export default CvBuilderPage;
