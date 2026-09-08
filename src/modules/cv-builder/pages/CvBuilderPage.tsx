import { Box } from "@mui/material";
import { FormProvider } from "react-hook-form";
import { usePageTitle } from "@/hooks/usePageTitle";
import CvBuilderFooterActions from "../components/CvBuilderFooterActions";
import CvBuilderHeroSection from "../components/CvBuilderHeroSection";
import CvBuilderLauncher from "../components/CvBuilderLauncher";
import CvBuilderReviewScreen from "../components/CvBuilderReviewScreen";
import styles from "./CvBuilderPage.module.css";
import CvBuilderUploadModal from "../components/CvBuilderUploadModal";
import { useCvBuilderPageViewModel } from "../hooks/useCvBuilderPageViewModel";

const CvBuilderPage = () => {
  const {
    actionCards,
    form,
    uploadInputRef,
    activeView,
    canViewCv,
    reviewSource,
    selectedUploadFile,
    handleUploadFileSelect,
    selectUploadFile,
    openUploadPicker,
    handleDone,
    handleUploadDone,
    heroBackHandler,
    heroHeading,
    isGuestApplication,
    isSavingCandidateProfile,
    isUploadingResume,
    setUploadModalOpen,
    uploadModalOpen,
    guestJobTags,
  } = useCvBuilderPageViewModel();

  usePageTitle("CV Builder");

  return (
    <FormProvider {...form}>
      <Box
        className={styles.pageRoot}
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

        <CvBuilderHeroSection
          onBack={heroBackHandler}
          heading={heroHeading}
          tags={guestJobTags}
          isJobContext={isGuestApplication}
        />

        <Box
          component="section"
          className={styles.contentSection}
        >
          {activeView === "launcher" ? (
            <CvBuilderLauncher
              cards={actionCards}
              heading={isGuestApplication ? "Upload your CV" : undefined}
            />
          ) : reviewSource === "upload" ? (
            <CvBuilderReviewScreen
              title="Review your CV."
              description="Your CV has been uploaded, we have highlighted potential gaps in your CV."
            />
          ) : (
            <CvBuilderReviewScreen />
          )}
        </Box>

        {activeView === "review" && (
          <CvBuilderFooterActions
            onNext={handleDone}
            isNextDisabled={!canViewCv || isSavingCandidateProfile}
            nextLabel={isSavingCandidateProfile ? "Saving…" : "Save & Submit"}
            showNextIcon={false}
          />
        )}

        {uploadModalOpen && (
          <CvBuilderUploadModal
            selectedFile={selectedUploadFile}
            onSelectFile={selectUploadFile}
            onBrowse={openUploadPicker}
            onClose={() => setUploadModalOpen(false)}
            onDone={handleUploadDone}
            isUploading={isUploadingResume}
          />
        )}
      </Box>
    </FormProvider>
  );
};

export default CvBuilderPage;
