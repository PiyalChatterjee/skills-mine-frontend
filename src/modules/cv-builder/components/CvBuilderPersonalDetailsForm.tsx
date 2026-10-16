import { Box } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "@/app/validation.schema";
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
  const currentCompany = useWatch({ control, name: "personalDetails.currentCompany" });
  const hasCurrentCompany = Boolean(currentCompany?.trim());

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={userIcon} title="Personal Details" />

      <Box className={styles.formGrid}>
        <CvBuilderControlledTextField
          name="personalDetails.fullName"
          control={control}
          label="Full name"
          required
          span="full"
          placeholder="Full name"
        />

        {isVisitor ? (
          <CvBuilderControlledTextField
            name="personalDetails.email"
            control={control}
            label="Email address"
            required
            span="two"
            placeholder="Email address"
            onBlur={onEmailBlur}
            rules={{
              required: "Email address is required",
              validate: (value) =>
                isValidEmail(String(value ?? "")) || INVALID_EMAIL_MESSAGE,
            }}
          />
        ) : null}

        {isVisitor ? (
          <CvBuilderControlledTextField
            name="personalDetails.phoneNumber"
            control={control}
            label="Phone number"
            required
            span="one"
            placeholder="Phone number"
            type="tel"
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
              required
              name="personalDetails.race"
              inputRef={field.ref}
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
              required
              name="personalDetails.gender"
              inputRef={field.ref}
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
              required
              name="personalDetails.disabilityStatus"
              inputRef={field.ref}
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
          required
          span="full"
          placeholder="Nationality"
        />

        <CvBuilderControlledTextField
          name="personalDetails.residentialLocation"
          control={control}
          label="Residential location"
          required
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
          required={hasCurrentCompany}
          span="two"
          placeholder="Current position"
          showError={hasCurrentCompany}
        />

        <Controller
          name="personalDetails.noticePeriod"
          control={control}
          render={({ field, fieldState }) => (
            <CvBuilderSelectField
              label="Notice period"
              required={isVisitor || hasCurrentCompany}
              name="personalDetails.noticePeriod"
              inputRef={field.ref}
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
