import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import closeIcon from '@/assets/cv-builder/close-line.svg'
import type {
  CareerHistoryEntry,
  PersonalDetailsFormState,
  SecondaryEducationEntry,
  SkillEntry,
  TertiaryEducationEntry,
} from '../types/cvBuilder'
import CvBuilderPreviewDocument from './CvBuilderPreviewDocument'
import styles from '../pages/CvBuilderPage.module.css'

type CvBuilderPreviewPageProps = {
  formValues: PersonalDetailsFormState
  careerHistory: CareerHistoryEntry[]
  skills: SkillEntry[]
  tertiaryEducation: TertiaryEducationEntry[]
  secondaryEducation: SecondaryEducationEntry[]
  selectedLanguageEntries: string[]
  onClose: () => void
}

const CvBuilderPreviewPage = ({
  formValues,
  careerHistory,
  skills,
  tertiaryEducation,
  secondaryEducation,
  selectedLanguageEntries,
  onClose,
}: CvBuilderPreviewPageProps) => {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  return (
    <Box className={styles.previewPageOverlay}>
      <Box className={styles.previewPageContainer}>
        <Button
          type="button"
          onClick={onClose}
          className={styles.previewPageCloseButton}
          disableRipple
        >
          <Box component="img" src={closeIcon} alt="Close preview" className={styles.previewPageCloseIcon} />
        </Button>

        <CvBuilderPreviewDocument
          size="full"
          formValues={formValues}
          careerHistory={careerHistory}
          skills={skills}
          tertiaryEducation={tertiaryEducation}
          secondaryEducation={secondaryEducation}
          selectedLanguageEntries={selectedLanguageEntries}
        />
      </Box>
    </Box>
  )
}

export default CvBuilderPreviewPage
