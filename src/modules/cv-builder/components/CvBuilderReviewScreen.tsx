import { Box, Button, Typography } from '@mui/material'
import { type ReactNode, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import educationIcon from '@/assets/cv-builder/education-line.svg'
import languagesIcon from '@/assets/cv-builder/languages-line.svg'
import minusIcon from '@/assets/cv-builder/minus-line.svg'
import plusIcon from '@/assets/cv-builder/plus-line.svg'
import skillsIcon from '@/assets/cv-builder/skills-sparkle.svg'
import userIcon from '@/assets/public-layout/user-icon.svg'
import CvBuilderPreviewDocument from './CvBuilderPreviewDocument'
import CvBuilderCareerHistoryForm from './CvBuilderCareerHistoryForm'
import CvBuilderEducationForm from './CvBuilderEducationForm'
import CvBuilderLanguagesForm from './CvBuilderLanguagesForm'
import CvBuilderPersonalDetailsForm from './CvBuilderPersonalDetailsForm'
import CvBuilderSkillsForm from './CvBuilderSkillsForm'
import styles from '../pages/CvBuilderPage.module.css'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'

type ReviewSectionId = 'personal' | 'career' | 'skills' | 'education' | 'languages'

type ReviewSectionConfig = {
  id: ReviewSectionId
  label: string
  icon: string
  renderContent: () => ReactNode
}

const REVIEW_SECTIONS: ReviewSectionConfig[] = [
  { id: 'personal',  label: 'Personal details', icon: userIcon,     renderContent: () => <CvBuilderPersonalDetailsForm /> },
  { id: 'career',    label: 'Career history',   icon: buildingIcon, renderContent: () => <CvBuilderCareerHistoryForm /> },
  { id: 'skills',    label: 'Skills',           icon: skillsIcon,   renderContent: () => <CvBuilderSkillsForm /> },
  { id: 'education', label: 'Education',        icon: educationIcon,renderContent: () => <CvBuilderEducationForm /> },
  { id: 'languages', label: 'Languages',        icon: languagesIcon,renderContent: () => <CvBuilderLanguagesForm /> },
]

type CvBuilderReviewScreenProps = {
  onPreview: () => void
}

const CvBuilderReviewScreen = ({ onPreview }: CvBuilderReviewScreenProps) => {
  const { control } = useFormContext<CvBuilderFormValues>()
  const [expandedSections, setExpandedSections] = useState<Set<ReviewSectionId>>(new Set())

  const formValues    = useWatch({ control, name: 'personalDetails' })
  const careerHistory = useWatch({ control, name: 'careerHistory' })
  const skills        = useWatch({ control, name: 'skills' })
  const tertiary      = useWatch({ control, name: 'tertiaryEducation' })
  const secondary     = useWatch({ control, name: 'secondaryEducation' })
  const languages     = useWatch({ control, name: 'languages' }) ?? []
  const otherLanguage = useWatch({ control, name: 'otherLanguage' }) ?? ''

  const selectedLanguageEntries = [
    ...languages.filter((l: string) => l !== 'Other'),
    ...(languages.includes('Other') && otherLanguage.trim() ? [otherLanguage.trim()] : []),
  ]

  const toggleSection = (sectionId: ReviewSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current)
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
      return next
    })
  }

  return (
    <Box className={styles.reviewLayout}>
      <Box className={styles.reviewMainColumn}>
        <Typography className={styles.reviewTitle}>Review your CV.</Typography>
        <Typography className={styles.reviewDescription}>
          Excellent job! Your CV has been successfully created. Please take a moment to review your details to ensure their accuracy.
        </Typography>

        <Box className={styles.reviewSectionsList}>
          {REVIEW_SECTIONS.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            return (
              <Box key={section.id} className={styles.reviewSectionItem}>
                <Button type="button" className={styles.reviewSectionToggle} disableRipple onClick={() => toggleSection(section.id)}>
                  <Box className={styles.reviewSectionIconBadge} aria-hidden="true">
                    <Box component="img" src={section.icon} alt="" className={styles.reviewSectionIcon} />
                  </Box>
                  <Typography className={styles.reviewSectionLabel}>{section.label}</Typography>
                  <Box component="img" src={isExpanded ? minusIcon : plusIcon} alt="" className={styles.reviewSectionExpandIcon} aria-hidden="true" />
                </Button>

                {isExpanded && (
                  <Box className={styles.reviewSectionContent}>
                    <Box className={styles.reviewEmbeddedSectionContent}>{section.renderContent()}</Box>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>

      <Box className={styles.reviewPreviewColumn}>
        <Box className={styles.reviewPreviewCard}>
          <Box className={styles.reviewPreviewHeader}>
            <Typography className={styles.reviewPreviewTitle}>Your CV</Typography>
            <Button type="button" className={styles.reviewPreviewButton} disableRipple onClick={onPreview}>Preview</Button>
          </Box>

          <CvBuilderPreviewDocument
            size="compact"
            formValues={formValues}
            careerHistory={careerHistory ?? []}
            skills={skills ?? []}
            tertiaryEducation={tertiary ?? []}
            secondaryEducation={secondary ?? []}
            selectedLanguageEntries={selectedLanguageEntries}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default CvBuilderReviewScreen
