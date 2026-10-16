import { Box, Button, Checkbox, Link, Stack, TextField, Typography } from "@mui/material";
import { Controller, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { PasswordVisibilityAdornment } from "@/components/PasswordVisibilityAdornment";
import { getPhoneNumberInputProps } from "@/app/phoneNumber";
import { PASSWORD_PLACEHOLDER } from "@/app/passwordPolicy";
import type { SignUpFormValues } from "@/modules/public/components/SignUpDrawer.types";
import styles from "./CandidateSignUpDrawer.module.css";

type SignUpFormProps = {
  register: UseFormRegister<SignUpFormValues>;
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
  isSubmitting: boolean;
  disableSubmit: boolean;
  emailDisabled?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
};

export const SignUpForm = ({
  register,
  control,
  errors,
  isSubmitting,
  disableSubmit,
  emailDisabled = false,
  onSubmit,
  submitLabel = "Submit",
}: SignUpFormProps) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const passwordValue = useWatch({ control, name: "password" });
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" });
  const hasPasswordValue = Boolean(passwordValue?.length);
  const hasConfirmPasswordValue = Boolean(confirmPasswordValue?.length);

  return (
    <Stack
      component="form"
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Box className={styles.nameRow}>
        <Box className={styles.fieldBlock}>
          <Typography component="label" className={styles.fieldLabel} htmlFor="first-name">
            First name
          </Typography>
          <TextField
            id="first-name"
            className={styles.fieldInput}
            placeholder="First name"
            variant="outlined"
            fullWidth
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
            {...register("firstName")}
          />
        </Box>
        <Box className={styles.fieldBlock}>
          <Typography component="label" className={styles.fieldLabel} htmlFor="last-name">
            Last name
          </Typography>
          <TextField
            id="last-name"
            className={styles.fieldInput}
            placeholder="Last name"
            variant="outlined"
            fullWidth
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
            {...register("lastName")}
          />
        </Box>
      </Box>

      <Box className={styles.fieldBlock}>
        <Typography component="label" className={styles.fieldLabel} htmlFor="email-address">
          Email address
        </Typography>
        <TextField
          id="email-address"
          className={styles.fieldInput}
          placeholder="Email address"
          variant="outlined"
          fullWidth
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email")}
          disabled={emailDisabled}
        />
      </Box>

      <Box className={styles.fieldBlock}>
        <Typography component="label" className={styles.fieldLabel} htmlFor="phone-number">
          Phone number
        </Typography>
        <Controller
          name="mobileNumber"
          control={control}
          render={({ field }) => (
            <TextField
              id="phone-number"
              className={styles.fieldInput}
              placeholder="Phone number"
              variant="outlined"
              fullWidth
              error={Boolean(errors.mobileNumber)}
              helperText={errors.mobileNumber?.message}
              name={field.name}
              inputRef={field.ref}
              onBlur={field.onBlur}
              {...getPhoneNumberInputProps(field.value, field.onChange)}
              slotProps={{ htmlInput: { inputMode: "tel", autoComplete: "tel-national" } }}
            />
          )}
        />
      </Box>

      <Box className={styles.fieldBlock}>
        <Typography component="label" className={styles.fieldLabel} htmlFor="password">
          Password
        </Typography>
        <TextField
          id="password"
          className={styles.fieldInput}
          placeholder={PASSWORD_PLACEHOLDER}
          variant="outlined"
          type={hasPasswordValue && isPasswordVisible ? "text" : "password"}
          fullWidth
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: hasPasswordValue
                ? (
                    <PasswordVisibilityAdornment
                      visible={isPasswordVisible}
                      onToggle={() => {
                        setPasswordVisible((previous) => !previous);
                      }}
                      buttonClassName={styles.passwordToggleButton}
                      iconClassName={styles.passwordToggleIcon}
                    />
                  )
                : null,
            },
          }}
          {...register("password")}
        />
      </Box>

      <Box className={styles.fieldBlock}>
        <Typography component="label" className={styles.fieldLabel} htmlFor="confirm-password">
          Confirm Password
        </Typography>
        <TextField
          id="confirm-password"
          className={styles.fieldInput}
          placeholder="Re-enter your password"
          variant="outlined"
          type={hasConfirmPasswordValue && isConfirmPasswordVisible ? "text" : "password"}
          fullWidth
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          slotProps={{
            input: {
              endAdornment: hasConfirmPasswordValue
                ? (
                    <PasswordVisibilityAdornment
                      visible={isConfirmPasswordVisible}
                      onToggle={() => {
                        setConfirmPasswordVisible((previous) => !previous);
                      }}
                      buttonClassName={styles.passwordToggleButton}
                      iconClassName={styles.passwordToggleIcon}
                    />
                  )
                : null,
            },
          }}
          {...register("confirmPassword")}
        />
      </Box>

      <Box className={styles.termsRow}>
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={(_event, checked) => {
                field.onChange(checked);
              }}
              onBlur={field.onBlur}
              name={field.name}
              className={styles.termsCheckbox}
              slotProps={{
                input: {
                  "aria-label": "Accept terms and privacy policy",
                  ref: field.ref,
                },
              }}
            />
          )}
        />
        <Typography className={styles.termsText}>
          I accept the <Link href="#" className={styles.termsLink}>Terms and Conditions</Link> and{" "}
          <Link href="#" className={styles.termsLink}>Privacy Policy</Link>
        </Typography>
      </Box>

      {errors.acceptTerms?.message ? (
        <Typography className={styles.formErrorText}>
          {errors.acceptTerms.message}
        </Typography>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        className={styles.submitButton}
        disabled={isSubmitting || disableSubmit}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
};
