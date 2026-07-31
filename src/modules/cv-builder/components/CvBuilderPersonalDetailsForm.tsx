import { Box, MenuItem, TextField, Typography } from '@mui/material'
import type { ReactNode, ChangeEvent } from 'react'
import userIcon from '@/assets/public-layout/user-icon.svg'
import styles from '../pages/CvBuilderPage.module.css'
import {
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  LOCATION_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
  type PersonalDetailsFormState,
} from '../types/cvBuilder'

type FieldGroupProps = {
  label: string
  span?: 'full' | 'two' | 'one'
  children: ReactNode
}

type CvBuilderPersonalDetailsFormProps = {
  values: PersonalDetailsFormState
  onTextFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
  onSelectFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
}

const FieldGroup = ({ label, span = 'one', children }: FieldGroupProps) => (
  <Box className={`${styles.fieldGroup} ${styles[`fieldGroup${span[0].toUpperCase()}${span.slice(1)}`]}`}>
    <Typography component="label" className={styles.fieldLabel}>
      {label}
    </Typography>
    {children}
  </Box>
)

const renderSelectValue = (value: unknown) =>
  value ? String(value) : <span className={styles.placeholderText}>Select</span>

const CvBuilderPersonalDetailsForm = ({
  values,
  onTextFieldChange,
  onSelectFieldChange,
}: CvBuilderPersonalDetailsFormProps) => (
  <Box className={styles.formPanel}>
    <Box className={styles.formHeader}>
      <Box className={styles.formIconBadge} aria-hidden="true">
        <Box component="img" src={userIcon} alt="" className={styles.formIcon} />
      </Box>
      <Typography component="h2" className={styles.sectionTitle}>
        Personal details
      </Typography>
    </Box>

    <Box className={styles.formGrid}>
      <FieldGroup label="Full name" span="full">
        <TextField
          value={values.fullName}
          onChange={onTextFieldChange('fullName')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </FieldGroup>

      <FieldGroup label="Race">
        <TextField
          select
          value={values.race}
          onChange={onSelectFieldChange('race')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: renderSelectValue,
            },
          }}
        >
          <MenuItem value=""><span className={styles.placeholderText}>Select</span></MenuItem>
          {RACE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      </FieldGroup>

      <FieldGroup label="Gender">
        <TextField
          select
          value={values.gender}
          onChange={onSelectFieldChange('gender')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: renderSelectValue,
            },
          }}
        >
          <MenuItem value=""><span className={styles.placeholderText}>Select</span></MenuItem>
          {GENDER_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      </FieldGroup>

      <FieldGroup label="Disability status">
        <TextField
          select
          value={values.disabilityStatus}
          onChange={onSelectFieldChange('disabilityStatus')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: renderSelectValue,
            },
          }}
        >
          <MenuItem value=""><span className={styles.placeholderText}>Select</span></MenuItem>
          {DISABILITY_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      </FieldGroup>

      <FieldGroup label="Nationality" span="full">
        <TextField
          value={values.nationality}
          onChange={onTextFieldChange('nationality')}
          placeholder="Nationality"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </FieldGroup>

      <FieldGroup label="Residential location" span="full">
        <TextField
          select
          value={values.residentialLocation}
          onChange={onSelectFieldChange('residentialLocation')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        >
          {LOCATION_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      </FieldGroup>

      <FieldGroup label="Current company" span="full">
        <TextField
          value={values.currentCompany}
          onChange={onTextFieldChange('currentCompany')}
          placeholder="Current company"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </FieldGroup>

      <FieldGroup label="Current position" span="two">
        <TextField
          value={values.currentPosition}
          onChange={onTextFieldChange('currentPosition')}
          placeholder="Current position"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </FieldGroup>

      <FieldGroup label="Notice period">
        <TextField
          select
          value={values.noticePeriod}
          onChange={onSelectFieldChange('noticePeriod')}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: renderSelectValue,
            },
          }}
        >
          <MenuItem value=""><span className={styles.placeholderText}>Select</span></MenuItem>
          {NOTICE_PERIOD_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      </FieldGroup>
    </Box>
  </Box>
)

export default CvBuilderPersonalDetailsForm
