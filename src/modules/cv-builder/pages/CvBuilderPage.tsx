import { Box } from '@mui/material'
import { useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { useAuth } from '@/app/auth/AuthContext'
import settingsIcon from '@/assets/cv-builder/settings-4-line.svg'
import uploadIcon from '@/assets/cv-builder/upload-2-line.svg'
import { useCandidateProfileQuery } from '@/modules/candidate/hooks/useCandidateQueries'
import CvBuilderCareerHistoryForm from '../components/CvBuilderCareerHistoryForm'
import CvBuilderEducationForm from '../components/CvBuilderEducationForm'
import CvBuilderFooterActions from '../components/CvBuilderFooterActions'
import CvBuilderHeroSection from '../components/CvBuilderHeroSection'
import CvBuilderLauncher from '../components/CvBuilderLauncher'
import CvBuilderPersonalDetailsForm from '../components/CvBuilderPersonalDetailsForm'
import CvBuilderProgressRail from '../components/CvBuilderProgressRail'
import CvBuilderPreviewPage from '../components/CvBuilderPreviewPage'
import CvBuilderReviewScreen from '../components/CvBuilderReviewScreen'
import CvBuilderLanguagesForm from '../components/CvBuilderLanguagesForm'
import CvBuilderSkillsForm from '../components/CvBuilderSkillsForm'
import useCvBuilder from '../hooks/useCvBuilder'
import { buildCvBuilderPrefillData, useCvBuilderDone } from '../hooks/useCvBuilderDone'
import { CV_BUILDER_STEPS, type CvActionCard } from '../types/cvBuilder'
import styles from './CvBuilderPage.module.css'
import CvBuilderViewCvPage from '../components/CvBuilderViewCvPage'

const CvBuilderPage = () => {
  const { user } = useAuth()
  const userId = user?.userId
  const { data: candidateProfile } = useCandidateProfileQuery(userId)

  const cvBuilderPrefillData = useMemo(
    () => buildCvBuilderPrefillData(candidateProfile),
    [candidateProfile],
  )

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
  } = useCvBuilder(cvBuilderPrefillData)

  const { handleDone, isSavingCandidateProfile } = useCvBuilderDone({
    activeView,
    goNext,
    userId,
    candidateProfile,
    getFormValues: form.getValues,
    selectedLanguageEntries,
  })

  const actionCards: CvActionCard[] = useMemo(
    () => [
      {
        id: 'upload',
        title: 'Upload my CV',
        description: selectedUploadFile
          ? `Selected file: ${selectedUploadFile.name}`
          : 'Upload your CV directly from your computer.',
        icon: uploadIcon,
        tone: 'coral',
        onClick: openUploadPicker,
      },
      {
        id: 'build',
        title: 'Build my CV',
        description: 'Create a CV with The Skills Mine CV builder.',
        icon: settingsIcon,
        tone: 'teal',
        onClick: openBuildFlow,
      },
    ],
    [selectedUploadFile, openUploadPicker, openBuildFlow],
  )

  return (
    <FormProvider {...form}>
      <Box className={`${styles.pageRoot} ${activeView === 'view-cv' ? styles.pageRootViewCv : ''}`}>
        <input
          ref={uploadInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUploadFileSelect}
          className={styles.hiddenFileInput}
          tabIndex={-1}
          aria-hidden="true"
        />

        {activeView !== 'view-cv' && (
          <CvBuilderHeroSection totalSteps={CV_BUILDER_STEPS.length} activeStepId={activeView === 'launcher' ? 1 : currentStepId} />
        )}

        <Box
          component="section"
          className={`${styles.contentSection} ${activeView === 'view-cv' ? styles.contentSectionViewCv : ''}`}
        >
          {activeView === 'launcher' ? (
            <CvBuilderLauncher cards={actionCards} />
          ) : activeView === 'preview' ? (
            <CvBuilderPreviewPage onClose={closePreview} />
          ) : activeView === 'review' ? (
            <CvBuilderReviewScreen onPreview={openPreview} />
          ) : activeView === 'view-cv' ? (
            <CvBuilderViewCvPage />
          ) : (
            <Box className={styles.contentLayout}>
              <CvBuilderProgressRail steps={CV_BUILDER_STEPS} activeStepId={currentStepId} />
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

        {activeView === 'form' && (
          <CvBuilderFooterActions onBack={goBack} onNext={goNext} isNextDisabled={!canGoNext} />
        )}

        {activeView === 'review' && (
          <CvBuilderFooterActions
            onBack={goBack}
            onNext={goNext}
            isNextDisabled={!canViewCv}
            nextLabel="View CV"
            showNextIcon={false}
          />
        )}

        {activeView === 'view-cv' && (
          <CvBuilderFooterActions
            onBack={goBack}
            onNext={handleDone}
            isNextDisabled={isSavingCandidateProfile}
            nextLabel="Done"
            showNextIcon={false}
          />
        )}
      </Box>
    </FormProvider>
  )
}

export default CvBuilderPage
