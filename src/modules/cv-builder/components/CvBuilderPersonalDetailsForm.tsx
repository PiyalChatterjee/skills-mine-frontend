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
import { emailSchema } from "@/app/validation.schema";
import { isValidLocalPhoneNumber } from "@/app/phoneNumber";

type CvBuilderPersonalDetailsFormProps = {
  isVisitor?: boolean;
  onEmailBlur?: (email: string) => void;
};

const CvBuilderPersonalDetailsForm = ({
  isVisitor = false,
  onEmailBlur,
}: CvBuilderPersonalDetailsFormProps) => {
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

        {isVisitor ? (
          <CvBuilderControlledTextField
            name="personalDetails.email"
            control={control}
            label="Email address"
            span="two"
            placeholder="Email address"
            onBlur={onEmailBlur}
            rules={{
              required: "Email address is required",
              validate: (value) =>
                emailSchema.safeParse(value).success ||
                "Enter a valid email address",
            }}
          />
        ) : null}

        {isVisitor ? (
          <CvBuilderControlledTextField
            name="personalDetails.phoneNumber"
            control={control}
            label="Phone number"
            span="one"
            placeholder="Phone number"
            rules={{
              required: "Phone number is required",
              validate: (value) => {
                if (typeof value !== "string") {
                  return "Phone number must be 10 digits";
                }
                return (
                  isValidLocalPhoneNumber(value) ||
                  "Phone number must be 10 digits"
                );
              },
            }}
          />
        ) : null}

        <Controller
          name="personalDetails.race"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Race"
              name="personalDetails.race"
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
              name="personalDetails.gender"
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
              name="personalDetails.disabilityStatus"
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
              name="personalDetails.noticePeriod"
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
