import { Box } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import userIcon from "@/assets/public-layout/user-icon.svg";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import styles from "../pages/CvBuilderPage.module.css";
import {
  CvBuilderFormPanel,
  CvBuilderControlledTextField,
  CvBuilderSectionHeader,
  CvBuilderSelectField,
} from "./CvBuilderFormPrimitives";
import {
  DISABILITY_OPTIONS,
  GENDER_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  RACE_OPTIONS,
} from "../types/cvBuilder";
import type { CvBuilderFormValues } from "@/app/validation.schema";

const CvBuilderPersonalDetailsForm = () => {
  const { control } = useFormContext<CvBuilderFormValues>();

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={userIcon} title="Personal Details" />

      <Box className={styles.formGrid}>
        <CvBuilderControlledTextField
          name="personalDetails.fullName"
          control={control}
          label="Full name"
          span="full"
          placeholder="Full name"
        />

        <Controller
          name="personalDetails.race"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Race"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
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
              onBlur={field.onBlur}
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
              onBlur={field.onBlur}
              options={DISABILITY_OPTIONS}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <CvBuilderControlledTextField
          name="personalDetails.nationality"
          control={control}
          label="Nationality"
          span="full"
          placeholder="Nationality"
        />

        <CvBuilderControlledTextField
          name="personalDetails.residentialLocation"
          control={control}
          label="Residential location"
          span="full"
          placeholder="Residential location"
        />

        <CvBuilderControlledTextField
          name="personalDetails.currentCompany"
          control={control}
          label="Current company"
          span="full"
          placeholder="Current company"
          showError={false}
        />

        <CvBuilderControlledTextField
          name="personalDetails.currentPosition"
          control={control}
          label="Current position"
          span="two"
          placeholder="Current position"
        />

        <Controller
          name="personalDetails.noticePeriod"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Notice period"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={NOTICE_PERIOD_OPTIONS}
              getOptionLabel={formatEnumLabel}
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
