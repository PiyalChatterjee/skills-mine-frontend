import { Box, Button, Typography } from '@mui/material'
import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import educationIcon from '@/assets/cv-builder/education-line.svg'
import languagesIcon from '@/assets/cv-builder/languages-line.svg'
import minusIcon from '@/assets/cv-builder/minus-line.svg'
import plusIcon from '@/assets/cv-builder/plus-line.svg'
import skillsIcon from '@/assets/cv-builder/skills-sparkle.svg'
import userIcon from '@/assets/public-layout/user-icon.svg'
import CvBuilderPreviewDocument from './CvBuilderPreviewDocument'
import type {
  CareerHistoryEntry,
  Language,
  PersonalDetailsFormState,
  SecondaryEducationEntry,
  SkillEntry,
  TertiaryEducationEntry,
} from '../types/cvBuilder'
import CvBuilderCareerHistoryForm from './CvBuilderCareerHistoryForm'
import CvBuilderEducationForm from './CvBuilderEducationForm'
import CvBuilderLanguagesForm from './CvBuilderLanguagesForm'
import CvBuilderPersonalDetailsForm from './CvBuilderPersonalDetailsForm'
import CvBuilderSkillsForm from './CvBuilderSkillsForm'
import styles from '../pages/CvBuilderPage.module.css'

type ReviewSectionId = 'personal' | 'career' | 'skills' | 'education' | 'languages'

type CvBuilderReviewScreenProps = {
  formValues: PersonalDetailsFormState
  careerHistory: CareerHistoryEntry[]
  skills: SkillEntry[]
  tertiaryEducation: TertiaryEducationEntry[]
  secondaryEducation: SecondaryEducationEntry[]
  selectedLanguages: Set<Language>
  onTextFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
  onSelectFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdatePosition: (
    entryId: string,
    field: keyof Omit<CareerHistoryEntry, 'id' | 'tasks' | 'projects'>,
    value: string | boolean,
  ) => void
  onAddTask: (entryId: string) => void
  onUpdateTask: (entryId: string, taskIndex: number, value: string) => void
  onAddProject: (entryId: string) => void
  onUpdateProject: (entryId: string, projectIndex: number, value: string) => void
  onAddPosition: () => void
  onUpdateSkill: (skillId: string, value: string) => void
  onAddSkill: () => void
  onRemoveSkill: (skillId: string) => void
  onUpdateTertiary: (entryId: string, field: keyof Omit<TertiaryEducationEntry, 'id'>, value: string) => void
  onAddTertiary: () => void
  onRemoveTertiary: (entryId: string) => void
  onUpdateSecondary: (entryId: string, field: keyof Omit<SecondaryEducationEntry, 'id'>, value: string) => void
  onAddSecondary: () => void
  onRemoveSecondary: (entryId: string) => void
  onToggleLanguage: (language: Language) => void
  onPreview: () => void
}

type ReviewSectionConfig = {
  id: ReviewSectionId
  label: string
  icon: string
  renderContent: () => ReactNode
}

const CvBuilderReviewScreen = ({
  formValues,
  careerHistory,
  skills,
  tertiaryEducation,
  secondaryEducation,
  selectedLanguages,
  onTextFieldChange,
  onSelectFieldChange,
  onUpdatePosition,
  onAddTask,
  onUpdateTask,
  onAddProject,
  onUpdateProject,
  onAddPosition,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
  onUpdateTertiary,
  onAddTertiary,
  onRemoveTertiary,
  onUpdateSecondary,
  onAddSecondary,
  onRemoveSecondary,
  onToggleLanguage,
  onPreview,
}: CvBuilderReviewScreenProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<ReviewSectionId>>(new Set())

  const reviewSections = useMemo<ReviewSectionConfig[]>(
    () => [
      {
        id: 'personal',
        label: 'Personal details',
        icon: userIcon,
        renderContent: () => (
          <CvBuilderPersonalDetailsForm
            values={formValues}
            onTextFieldChange={onTextFieldChange}
            onSelectFieldChange={onSelectFieldChange}
          />
        ),
      },
      {
        id: 'career',
        label: 'Career history',
        icon: buildingIcon,
        renderContent: () => (
          <CvBuilderCareerHistoryForm
            entries={careerHistory}
            onUpdatePosition={onUpdatePosition}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onAddProject={onAddProject}
            onUpdateProject={onUpdateProject}
            onAddPosition={onAddPosition}
          />
        ),
      },
      {
        id: 'skills',
        label: 'Skills',
        icon: skillsIcon,
        renderContent: () => (
          <CvBuilderSkillsForm
            skills={skills}
            onUpdateSkill={onUpdateSkill}
            onAddSkill={onAddSkill}
            onRemoveSkill={onRemoveSkill}
          />
        ),
      },
      {
        id: 'education',
        label: 'Education',
        icon: educationIcon,
        renderContent: () => (
          <CvBuilderEducationForm
            tertiaryEntries={tertiaryEducation}
            secondaryEntries={secondaryEducation}
            onUpdateTertiary={onUpdateTertiary}
            onAddTertiary={onAddTertiary}
            onRemoveTertiary={onRemoveTertiary}
            onUpdateSecondary={onUpdateSecondary}
            onAddSecondary={onAddSecondary}
            onRemoveSecondary={onRemoveSecondary}
          />
        ),
      },
      {
        id: 'languages',
        label: 'Languages',
        icon: languagesIcon,
        renderContent: () => (
          <CvBuilderLanguagesForm
            selectedLanguages={selectedLanguages}
            onToggleLanguage={onToggleLanguage}
          />
        ),
      },
    ],
    [
      careerHistory,
      formValues,
      onAddPosition,
      onAddProject,
      onAddSecondary,
      onAddSkill,
      onAddTask,
      onAddTertiary,
      onRemoveSecondary,
      onRemoveSkill,
      onRemoveTertiary,
      onSelectFieldChange,
      onTextFieldChange,
      onToggleLanguage,
      onUpdatePosition,
      onUpdateProject,
      onUpdateSecondary,
      onUpdateSkill,
      onUpdateTask,
      onUpdateTertiary,
      secondaryEducation,
      selectedLanguages,
      skills,
      tertiaryEducation,
    ],
  )

  const toggleSection = (sectionId: ReviewSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
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
          {reviewSections.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            return (
              <Box key={section.id} className={styles.reviewSectionItem}>
                <Button
                  type="button"
                  className={styles.reviewSectionToggle}
                  disableRipple
                  onClick={() => toggleSection(section.id)}
                >
                  <Box className={styles.reviewSectionIconBadge} aria-hidden="true">
                    <Box component="img" src={section.icon} alt="" className={styles.reviewSectionIcon} />
                  </Box>
                  <Typography className={styles.reviewSectionLabel}>{section.label}</Typography>
                  <Box
                    component="img"
                    src={isExpanded ? minusIcon : plusIcon}
                    alt=""
                    className={styles.reviewSectionExpandIcon}
                    aria-hidden="true"
                  />
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
            <Button type="button" className={styles.reviewPreviewButton} disableRipple onClick={onPreview}>
              Preview
            </Button>
          </Box>

          <CvBuilderPreviewDocument
            size="compact"
            formValues={formValues}
            careerHistory={careerHistory}
            skills={skills}
            tertiaryEducation={tertiaryEducation}
            secondaryEducation={secondaryEducation}
            selectedLanguages={selectedLanguages}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default CvBuilderReviewScreen
