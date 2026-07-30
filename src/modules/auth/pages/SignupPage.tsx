import { useState } from "react";
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
import { PasswordVisibilityAdornment } from "@/components/PasswordVisibilityAdornment";
import { useZodForm } from "@/hooks/useZodForm";
import {
  inviteSignupSchema,
  type InviteSignupFormValues,
} from "@/modules/auth/types";
import loginFaceImage from "@/assets/login-face-img.jpg";
import loginVectorImage from "@/assets/login-vector.svg";
import styles from "./SignupPage.module.css";

const SignupPage = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
      phoneNumber: "",
      staffNumber: "",
      password: "",
      confirmPassword: "",
      passwordHint: "",
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const hasPasswordValue = Boolean(passwordValue?.length);
  const hasConfirmPasswordValue = Boolean(confirmPasswordValue?.length);

  const phoneNumberRegistration = register("phoneNumber", {
    onChange: (event) => {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 9);
    },
  });

  const onSubmit = async (_values: InviteSignupFormValues) => {
    setSubmitSuccess(
      "Your details were captured. You can now continue with Sign in.",
    );
  };

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.heroSection}>
        <Box
          component="img"
          src={loginVectorImage}
          alt=""
          className={styles.heroVector}
        />
        <Box
          component="img"
          src={loginFaceImage}
          alt=""
          className={styles.heroPortrait}
        />
        <Box className={styles.heroOverlay} />
        <Box className={styles.heroHeadlineWrap}>
          <Typography className={styles.heroHeadline}>
            Global talent acquisition specialists
          </Typography>
        </Box>
      </Box>

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
            <Typography className={styles.fieldLabel}>Phone number</Typography>
            <TextField
              placeholder="Phone number"
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  maxLength: 9,
                  pattern: "[0-9]*",
                },
              }}
              {...phoneNumberRegistration}
              className={styles.inputField}
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
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Password</Typography>
            <TextField
              placeholder="At least 8 characters"
              type={hasPasswordValue && isPasswordVisible ? "text" : "password"}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: hasPasswordValue ? (
                    <PasswordVisibilityAdornment
                      visible={isPasswordVisible}
                      onToggle={() => {
                        setPasswordVisible((previous) => !previous);
                      }}
                      buttonClassName={styles.passwordToggleButton}
                      iconClassName={styles.passwordToggleIcon}
                    />
                  ) : null,
                },
              }}
              {...register("password")}
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Confirm Password</Typography>
            <TextField
              placeholder="Re-enter your password"
              type={
                hasConfirmPasswordValue && isConfirmPasswordVisible
                  ? "text"
                  : "password"
              }
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  endAdornment: hasConfirmPasswordValue ? (
                    <PasswordVisibilityAdornment
                      visible={isConfirmPasswordVisible}
                      onToggle={() => {
                        setConfirmPasswordVisible((previous) => !previous);
                      }}
                      buttonClassName={styles.passwordToggleButton}
                      iconClassName={styles.passwordToggleIcon}
                    />
                  ) : null,
                },
              }}
              {...register("confirmPassword")}
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Password Hint</Typography>
            <TextField
              placeholder="Something to help you remember"
              error={Boolean(errors.passwordHint)}
              helperText={errors.passwordHint?.message}
              {...register("passwordHint")}
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.termsRow}>
            <Controller
              name="termsAccepted"
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

          {errors.termsAccepted?.message ? (
            <Typography className={styles.formErrorText}>
              {errors.termsAccepted.message}
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
