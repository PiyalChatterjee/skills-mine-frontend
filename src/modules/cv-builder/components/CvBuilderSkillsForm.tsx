import { Box, Button, TextField, Typography } from '@mui/material'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import skillsGenerateIcon from '@/assets/cv-builder/skills-generate.svg'
import skillsSparkleIcon from '@/assets/cv-builder/skills-sparkle.svg'
import styles from '../pages/CvBuilderPage.module.css'
import CvBuilderRemoveItemButton from './CvBuilderRemoveItemButton'
import { CvBuilderFormPanel, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'

const CvBuilderSkillsForm = () => {
  const { control, formState: { errors }, clearErrors } = useFormContext<CvBuilderFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'skills' })
  const formError = (errors.skills as { root?: { message?: string } } | undefined)?.root?.message

  const handleAddSkill = () => {
    clearErrors('skills')
    append({ name: '' })
  }

  return (
    <CvBuilderFormPanel>
      <Box className={styles.skillsFormHeader}>
        <CvBuilderSectionHeader iconSrc={skillsSparkleIcon} title="Your skills" />
        <Button type="button" className={styles.generateButton} disableRipple>
          Generate
          <Box component="img" src={skillsGenerateIcon} alt="" className={styles.generateButtonIcon} aria-hidden="true" />
        </Button>
      </Box>

      <Typography className={styles.skillsSubHeading}>List your skills</Typography>

      {formError && (
        <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>{formError}</Typography>
      )}

      <Box className={styles.skillsList}>
        {fields.map((fieldItem, index) => (
          <Box key={fieldItem.id} className={styles.skillRow}>
            <Controller
              name={`skills.${index}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder={`Skill ${index + 1}`}
                  className={styles.fieldControl}
                  variant="outlined"
                  fullWidth
                />
              )}
            />
            <CvBuilderRemoveItemButton
              canRemove={fields.length > 1}
              ariaLabel={`Remove skill ${index + 1}`}
              onClick={() => remove(index)}
            />
          </Box>
        ))}

        <Button type="button" onClick={handleAddSkill} className={styles.addMutedPillButton} disableRipple fullWidth>
          Add skill
        </Button>
      </Box>
    </CvBuilderFormPanel>
  )
}

export default CvBuilderSkillsForm
