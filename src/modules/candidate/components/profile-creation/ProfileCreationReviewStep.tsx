import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useState } from 'react'
import minusIcon from '@/assets/cv-builder/minus-line.svg'
import plusIcon from '@/assets/cv-builder/plus-line.svg'
import iconDesiredSrc from '@/assets/profile/icon-desired.svg'
import iconEducationSrc from '@/assets/profile/icon-education.svg'
import iconExperienceSrc from '@/assets/profile/icon-experience.svg'
import iconPersonalSrc from '@/assets/profile/icon-personal.svg'
import styles from '@/modules/candidate/pages/ProfileCreationPage.module.css'
import {
  ProfileCreationEducationSection,
  ProfileCreationExperienceSection,
  ProfileCreationJobDetailsSection,
  ProfileCreationPersonalDetailsSection,
} from './ProfileCreationSections'

type ReviewSectionId = 'personal' | 'job' | 'education' | 'experience'

const REVIEW_SECTIONS = [
  {
    id: 'personal' as const,
    label: 'Personal details',
    icon: iconPersonalSrc,
    renderContent: () => <ProfileCreationPersonalDetailsSection showRequiredHint={false} />,
  },
  {
    id: 'job' as const,
    label: 'Job details',
    icon: iconDesiredSrc,
    renderContent: () => <ProfileCreationJobDetailsSection showRequiredHint={false} />,
  },
  {
    id: 'education' as const,
    label: 'Education',
    icon: iconEducationSrc,
    renderContent: () => <ProfileCreationEducationSection />,
  },
  {
    id: 'experience' as const,
    label: 'Experience',
    icon: iconExperienceSrc,
    renderContent: () => <ProfileCreationExperienceSection />,
  },
] satisfies Array<{
  id: ReviewSectionId
  label: string
  icon: string
  renderContent: () => ReactNode
}>

const ProfileCreationReviewStep = () => {
  const [expandedSections, setExpandedSections] = useState<Set<ReviewSectionId>>(
    new Set(),
  )

  const toggleSection = (sectionId: ReviewSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current)
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
      return next
    })
  }

  return (
    <Box className={styles.reviewSectionsList}>
      {REVIEW_SECTIONS.map((section) => {
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
                <Box
                  component="img"
                  src={section.icon}
                  alt=""
                  className={styles.reviewSectionIcon}
                />
              </Box>
              <Typography className={styles.reviewSectionLabel}>
                {section.label}
              </Typography>
              <Box
                component="img"
                src={isExpanded ? minusIcon : plusIcon}
                alt=""
                className={styles.reviewSectionExpandIcon}
                aria-hidden="true"
              />
            </Button>

            {isExpanded ? (
              <Box className={styles.reviewSectionContent}>
                <Box className={styles.reviewEmbeddedSectionContent}>
                  {section.renderContent()}
                </Box>
              </Box>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}

export default ProfileCreationReviewStep