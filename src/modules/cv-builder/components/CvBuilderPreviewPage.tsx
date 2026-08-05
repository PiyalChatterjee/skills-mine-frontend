import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import closeIcon from '@/assets/cv-builder/close-line.svg'
import { useFormContext, useWatch } from 'react-hook-form'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'
import CvBuilderPreviewDocument from './CvBuilderPreviewDocument'
import styles from '../pages/CvBuilderPage.module.css'

type CvBuilderPreviewPageProps = {
  onClose: () => void
}

const CvBuilderPreviewPage = ({ onClose }: CvBuilderPreviewPageProps) => {
  const { control } = useFormContext<CvBuilderFormValues>()
  const formValues    = useWatch({ control, name: 'personalDetails' })
  const careerHistory = useWatch({ control, name: 'careerHistory' }) ?? []
  const skills        = useWatch({ control, name: 'skills' }) ?? []
  const tertiary      = useWatch({ control, name: 'tertiaryEducation' }) ?? []
  const secondary     = useWatch({ control, name: 'secondaryEducation' }) ?? []
  const languages     = useWatch({ control, name: 'languages' }) ?? []
  const otherLanguage = useWatch({ control, name: 'otherLanguage' }) ?? ''
  const selectedLanguageEntries = [
    ...languages.filter((l: string) => l !== 'Other'),
    ...(languages.includes('Other') && otherLanguage.trim() ? [otherLanguage.trim()] : []),
  ]
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
          tertiaryEducation={tertiary}
          secondaryEducation={secondary}
          selectedLanguageEntries={selectedLanguageEntries}
        />
      </Box>
    </Box>
  )
}

export default CvBuilderPreviewPage
