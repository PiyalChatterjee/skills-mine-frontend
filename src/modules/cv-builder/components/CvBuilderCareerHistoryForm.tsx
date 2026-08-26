import { Box, Button, TextField, Typography } from '@mui/material'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import { CvBuilderFormPanel, CvBuilderLabeledField, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'
import { parseMonthYear, formatMonthYear } from '../utils/monthYearDate'

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
    setValue(path as 'careerHistory', [...current, ''] as never, { shouldDirty: true })
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

const CvBuilderPositionCard = ({ entryIndex }: { entryIndex: number }) => {
  const { control } = useFormContext<CvBuilderFormValues>()
  const startDateValue = useWatch({ control, name: `careerHistory.${entryIndex}.startDate` })
  const endDateValue = useWatch({ control, name: `careerHistory.${entryIndex}.endDate` })
  const startDateAsDate = parseMonthYear(startDateValue)
  const endDateAsDate = parseMonthYear(endDateValue)

  return (
    <Box className={styles.positionCard}>
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
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={parseMonthYear(field.value)}
                  onChange={(value) => field.onChange(formatMonthYear(value))}
                  onClose={field.onBlur}
                  views={['year', 'month']}
                  openTo="month"
                  format="MMM,YYYY"
                  disableFuture
                  maxDate={endDateAsDate ?? undefined}
                  slotProps={{
                    textField: {
                      onBlur: field.onBlur,
                      error: Boolean(fieldState.error),
                      helperText: fieldState.error?.message,
                      placeholder: 'Month, Year',
                      className: `${styles.fieldControl} ${styles.monthYearField}`,
                      variant: 'outlined',
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </CvBuilderLabeledField>

        <CvBuilderLabeledField label="End date">
          <Controller
            name={`careerHistory.${entryIndex}.endDate`}
            control={control}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={parseMonthYear(field.value)}
                  onChange={(value) => field.onChange(formatMonthYear(value))}
                  onClose={field.onBlur}
                  views={['year', 'month']}
                  openTo="month"
                  format="MMM,YYYY"
                  disableFuture={entryIndex > 0}
                  minDate={startDateAsDate ?? undefined}
                  slotProps={{
                    textField: {
                      onBlur: field.onBlur,
                      error: Boolean(fieldState.error),
                      helperText: fieldState.error?.message,
                      placeholder: 'Month, Year or Present',
                      className: `${styles.fieldControl} ${styles.monthYearField}`,
                      variant: 'outlined',
                    },
                    field: { clearable: true },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </CvBuilderLabeledField>
      </Box>

      <DynamicListSection entryIndex={entryIndex} sectionKey="tasks" label="List the tasks that you were responsible for" itemLabel="Task" addButtonLabel="+ Add a task" />
      <DynamicListSection entryIndex={entryIndex} sectionKey="projects" label="List some of the projects you were involved in" itemLabel="Project" addButtonLabel="+ Add a project" />
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
        <CvBuilderPositionCard key={fieldItem.id} entryIndex={entryIndex} />
      ))}

      <Button type="button" onClick={handleAddPosition} className={styles.addPositionButton} disableRipple fullWidth>
        + Add position
      </Button>
    </CvBuilderFormPanel>
  )
}

export default CvBuilderCareerHistoryForm
