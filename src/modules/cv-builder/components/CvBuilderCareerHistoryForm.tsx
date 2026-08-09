import { Box, Button, TextField, Typography } from '@mui/material'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import { CvBuilderFormPanel, CvBuilderLabeledField, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'

const isoPattern = /^(19|20)\d{2}-(0[1-9]|1[0-2])$/
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

function normalizeMonthYear(value: string): string {
  const v = value.trim()
  if (!isoPattern.test(v)) return value
  const yr = v.slice(0, 4)
  const mo = monthNames[Number(v.slice(5, 7)) - 1]
  return mo ? `${mo},${yr}` : value
}

type DynamicListSectionProps = {
  entryIndex: number
  sectionKey: 'tasks' | 'projects'
  label: string
  itemLabel: string
  addButtonLabel: string
}

const DynamicListSection = ({ entryIndex, sectionKey, label, itemLabel, addButtonLabel }: DynamicListSectionProps) => {
  const { control, getValues, setValue } = useFormContext<CvBuilderFormValues>()
  const items = (useWatch({ control, name: `careerHistory.${entryIndex}.${sectionKey}` }) ?? []) as string[]

  const addItem = () => {
    const path = `careerHistory.${entryIndex}.${sectionKey}` as const
    const current = (getValues(path as 'careerHistory') as unknown as string[]) ?? []
    setValue(path as 'careerHistory', [...current, ''] as never)
  }

  return (
    <Box className={styles.dynamicListSection}>
      <Typography component="p" className={styles.dynamicListLabel}>{label}</Typography>
      {items.map((_, idx) => (
        <Controller
          key={idx}
          name={`careerHistory.${entryIndex}.${sectionKey}.${idx}` as never}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder={`${itemLabel} ${idx + 1}`}
              className={`${styles.fieldControl} ${styles.dynamicListField}`}
              variant="outlined"
              fullWidth
            />
          )}
        />
      ))}
      <Button type="button" onClick={addItem} className={styles.addDashedButton} disableRipple fullWidth>
        {addButtonLabel}
      </Button>
    </Box>
  )
}

const CvBuilderCareerHistoryForm = () => {
  const { control, formState: { errors }, clearErrors } = useFormContext<CvBuilderFormValues>()
  const { fields, append } = useFieldArray({ control, name: 'careerHistory' })
  const formError = (errors.careerHistory as { root?: { message?: string } } | undefined)?.root?.message

  const handleAddPosition = () => {
    clearErrors('careerHistory')
    append({ companyName: '', positionHeld: '', startDate: '', endDate: '', isCurrentRole: false, tasks: [''], projects: [''] })
  }

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={buildingIcon} title="Career history" />

      {formError && (
        <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>{formError}</Typography>
      )}

      {fields.map((fieldItem, entryIndex) => (
        <Box key={fieldItem.id} className={styles.positionCard}>
          <Typography component="h3" className={styles.positionLabel}>Position {entryIndex + 1}</Typography>

          <CvBuilderLabeledField label="Company name">
            <Controller
              name={`careerHistory.${entryIndex}.companyName`}
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} placeholder="Company name" className={styles.fieldControl} variant="outlined" fullWidth />
              )}
            />
          </CvBuilderLabeledField>

          <Box className={styles.positionRowGrid}>
            <CvBuilderLabeledField label="Position held">
              <Controller
                name={`careerHistory.${entryIndex}.positionHeld`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField {...field} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} placeholder="Position held" className={styles.fieldControl} variant="outlined" fullWidth />
                )}
              />
            </CvBuilderLabeledField>

            <CvBuilderLabeledField label="Employment start date">
              <Controller
                name={`careerHistory.${entryIndex}.startDate`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    onBlur={(e) => { field.onBlur(); const n = normalizeMonthYear(e.target.value); if (n !== e.target.value) field.onChange(n) }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    placeholder="Month, Year"
                    className={styles.fieldControl}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </CvBuilderLabeledField>

            <CvBuilderLabeledField label="End date">
              <Controller
                name={`careerHistory.${entryIndex}.endDate`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    onBlur={(e) => { field.onBlur(); const n = normalizeMonthYear(e.target.value); if (n !== e.target.value) field.onChange(n) }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    placeholder="Month, Year or Present"
                    className={styles.fieldControl}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </CvBuilderLabeledField>
          </Box>

          <DynamicListSection entryIndex={entryIndex} sectionKey="tasks" label="List the tasks that you were responsible for" itemLabel="Task" addButtonLabel="+ Add a task" />
          <DynamicListSection entryIndex={entryIndex} sectionKey="projects" label="List some of the projects you were involved in" itemLabel="Project" addButtonLabel="+ Add a project" />
        </Box>
      ))}

      <Button type="button" onClick={handleAddPosition} className={styles.addPositionButton} disableRipple fullWidth>
        + Add position
      </Button>
    </CvBuilderFormPanel>
  )
}

export default CvBuilderCareerHistoryForm
