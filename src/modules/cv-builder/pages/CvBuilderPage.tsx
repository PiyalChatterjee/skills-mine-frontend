import { Box } from '@mui/material'
import { useMemo } from 'react'
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
  const candidateId = user?.id
  const { data: candidateProfile } = useCandidateProfileQuery(candidateId)

  const cvBuilderPrefillData = useMemo(
    () => buildCvBuilderPrefillData(candidateProfile),
    [candidateProfile],
  )

  const {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    canViewCv,
    formValues,
    personalDetailsErrors,
    careerHistoryErrors,
    skillsErrors,
    educationErrors,
    careerHistory,
    skills,
    tertiaryEducation,
    secondaryEducation,
    languagesErrors,
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    openPreview,
    closePreview,
    handleTextFieldChange,
    handleSelectFieldChange,
    goBack,
    goNext,
    addPosition,
    updatePosition,
    addTask,
    updateTask,
    addProject,
    updateProject,
    addSkill,
    updateSkill,
    removeSkill,
    addTertiaryEntry,
    updateTertiaryEntry,
    removeTertiaryEntry,
    addSecondaryEntry,
    updateSecondaryEntry,
    removeSecondaryEntry,
    selectedLanguages,
    selectedLanguageEntries,
    otherLanguage,
    toggleLanguage,
    updateOtherLanguage,
  } = useCvBuilder(cvBuilderPrefillData)

  const { handleDone, isSavingCandidateProfile } = useCvBuilderDone({
    activeView,
    goNext,
    candidateId,
    candidateProfile,
    formValues,
    careerHistory,
    skills,
    tertiaryEducation,
    secondaryEducation,
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
          <CvBuilderPreviewPage
            formValues={formValues}
            careerHistory={careerHistory}
            skills={skills}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguageEntries={selectedLanguageEntries}
            onClose={closePreview}
          />
        ) : activeView === 'review' ? (
          <CvBuilderReviewScreen
            formValues={formValues}
            personalDetailsErrors={personalDetailsErrors}
            careerHistoryErrors={careerHistoryErrors}
            careerHistory={careerHistory}
            skills={skills}
            skillsErrors={skillsErrors}
            educationErrors={educationErrors}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguages={selectedLanguages}
            selectedLanguageEntries={selectedLanguageEntries}
            otherLanguage={otherLanguage}
            languagesErrors={languagesErrors}
            onTextFieldChange={handleTextFieldChange}
            onSelectFieldChange={handleSelectFieldChange}
            onUpdatePosition={updatePosition}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onAddPosition={addPosition}
            onUpdateSkill={updateSkill}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            onUpdateTertiary={updateTertiaryEntry}
            onAddTertiary={addTertiaryEntry}
            onRemoveTertiary={removeTertiaryEntry}
            onUpdateSecondary={updateSecondaryEntry}
            onAddSecondary={addSecondaryEntry}
            onRemoveSecondary={removeSecondaryEntry}
            onToggleLanguage={toggleLanguage}
            onOtherLanguageChange={updateOtherLanguage}
            onPreview={openPreview}
          />
        ) : activeView === 'view-cv' ? (
          <CvBuilderViewCvPage
            formValues={formValues}
            careerHistory={careerHistory}
            skills={skills}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguageEntries={selectedLanguageEntries}
          />
        ) : (
          <Box className={styles.contentLayout}>
            <CvBuilderProgressRail steps={CV_BUILDER_STEPS} activeStepId={currentStepId} />
            <Box key={currentStepId}>
              {currentStepId === 1 && (
                <CvBuilderPersonalDetailsForm
                  values={formValues}
                  errors={personalDetailsErrors}
                  onTextFieldChange={handleTextFieldChange}
                  onSelectFieldChange={handleSelectFieldChange}
                />
              )}
              {currentStepId === 2 && (
                <CvBuilderCareerHistoryForm
                  entries={careerHistory}
                  formError={careerHistoryErrors.form}
                  errorsByEntryId={careerHistoryErrors.byEntryId}
                  onUpdatePosition={updatePosition}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onAddProject={addProject}
                  onUpdateProject={updateProject}
                  onAddPosition={addPosition}
                />
              )}
              {currentStepId === 3 && (
                <CvBuilderSkillsForm
                  skills={skills}
                  formError={skillsErrors.form}
                  onUpdateSkill={updateSkill}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                />
              )}
              {currentStepId === 4 && (
                <CvBuilderEducationForm
                  tertiaryEntries={tertiaryEducation}
                  secondaryEntries={secondaryEducation}
                  formError={educationErrors.form}
                  tertiaryErrorsByEntryId={educationErrors.tertiaryByEntryId}
                  secondaryErrorsByEntryId={educationErrors.secondaryByEntryId}
                  onUpdateTertiary={updateTertiaryEntry}
                  onAddTertiary={addTertiaryEntry}
                  onRemoveTertiary={removeTertiaryEntry}
                  onUpdateSecondary={updateSecondaryEntry}
                  onAddSecondary={addSecondaryEntry}
                  onRemoveSecondary={removeSecondaryEntry}
                />
              )}
              {currentStepId === 5 && (
                <CvBuilderLanguagesForm
                  selectedLanguages={selectedLanguages}
                  formError={languagesErrors.form}
                  otherLanguageError={languagesErrors.otherLanguage}
                  otherLanguageValue={otherLanguage}
                  onToggleLanguage={toggleLanguage}
                  onOtherLanguageChange={updateOtherLanguage}
                />
              )}
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
  )
}

export default CvBuilderPage
