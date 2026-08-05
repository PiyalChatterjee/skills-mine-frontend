import { Box, TextField } from '@mui/material'
import type { ChangeEvent } from 'react'
import userIcon from '@/assets/public-layout/user-icon.svg'
import styles from '../pages/CvBuilderPage.module.css'
import {
  CvBuilderFormPanel,
  CvBuilderLabeledField,
  CvBuilderSectionHeader,
  CvBuilderSelectField,
} from './CvBuilderFormPrimitives'
import {
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  LOCATION_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
  type PersonalDetailsFormState,
} from '../types/cvBuilder'

type CvBuilderPersonalDetailsFormProps = {
  values: PersonalDetailsFormState
  errors?: Partial<Record<keyof PersonalDetailsFormState, string>>
  onTextFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
  onSelectFieldChange: (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
}

const CvBuilderPersonalDetailsForm = ({
  values,
  errors,
  onTextFieldChange,
  onSelectFieldChange,
}: CvBuilderPersonalDetailsFormProps) => (
  <CvBuilderFormPanel>
    <CvBuilderSectionHeader iconSrc={userIcon} title="Personal details" />

    <Box className={styles.formGrid}>
      <CvBuilderLabeledField label="Full name" span="full">
        <TextField
          value={values.fullName}
          onChange={onTextFieldChange('fullName')}
          error={Boolean(errors?.fullName)}
          helperText={errors?.fullName}
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </CvBuilderLabeledField>

      <CvBuilderSelectField
        label="Race"
        value={values.race}
        onChange={onSelectFieldChange('race')}
        options={RACE_OPTIONS}
        error={Boolean(errors?.race)}
        helperText={errors?.race}
      />

      <CvBuilderSelectField
        label="Gender"
        value={values.gender}
        onChange={onSelectFieldChange('gender')}
        options={GENDER_OPTIONS}
        error={Boolean(errors?.gender)}
        helperText={errors?.gender}
      />

      <CvBuilderSelectField
        label="Disability status"
        value={values.disabilityStatus}
        onChange={onSelectFieldChange('disabilityStatus')}
        options={DISABILITY_OPTIONS}
        error={Boolean(errors?.disabilityStatus)}
        helperText={errors?.disabilityStatus}
      />

      <CvBuilderLabeledField label="Nationality" span="full">
        <TextField
          value={values.nationality}
          onChange={onTextFieldChange('nationality')}
          error={Boolean(errors?.nationality)}
          helperText={errors?.nationality}
          placeholder="Nationality"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </CvBuilderLabeledField>

      <CvBuilderSelectField
        label="Residential location"
        value={values.residentialLocation}
        onChange={onSelectFieldChange('residentialLocation')}
        options={LOCATION_OPTIONS}
        span="full"
        allowEmptyOption={false}
        displayEmpty={true}
        error={Boolean(errors?.residentialLocation)}
        helperText={errors?.residentialLocation}
      />

      <CvBuilderLabeledField label="Current company" span="full">
        <TextField
          value={values.currentCompany}
          onChange={onTextFieldChange('currentCompany')}
          placeholder="Current company"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </CvBuilderLabeledField>

      <CvBuilderLabeledField label="Current position" span="two">
        <TextField
          value={values.currentPosition}
          onChange={onTextFieldChange('currentPosition')}
          error={Boolean(errors?.currentPosition)}
          helperText={errors?.currentPosition}
          placeholder="Current position"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </CvBuilderLabeledField>

      <CvBuilderSelectField
        label="Notice period"
        value={values.noticePeriod}
        onChange={onSelectFieldChange('noticePeriod')}
        options={NOTICE_PERIOD_OPTIONS}
        error={Boolean(errors?.noticePeriod)}
        helperText={errors?.noticePeriod}
      />
    </Box>
  </CvBuilderFormPanel>
)

export default CvBuilderPersonalDetailsForm
