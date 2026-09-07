import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  inviteSignupSchema,
  type InviteSignupFormValues,
} from "@/modules/auth/types";
import { normalizePhoneNumberInput } from "@/app/phoneNumber";
import { authApi } from "@/services/api/authApi";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationToken = searchParams.get("token") ?? undefined;
  const visitorId = searchParams.get("visitorId") ?? undefined;

  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm(inviteSignupSchema, {
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
          staffNumber: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const phoneNumberRegistration = register("mobileNumber", {
    onChange: (event) => {
      event.target.value = normalizePhoneNumberInput(event.target.value);
    },
  });

  const onSubmit = async (values: InviteSignupFormValues) => {
    setSubmitError(null);
    try {
      if (invitationToken) {
        if (!values.staffNumber) {
          setSubmitError("Staff number is required for invitation registration.");
          return;
        }
        // Recruiter (or any staff) invited via email link — use the staff registration flow
        await authApi.staffRegister({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          staffNumber: values.staffNumber,
          password: values.password,
          invitationToken,
        });
      } else {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobileNumber: values.mobileNumber,
          password: values.password,
        };
        if (visitorId) {
          await authApi.candidateRegisterFromVisitor({ ...payload, visitorId });
        } else {
          await authApi.candidateRegister(payload);
        }
      }

      setSubmitSuccess(
        "Your details were captured. You can now continue with Sign in.",
      );

      // Redirect to login after a short moment so the user sees the success message
      setTimeout(() => navigate(ROUTE_PATHS.login), 1500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      setSubmitError(message);
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
            <TextField
              placeholder="Phone number"
              error={Boolean(errors.mobileNumber)}
              helperText={errors.mobileNumber?.message}
              slotProps={{
                htmlInput: {
                  inputMode: "tel",
                  maxLength: 10,
                },
              }}
              {...phoneNumberRegistration}
              className={styles.inputField}
            />
          </Box>

          {invitationToken ? (
            <Box className={styles.fieldGroup}>
              <Typography className={styles.fieldLabel}>Staff Number</Typography>
              <TextField
                placeholder="Staff Number"
                error={Boolean(errors.staffNumber)}
                helperText={errors.staffNumber?.message}
                {...register("staffNumber")}
                className={styles.inputField}
              />
            </Box>
          ) : null}

          <AuthPasswordField
            label="Password"
            placeholder="At least 8 characters"
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

export default SignupPage;
