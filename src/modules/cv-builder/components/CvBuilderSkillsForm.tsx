import { Box, Button, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import skillsGenerateIcon from '@/assets/cv-builder/skills-generate.svg'
import skillsSparkleIcon from '@/assets/cv-builder/skills-sparkle.svg'
import styles from '../pages/CvBuilderPage.module.css'
import CvBuilderRemoveItemButton from './CvBuilderRemoveItemButton'
import { CvBuilderFormPanel, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import type { SkillEntry } from '../types/cvBuilder'

type CvBuilderSkillsFormProps = {
  skills: SkillEntry[]
  formError?: string
  onUpdateSkill: (skillId: string, value: string) => void
  onAddSkill: () => void
  onRemoveSkill: (skillId: string) => void
}

const CvBuilderSkillsForm = ({
  skills,
  formError,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
}: CvBuilderSkillsFormProps) => (
  <CvBuilderFormPanel>
    <Box className={styles.skillsFormHeader}>
      <CvBuilderSectionHeader iconSrc={skillsSparkleIcon} title="Your skills" />

      <Button type="button" className={styles.generateButton} disableRipple>
        Generate
        <Box component="img" src={skillsGenerateIcon} alt="" className={styles.generateButtonIcon} aria-hidden="true" />
      </Button>
    </Box>

    <Typography className={styles.skillsSubHeading}>List your skills</Typography>

    {formError ? (
      <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>
        {formError}
      </Typography>
    ) : null}

    <Box className={styles.skillsList}>
      {skills.map((skill, index) => (
        <Box key={skill.id} className={styles.skillRow}>
          <TextField
            value={skill.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onUpdateSkill(skill.id, event.target.value)
            }
            placeholder={`Skill ${index + 1}`}
            className={styles.fieldControl}
            variant="outlined"
            fullWidth
          />
          <CvBuilderRemoveItemButton
            canRemove={skills.length > 1}
            ariaLabel={`Remove skill ${index + 1}`}
            onClick={() => onRemoveSkill(skill.id)}
          />
        </Box>
      ))}

      <Button
        type="button"
        onClick={onAddSkill}
        className={styles.addMutedPillButton}
        disableRipple
        fullWidth
      >
        Add skill
      </Button>
    </Box>
  </CvBuilderFormPanel>
)

export default CvBuilderSkillsForm
