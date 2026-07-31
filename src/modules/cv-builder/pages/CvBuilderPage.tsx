import { Box } from '@mui/material'
import settingsIcon from '@/assets/cv-builder/settings-4-line.svg'
import uploadIcon from '@/assets/cv-builder/upload-2-line.svg'
import CvBuilderCareerHistoryForm from '../components/CvBuilderCareerHistoryForm'
import CvBuilderFooterActions from '../components/CvBuilderFooterActions'
import CvBuilderHeroSection from '../components/CvBuilderHeroSection'
import CvBuilderLauncher from '../components/CvBuilderLauncher'
import CvBuilderPersonalDetailsForm from '../components/CvBuilderPersonalDetailsForm'
import CvBuilderProgressRail from '../components/CvBuilderProgressRail'
import CvBuilderSkillsForm from '../components/CvBuilderSkillsForm'
import useCvBuilder from '../hooks/useCvBuilder'
import { CV_BUILDER_STEPS, type CvActionCard } from '../types/cvBuilder'
import styles from './CvBuilderPage.module.css'

const CvBuilderPage = () => {
  const {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    formValues,
    careerHistory,
    skills,
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
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
  } = useCvBuilder()

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
    <Box className={styles.pageRoot}>
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleUploadFileSelect}
        className={styles.hiddenFileInput}
        tabIndex={-1}
        aria-hidden="true"
      />

      <CvBuilderHeroSection totalSteps={CV_BUILDER_STEPS.length} activeStepId={activeView === 'launcher' ? 1 : currentStepId} />

      <Box component="section" className={styles.contentSection}>
        {activeView === 'launcher' ? (
          <CvBuilderLauncher cards={actionCards} />
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
            </Box>
          </Box>
        )}
      </Box>

      {activeView === 'form' && (
        <CvBuilderFooterActions onBack={goBack} onNext={goNext} isNextDisabled={!canGoNext} />
      )}
    </Box>
  )
}

export default CvBuilderPage
