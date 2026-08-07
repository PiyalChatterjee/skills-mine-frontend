import { Box, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import userIcon from "@/assets/public-layout/user-icon.svg";
import styles from "../pages/CvBuilderPage.module.css";
import {
  CvBuilderFormPanel,
  CvBuilderLabeledField,
  CvBuilderSectionHeader,
  CvBuilderSelectField,
} from "./CvBuilderFormPrimitives";
import {
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  LOCATION_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
} from "../types/cvBuilder";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

const CvBuilderPersonalDetailsForm = () => {
  const { control } = useFormContext<CvBuilderFormValues>();

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={userIcon} title="Personal details" />

      <Box className={styles.formGrid}>
        <CvBuilderLabeledField label="Full name" span="full">
          <Controller
            name="personalDetails.fullName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CvBuilderLabeledField>

        <Controller
          name="personalDetails.race"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Race"
              value={field.value}
              onChange={field.onChange}
              options={RACE_OPTIONS}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="personalDetails.gender"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Gender"
              value={field.value}
              onChange={field.onChange}
              options={GENDER_OPTIONS}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="personalDetails.disabilityStatus"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Disability status"
              value={field.value}
              onChange={field.onChange}
              options={DISABILITY_OPTIONS}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <CvBuilderLabeledField label="Nationality" span="full">
          <Controller
            name="personalDetails.nationality"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                placeholder="Nationality"
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CvBuilderLabeledField>

        <Controller
          name="personalDetails.residentialLocation"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Residential location"
              value={field.value}
              onChange={field.onChange}
              options={LOCATION_OPTIONS}
              span="full"
              allowEmptyOption={false}
              displayEmpty={true}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <CvBuilderLabeledField label="Current company" span="full">
          <Controller
            name="personalDetails.currentCompany"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Current company"
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CvBuilderLabeledField>

        <CvBuilderLabeledField label="Current position" span="two">
          <Controller
            name="personalDetails.currentPosition"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                placeholder="Current position"
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CvBuilderLabeledField>

        <Controller
          name="personalDetails.noticePeriod"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Notice period"
              value={field.value}
              onChange={field.onChange}
              options={NOTICE_PERIOD_OPTIONS}
              span="one"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>
    </CvBuilderFormPanel>
  );
};

export default CvBuilderPersonalDetailsForm;
