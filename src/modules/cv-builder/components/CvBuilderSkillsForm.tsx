import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import skillsGenerateIcon from '@/assets/cv-builder/skills-generate.svg'
import skillsSparkleIcon from '@/assets/cv-builder/skills-sparkle.svg'
import styles from '../pages/CvBuilderPage.module.css'
import type { SkillEntry } from '../types/cvBuilder'

type CvBuilderSkillsFormProps = {
  skills: SkillEntry[]
  onUpdateSkill: (skillId: string, value: string) => void
  onAddSkill: () => void
  onRemoveSkill: (skillId: string) => void
}

const CvBuilderSkillsForm = ({
  skills,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
}: CvBuilderSkillsFormProps) => (
  <Box className={styles.formPanel}>
    <Box className={styles.skillsFormHeader}>
      <Box className={styles.formHeader} sx={{ mb: 0 }}>
        <Box className={styles.formIconBadge} aria-hidden="true">
          <Box component="img" src={skillsSparkleIcon} alt="" className={styles.formIcon} />
        </Box>
        <Typography component="h2" className={styles.sectionTitle}>
          Your skills
        </Typography>
      </Box>

      <Button type="button" className={styles.generateButton} disableRipple>
        Generate
        <Box component="img" src={skillsGenerateIcon} alt="" className={styles.generateButtonIcon} aria-hidden="true" />
      </Button>
    </Box>

    <Typography className={styles.skillsSubHeading}>List your skills</Typography>

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
          {skills.length > 1 && (
            <IconButton
              type="button"
              onClick={() => onRemoveSkill(skill.id)}
              className={styles.removeSkillButton}
              aria-label={`Remove skill ${index + 1}`}
              disableRipple
            >
              <Box component="span" className={styles.removeSkillIcon} aria-hidden="true">
                ✕
              </Box>
            </IconButton>
          )}
        </Box>
      ))}

      <Button
        type="button"
        onClick={onAddSkill}
        className={styles.addSkillButton}
        disableRipple
        fullWidth
      >
        Add skill
      </Button>
    </Box>
  </Box>
)

export default CvBuilderSkillsForm
