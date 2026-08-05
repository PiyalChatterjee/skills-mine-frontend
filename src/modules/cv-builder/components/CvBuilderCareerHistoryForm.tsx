import { Box, Button, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import {
  CvBuilderFormPanel,
  CvBuilderLabeledField,
  CvBuilderSectionHeader,
} from './CvBuilderFormPrimitives'
import type { CareerHistoryEntry } from '../types/cvBuilder'

type CvBuilderCareerHistoryFormProps = {
  entries: CareerHistoryEntry[]
  formError?: string
  errorsByEntryId?: Partial<
    Record<string, Partial<Record<'companyName' | 'positionHeld' | 'startDate', string>>>
  >
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
}

type DynamicListSectionProps = {
  label: string
  values: string[]
  itemLabel: string
  addButtonLabel: string
  onUpdateValue: (index: number, value: string) => void
  onAddValue: () => void
}

const DynamicListSection = ({
  label,
  values,
  itemLabel,
  addButtonLabel,
  onUpdateValue,
  onAddValue,
}: DynamicListSectionProps) => (
  <Box className={styles.dynamicListSection}>
    <Typography component="p" className={styles.dynamicListLabel}>
      {label}
    </Typography>
    {values.map((value, index) => (
      <TextField
        key={index}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onUpdateValue(index, event.target.value)}
        placeholder={`${itemLabel} ${index + 1}`}
        className={`${styles.fieldControl} ${styles.dynamicListField}`}
        variant="outlined"
        fullWidth
      />
    ))}
    <Button
      type="button"
      onClick={onAddValue}
      className={styles.addDashedButton}
      disableRipple
      fullWidth
    >
      {addButtonLabel}
    </Button>
  </Box>
)

const CvBuilderCareerHistoryForm = ({
  entries,
  formError,
  errorsByEntryId,
  onUpdatePosition,
  onAddTask,
  onUpdateTask,
  onAddProject,
  onUpdateProject,
  onAddPosition,
}: CvBuilderCareerHistoryFormProps) => (
  <CvBuilderFormPanel>
    <CvBuilderSectionHeader iconSrc={buildingIcon} title="Career history" />

    {formError ? (
      <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>
        {formError}
      </Typography>
    ) : null}

    {entries.map((entry, positionIndex) => {
      const entryErrors = errorsByEntryId?.[entry.id]

      return (
      <Box key={entry.id} className={styles.positionCard}>
        <Typography component="h3" className={styles.positionLabel}>
          Position {positionIndex + 1}
        </Typography>

        <CvBuilderLabeledField label="Company name">
          <TextField
            value={entry.companyName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onUpdatePosition(entry.id, 'companyName', event.target.value)
            }
            error={Boolean(entryErrors?.companyName)}
            helperText={entryErrors?.companyName}
            placeholder="Company name"
            className={styles.fieldControl}
            variant="outlined"
            fullWidth
          />
        </CvBuilderLabeledField>

        <Box className={styles.positionRowGrid}>
          <CvBuilderLabeledField label="Position held">
            <TextField
              value={entry.positionHeld}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'positionHeld', event.target.value)
              }
              error={Boolean(entryErrors?.positionHeld)}
              helperText={entryErrors?.positionHeld}
              placeholder="Position held"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>

          <CvBuilderLabeledField label="Employment start date">
            <TextField
              value={entry.startDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'startDate', event.target.value)
              }
              error={Boolean(entryErrors?.startDate)}
              helperText={entryErrors?.startDate}
              placeholder="Month, Year"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>

          <CvBuilderLabeledField label="End date">
            <TextField
              value={entry.endDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'endDate', event.target.value)
              }
              placeholder="Month, Year"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>
        </Box>

        <DynamicListSection
          label="List the tasks that you were responsible for"
          values={entry.tasks}
          itemLabel="Task"
          addButtonLabel="+ Add a task"
          onUpdateValue={(taskIndex, value) => onUpdateTask(entry.id, taskIndex, value)}
          onAddValue={() => onAddTask(entry.id)}
        />

        <DynamicListSection
          label="List some of the projects you were involved in"
          values={entry.projects}
          itemLabel="Project"
          addButtonLabel="+ Add a project"
          onUpdateValue={(projectIndex, value) => onUpdateProject(entry.id, projectIndex, value)}
          onAddValue={() => onAddProject(entry.id)}
        />
      </Box>
      )
    })}

    <Button
      type="button"
      onClick={onAddPosition}
      className={styles.addPositionButton}
      disableRipple
      fullWidth
    >
      + Add position
    </Button>
  </CvBuilderFormPanel>
)

export default CvBuilderCareerHistoryForm
