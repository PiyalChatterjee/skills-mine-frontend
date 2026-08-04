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
import { CV_BUILDER_STEPS, type CvActionCard } from '../types/cvBuilder'
import styles from './CvBuilderPage.module.css'
import CvBuilderViewCvPage from '../components/CvBuilderViewCvPage'

const CvBuilderPage = () => {
  const { user } = useAuth()
  const candidateId = user?.id
  const { data: candidateProfile } = useCandidateProfileQuery(candidateId)

  const profileDefaults = useMemo(
    () => ({
      fullName: candidateProfile?.fullName ?? '',
      residentialLocation: candidateProfile?.location ?? '',
      currentCompany: candidateProfile?.currentCompany ?? '',
      currentPosition: candidateProfile?.currentTitle ?? '',
      noticePeriod: '',
    }),
    [candidateProfile],
  )

  const {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    formValues,
    careerHistory,
    skills,
    tertiaryEducation,
    secondaryEducation,
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
    toggleLanguage,
  } = useCvBuilder(profileDefaults)

  const actionCards: CvActionCard[] = [
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
  ]

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
            selectedLanguages={selectedLanguages}
            onClose={closePreview}
          />
        ) : activeView === 'review' ? (
          <CvBuilderReviewScreen
            formValues={formValues}
            careerHistory={careerHistory}
            skills={skills}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguages={selectedLanguages}
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
            onPreview={openPreview}
          />
        ) : activeView === 'view-cv' ? (
          <CvBuilderViewCvPage
            formValues={formValues}
            careerHistory={careerHistory}
            skills={skills}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguages={selectedLanguages}
          />
        ) : (
          <Box className={styles.contentLayout}>
            <CvBuilderProgressRail steps={CV_BUILDER_STEPS} activeStepId={currentStepId} />
            <Box key={currentStepId}>
              {currentStepId === 1 && (
                <CvBuilderPersonalDetailsForm
                  values={formValues}
                  onTextFieldChange={handleTextFieldChange}
                  onSelectFieldChange={handleSelectFieldChange}
                />
              )}
              {currentStepId === 2 && (
                <CvBuilderCareerHistoryForm
                  entries={careerHistory}
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
                  onUpdateSkill={updateSkill}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                />
              )}
              {currentStepId === 4 && (
                <CvBuilderEducationForm
                  tertiaryEntries={tertiaryEducation}
                  secondaryEntries={secondaryEducation}
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
                  onToggleLanguage={toggleLanguage}
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
          isNextDisabled={false}
          nextLabel="View CV"
          showNextIcon={false}
        />
      )}

      {activeView === 'view-cv' && (
        <CvBuilderFooterActions
          onBack={goBack}
          onNext={goNext}
          isNextDisabled={false}
          nextLabel="Done"
          showNextIcon={false}
        />
      )}
    </Box>
  )
}

export default CvBuilderPage
