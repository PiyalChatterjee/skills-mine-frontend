import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import educationIcon from '@/assets/cv-builder/education-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import {
  CvBuilderFormPanel,
  CvBuilderLabeledField,
  CvBuilderSectionHeader,
} from './CvBuilderFormPrimitives'
import type { SecondaryEducationEntry, TertiaryEducationEntry } from '../types/cvBuilder'

type CvBuilderEducationFormProps = {
  tertiaryEntries: TertiaryEducationEntry[]
  secondaryEntries: SecondaryEducationEntry[]
  onUpdateTertiary: (entryId: string, field: keyof Omit<TertiaryEducationEntry, 'id'>, value: string) => void
  onAddTertiary: () => void
  onRemoveTertiary: (entryId: string) => void
  onUpdateSecondary: (entryId: string, field: keyof Omit<SecondaryEducationEntry, 'id'>, value: string) => void
  onAddSecondary: () => void
  onRemoveSecondary: (entryId: string) => void
}

type BaseEducationEntry = {
  id: string
  institutionName: string
  yearCompleted: string
}

type EducationSectionProps<TEntry extends BaseEducationEntry> = {
  sectionTitle: string
  entries: TEntry[]
  entryLabelPrefix: string
  middleFieldLabel: string
  middleFieldPlaceholder: string
  addButtonLabel: string
  middleFieldValue: (entry: TEntry) => string
  onUpdateInstitutionName: (entryId: string, value: string) => void
  onUpdateMiddleField: (entryId: string, value: string) => void
  onUpdateYearCompleted: (entryId: string, value: string) => void
  onRemoveEntry: (entryId: string) => void
  onAddEntry: () => void
}

const EducationSection = <TEntry extends BaseEducationEntry>({
  sectionTitle,
  entries,
  entryLabelPrefix,
  middleFieldLabel,
  middleFieldPlaceholder,
  addButtonLabel,
  middleFieldValue,
  onUpdateInstitutionName,
  onUpdateMiddleField,
  onUpdateYearCompleted,
  onRemoveEntry,
  onAddEntry,
}: EducationSectionProps<TEntry>) => (
  <Box className={styles.educationSection}>
    <Typography component="h3" className={styles.educationSubHeading}>
      {sectionTitle}
    </Typography>

    {entries.map((entry, index) => (
      <Box key={entry.id} className={styles.educationEntryWrap}>
        {entries.length > 1 && (
          <Box className={styles.educationEntryMeta}>
            <Typography className={styles.educationEntryLabel}>
              {entryLabelPrefix} {index + 1}
            </Typography>
            <IconButton
              type="button"
              onClick={() => onRemoveEntry(entry.id)}
              className={styles.inlineRemoveButton}
              aria-label={`Remove ${entryLabelPrefix.toLowerCase()} ${index + 1}`}
              disableRipple
            >
              <Box component="span" className={styles.removeSkillIcon} aria-hidden="true">✕</Box>
            </IconButton>
          </Box>
        )}

        <Box className={styles.educationGrid}>
          <CvBuilderLabeledField label="Institution name" span="full">
            <TextField
              value={entry.institutionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateInstitutionName(entry.id, e.target.value)
              }
              placeholder="Institution name"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>

          <CvBuilderLabeledField label={middleFieldLabel} span="two">
            <TextField
              value={middleFieldValue(entry)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateMiddleField(entry.id, e.target.value)
              }
              placeholder={middleFieldPlaceholder}
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>

          <CvBuilderLabeledField label="Year completed" span="one">
            <TextField
              value={entry.yearCompleted}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateYearCompleted(entry.id, e.target.value)
              }
              placeholder="Year"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </CvBuilderLabeledField>
        </Box>
      </Box>
    ))}

    <Button
      type="button"
      onClick={onAddEntry}
      className={styles.addMutedPillButton}
      disableRipple
      fullWidth
    >
      {addButtonLabel}
    </Button>
  </Box>
)

const CvBuilderEducationForm = ({
  tertiaryEntries,
  secondaryEntries,
  onUpdateTertiary,
  onAddTertiary,
  onRemoveTertiary,
  onUpdateSecondary,
  onAddSecondary,
  onRemoveSecondary,
}: CvBuilderEducationFormProps) => (
  <CvBuilderFormPanel>
    <CvBuilderSectionHeader iconSrc={educationIcon} title="Education" />

    <Box className={styles.educationSections}>
      <EducationSection
        sectionTitle="Tertiary education"
        entries={tertiaryEntries}
        entryLabelPrefix="Tertiary education"
        middleFieldLabel="Degree or certification"
        middleFieldPlaceholder="Degree or certification"
        addButtonLabel="Add tertiary education"
        middleFieldValue={(entry) => entry.degreeOrCertification}
        onUpdateInstitutionName={(entryId, value) => onUpdateTertiary(entryId, 'institutionName', value)}
        onUpdateMiddleField={(entryId, value) => onUpdateTertiary(entryId, 'degreeOrCertification', value)}
        onUpdateYearCompleted={(entryId, value) => onUpdateTertiary(entryId, 'yearCompleted', value)}
        onRemoveEntry={onRemoveTertiary}
        onAddEntry={onAddTertiary}
      />

      <EducationSection
        sectionTitle="Secondary education"
        entries={secondaryEntries}
        entryLabelPrefix="Secondary education"
        middleFieldLabel="Highest grade passed"
        middleFieldPlaceholder="Highest grade passed"
        addButtonLabel="Add secondary education"
        middleFieldValue={(entry) => entry.highestGradePassed}
        onUpdateInstitutionName={(entryId, value) => onUpdateSecondary(entryId, 'institutionName', value)}
        onUpdateMiddleField={(entryId, value) => onUpdateSecondary(entryId, 'highestGradePassed', value)}
        onUpdateYearCompleted={(entryId, value) => onUpdateSecondary(entryId, 'yearCompleted', value)}
        onRemoveEntry={onRemoveSecondary}
        onAddEntry={onAddSecondary}
      />
    </Box>
  </CvBuilderFormPanel>
)

export default CvBuilderEducationForm
