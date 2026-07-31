import { Box } from '@mui/material'
import settingsIcon from '@/assets/cv-builder/settings-4-line.svg'
import uploadIcon from '@/assets/cv-builder/upload-2-line.svg'
import CvBuilderFooterActions from '../components/CvBuilderFooterActions'
import CvBuilderHeroSection from '../components/CvBuilderHeroSection'
import CvBuilderLauncher from '../components/CvBuilderLauncher'
import CvBuilderPersonalDetailsForm from '../components/CvBuilderPersonalDetailsForm'
import CvBuilderProgressRail from '../components/CvBuilderProgressRail'
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
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    handleTextFieldChange,
    handleSelectFieldChange,
    goBack,
    goNext,
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

      <CvBuilderHeroSection />

      <Box component="section" className={styles.contentSection}>
        {activeView === 'launcher' ? (
          <CvBuilderLauncher cards={actionCards} />
        ) : (
          <Box className={styles.contentLayout}>
            <CvBuilderProgressRail steps={CV_BUILDER_STEPS} activeStepId={currentStepId} />
            <CvBuilderPersonalDetailsForm
              values={formValues}
              onTextFieldChange={handleTextFieldChange}
              onSelectFieldChange={handleSelectFieldChange}
            />
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
