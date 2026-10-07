import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useZodForm } from "@/hooks/useZodForm";
import AuthHero from "@/modules/auth/components/AuthHero";
import AuthPasswordField from "@/modules/auth/components/AuthPasswordField";
import {
  recruiterInviteSignupSchema,
  type RecruiterInviteSignupFormValues,
} from "@/app/validation.schema";
import { authApi } from "@/services/api/authApi";
import { getPhoneNumberInputProps } from "@/app/phoneNumber";
import { extractErrorMessage } from "@/app/errorUtils";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "./SignupPage.module.css";

const RecruiterSignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token");
  const staffNumberFromUrl = searchParams.get("staffNumber") ?? "";

  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm(recruiterInviteSignupSchema, {
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      staffNumber: staffNumberFromUrl,
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const onSubmit = async (values: RecruiterInviteSignupFormValues) => {
    setSubmitError(null);
    try {
      if (!invitationToken) {
        setSubmitError("Recruiter registration requires a valid invitation link.");
        return;
      }

      await authApi.staffRegister({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        staffNumber: values.staffNumber,
        password: values.password,
        invitationToken,
      });

      setSubmitSuccess(
        "Account created! Redirecting you to sign in…",
      );

      // Redirect to login after a short moment so the user can sign in
      setTimeout(() => navigate(ROUTE_PATHS.login), 1500);
    } catch (err: unknown) {
      setSubmitError(extractErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  return (
    <Box className={styles.pageRoot}>
      <AuthHero headline="Global talent acquisition specialists" />

      <Box className={styles.formSection}>
        <Typography className={styles.formHeading}>
          We just need a couple of details before we log you in
        </Typography>

        <Box
          component="form"
          className={styles.formFields}
          onSubmit={handleSubmit(onSubmit)}
        >
          {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <Box className={styles.nameRow}>
            <Box className={styles.fieldGroup}>
              <Typography className={styles.fieldLabel}>First name</Typography>
              <TextField
                placeholder="First name"
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
                {...register("firstName")}
                className={styles.inputField}
              />
            </Box>

            <Box className={styles.fieldGroup}>
              <Typography className={styles.fieldLabel}>Last name</Typography>
              <TextField
                placeholder="Last name"
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
                {...register("lastName")}
                className={styles.inputField}
              />
            </Box>
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Email</Typography>
            <TextField
              placeholder="Email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Phone number</Typography>
            <Controller
              name="mobileNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  placeholder="Phone number"
                  error={Boolean(errors.mobileNumber)}
                  helperText={errors.mobileNumber?.message}
                  name={field.name}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  {...getPhoneNumberInputProps(field.value, field.onChange)}
                  slotProps={{ htmlInput: { inputMode: "tel", autoComplete: "tel-national", "aria-label": "Phone number" } }}
                  className={styles.inputField}
                />
              )}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Staff Number</Typography>
            <TextField
              placeholder="Staff Number"
              error={Boolean(errors.staffNumber)}
              helperText={errors.staffNumber?.message}
              {...register("staffNumber")}
              className={styles.inputField}
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          </Box>

          <AuthPasswordField
            label="Password"
            placeholder="8+ characters, uppercase, number & special character"
            value={passwordValue}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            registration={register("password")}
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
            autoComplete="new-password"
          />

          <AuthPasswordField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPasswordValue}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
            autoComplete="new-password"
          />

          <Box className={styles.termsRow}>
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  disableRipple
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
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RecruiterSignupPage;
