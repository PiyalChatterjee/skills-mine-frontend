import { Box, Button, TextField, Typography } from '@mui/material'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import educationIcon from '@/assets/cv-builder/education-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import CvBuilderRemoveItemButton from './CvBuilderRemoveItemButton'
import { CvBuilderFormPanel, CvBuilderLabeledField, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'

type EducationSectionProps = {
  sectionName: 'tertiaryEducation' | 'secondaryEducation'
  sectionTitle: string
  entryLabelPrefix: string
  middleFieldLabel: string
  middleFieldPlaceholder: string
  middleFieldKey: string
  addButtonLabel: string
  onAddClearError: () => void
}

const EducationSection = ({
  sectionName,
  sectionTitle,
  entryLabelPrefix,
  middleFieldLabel,
  middleFieldPlaceholder,
  middleFieldKey,
  addButtonLabel,
  onAddClearError,
}: EducationSectionProps) => {
  const { control } = useFormContext<CvBuilderFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: sectionName })

  const handleAdd = () => {
    onAddClearError()
    if (sectionName === 'tertiaryEducation') {
      ;(append as (v: CvBuilderFormValues['tertiaryEducation'][number]) => void)({ institutionName: '', degreeOrCertification: '', yearCompleted: '' })
    } else {
      ;(append as (v: CvBuilderFormValues['secondaryEducation'][number]) => void)({ institutionName: '', highestGradePassed: '', yearCompleted: '' })
    }
  }

  return (
    <Box className={styles.educationSection}>
      <Typography component="h3" className={styles.educationSubHeading}>{sectionTitle}</Typography>

      {fields.map((fieldItem, index) => (
        <Box key={fieldItem.id} className={styles.educationEntryWrap}>
          {fields.length > 1 && (
            <Box className={styles.educationEntryMeta}>
              <Typography className={styles.educationEntryLabel}>{entryLabelPrefix} {index + 1}</Typography>
              <CvBuilderRemoveItemButton
                canRemove={fields.length > 1}
                ariaLabel={`Remove ${entryLabelPrefix.toLowerCase()} ${index + 1}`}
                onClick={() => remove(index)}
              />
            </Box>
          )}

          <Box className={styles.educationGrid}>
            <CvBuilderLabeledField label="Institution name" span="full">
              <Controller
                name={`${sectionName}.${index}.institutionName` as never}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} placeholder="Institution name" className={styles.fieldControl} variant="outlined" fullWidth />
                )}
              />
            </CvBuilderLabeledField>

            <CvBuilderLabeledField label={middleFieldLabel} span="two">
              <Controller
                name={`${sectionName}.${index}.${middleFieldKey}` as never}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} placeholder={middleFieldPlaceholder} className={styles.fieldControl} variant="outlined" fullWidth />
                )}
              />
            </CvBuilderLabeledField>

            <CvBuilderLabeledField label="Year completed" span="one">
              <Controller
                name={`${sectionName}.${index}.yearCompleted` as never}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    placeholder="YYYY"
                    slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 } }}
                    className={styles.fieldControl}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </CvBuilderLabeledField>
          </Box>
        </Box>
      ))}

      <Button type="button" onClick={handleAdd} className={styles.addMutedPillButton} disableRipple fullWidth>
        {addButtonLabel}
      </Button>
    </Box>
  )
}

const CvBuilderEducationForm = () => {
  const { formState: { errors }, clearErrors } = useFormContext<CvBuilderFormValues>()
  const formError = (errors.tertiaryEducation as { root?: { message?: string } } | undefined)?.root?.message

  const clearEducationError = () => clearErrors('tertiaryEducation')

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={educationIcon} title="Education" />

      {formError && (
        <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>{formError}</Typography>
      )}

      <EducationSection
        sectionName="tertiaryEducation"
        sectionTitle="Tertiary education"
        entryLabelPrefix="Tertiary entry"
        middleFieldLabel="Degree or certification"
        middleFieldPlaceholder="Degree or certification"
        middleFieldKey="degreeOrCertification"
        addButtonLabel="+ Add tertiary entry"
        onAddClearError={clearEducationError}
      />

      <EducationSection
        sectionName="secondaryEducation"
        sectionTitle="Secondary education"
        entryLabelPrefix="Secondary entry"
        middleFieldLabel="Highest grade passed"
        middleFieldPlaceholder="e.g. Grade 12"
        middleFieldKey="highestGradePassed"
        addButtonLabel="+ Add secondary entry"
        onAddClearError={clearEducationError}
      />
    </CvBuilderFormPanel>
  )
}

export default CvBuilderEducationForm
