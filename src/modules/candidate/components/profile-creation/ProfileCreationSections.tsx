import { Box, Button, TextField, Typography } from '@mui/material'
import { useFieldArray, useFormContext } from 'react-hook-form'
import iconDesiredSrc from '@/assets/profile/icon-desired.svg'
import iconEducationSrc from '@/assets/profile/icon-education.svg'
import iconExperienceSrc from '@/assets/profile/icon-experience.svg'
import iconPersonalSrc from '@/assets/profile/icon-personal.svg'
import {
  ProfileSelectField,
  ProfileTextField,
} from '@/modules/candidate/components/ProfileFormFields'
import { PROFILE_SELECT_OPTIONS } from '@/modules/candidate/pages/profileForm.config'
import creationStyles from '@/modules/candidate/pages/ProfileCreationPage.module.css'
import profileFieldStyles from '@/modules/candidate/pages/ProfilePage.module.css'
import type { ProfileCreationFormValues } from '@/modules/candidate/types/profileCreation'
import ProfileCreationStepSection from './ProfileCreationStepSection'

type SectionProps = {
  showRequiredHint?: boolean
}

export const ProfileCreationPersonalDetailsSection = ({
  showRequiredHint = true,
}: SectionProps) => {
  const { control } = useFormContext<ProfileCreationFormValues>()

  return (
    <ProfileCreationStepSection iconSrc={iconPersonalSrc} title="Personal details">
      <Box className={creationStyles.fieldsGrid}>
        <ProfileTextField
          control={control}
          name="fullName"
          label="Full name*"
          fullWidth
        />
        <ProfileTextField
          control={control}
          name="email"
          label="Email address*"
        />
        <ProfileTextField
          control={control}
          name="phoneNumber"
          label="Phone number*"
        />
        <ProfileSelectField
          control={control}
          name="residentialLocation"
          label="Residential location*"
          fullWidth
          options={[...PROFILE_SELECT_OPTIONS.residentialLocation]}
        />
      </Box>
      {showRequiredHint ? (
        <Typography component="p" className={creationStyles.requiredHint}>
          *Required fields
        </Typography>
      ) : null}
    </ProfileCreationStepSection>
  )
}

export const ProfileCreationJobDetailsSection = ({
  showRequiredHint = true,
}: SectionProps) => {
  const { control } = useFormContext<ProfileCreationFormValues>()

  return (
    <ProfileCreationStepSection iconSrc={iconDesiredSrc} title="Job details">
      <Box className={creationStyles.fieldsGrid}>
        <ProfileTextField
          control={control}
          name="preferredJobTitle"
          label="Preferred job title*"
        />
        <ProfileSelectField
          control={control}
          name="targetedIndustries"
          label="Targeted industries*"
          options={[...PROFILE_SELECT_OPTIONS.targetedIndustries]}
        />
        <ProfileSelectField
          control={control}
          name="preferredLocations"
          label="Preferred location(s)"
          options={[...PROFILE_SELECT_OPTIONS.preferredLocations]}
        />
        <ProfileSelectField
          control={control}
          name="employmentType"
          label="Employment type"
          options={[...PROFILE_SELECT_OPTIONS.employmentType]}
        />
        <ProfileSelectField
          control={control}
          name="availability"
          label="Availability"
          options={[...PROFILE_SELECT_OPTIONS.availability]}
        />
      </Box>
      {showRequiredHint ? (
        <Typography component="p" className={creationStyles.requiredHint}>
          *Required fields
        </Typography>
      ) : null}
    </ProfileCreationStepSection>
  )
}

export const ProfileCreationEducationSection = () => {
  const { control, register } = useFormContext<ProfileCreationFormValues>()
  const { fields, append } = useFieldArray({
    control,
    name: 'certifications',
  })

  return (
    <ProfileCreationStepSection iconSrc={iconEducationSrc} title="Education">
      <div className={creationStyles.educationFieldsStack}>
        <label className={profileFieldStyles.fieldLabel}>
          Relevant certifications
        </label>

        {fields.map((field, index) => (
          <TextField
            key={field.id}
            variant="outlined"
            fullWidth
            placeholder={`Certification ${index + 1}`}
            className={profileFieldStyles.readonlyInput}
            {...register(`certifications.${index}.value`)}
          />
        ))}

        <Button
          type="button"
          onClick={() => append({ value: '' })}
          className={creationStyles.educationAddButton}
          disableRipple
        >
          Add Certification
        </Button>

        <ProfileTextField
          control={control}
          name="highestDegreeEarned"
          label="Highest degree earned"
          fullWidth
        />
      </div>
    </ProfileCreationStepSection>
  )
}

export const ProfileCreationExperienceSection = () => {
  const { control } = useFormContext<ProfileCreationFormValues>()

  return (
    <ProfileCreationStepSection iconSrc={iconExperienceSrc} title="Experience">
      <div className={creationStyles.fieldsGrid}>
        <ProfileTextField
          control={control}
          name="currentJobTitle"
          label="Current or recent job title"
          placeholder="Current job title"
        />
        <ProfileTextField
          control={control}
          name="currentEmployer"
          label="Current employer"
          placeholder="Current employer"
        />
        <ProfileTextField
          control={control}
          name="totalYearsOfExperience"
          label="Total years of work experience"
          placeholder="Total years of work experience"
        />
      </div>
    </ProfileCreationStepSection>
  )
}