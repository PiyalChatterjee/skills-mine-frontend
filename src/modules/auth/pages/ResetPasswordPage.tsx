import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useZodForm } from "@/hooks/useZodForm";
import AuthHero from "@/modules/auth/components/AuthHero";
import AuthPasswordField from "@/modules/auth/components/AuthPasswordField";
import {
  changePasswordSchema,
  resetPasswordSchema,
  type ChangePasswordFormValues,
  type ResetPasswordFormValues,
} from "@/app/validation.schema";
import styles from "./ResetPasswordPage.module.css";
import { pushNotification } from "@/store/slices/notificationSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { tokenStorage } from "@/app/auth/tokenStorage";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authApi } from "@/services/api/authApi";
import { extractErrorMessage } from "@/app/errorUtils";

type ReturnLocation = {
  pathname: string;
  search?: string;
  hash?: string;
  scrollY: number;
  state?: unknown;
};

const ResetPasswordPage = () => {
  usePageTitle("Reset Password");
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm(resetPasswordSchema, {
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const isChangeMode = searchParams.get("mode") === "change";
  const returnTo = (location.state as { returnTo?: ReturnLocation } | null)
    ?.returnTo;
  const email = (searchParams.get("email") ?? "").trim();
  const [otpCode, setOtpCode] = useState("");
  const [isResendingCode, setIsResendingCode] = useState(false);
  const {
    register: registerCurrentPassword,
    handleSubmit: handleCurrentPasswordSubmit,
    watch: watchCurrentPassword,
    formState: {
      errors: currentPasswordErrors,
      isSubmitting: isCurrentPasswordSubmitting,
    },
  } = useZodForm(
    changePasswordSchema,
    {
      defaultValues: {
        currentPassword: "",
        password: "",
        confirmPassword: "",
      },
    },
  );
  const currentPasswordValue = watchCurrentPassword("currentPassword");
  const changeModePasswordValue = watchCurrentPassword("password");
  const changeModeConfirmPasswordValue = watchCurrentPassword("confirmPassword");

  const handleResendCode = async () => {
    if (!email || isResendingCode) {
      return;
    }

    setIsResendingCode(true);
    try {
      await authApi.forgotPassword({ email });
      dispatch(
        pushNotification({
          level: "success",
          title: "Code resent",
          message: "A new confirmation code has been sent to your email.",
        }),
      );
      setOtpCode("");
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Failed to resend",
          message: "Please try again later.",
        }),
      );
    } finally {
      setIsResendingCode(false);
    }
  };

  const onSubmit = async (_values: ResetPasswordFormValues) => {
    if (!email) {
      dispatch(
        pushNotification({
          level: "error",
          title: "Reset link invalid",
          message: "Missing email address. Please request a new confirmation code.",
        }),
      );
      return;
    }

    if (!otpCode.trim()) {
      dispatch(
        pushNotification({
          level: "error",
          title: "Confirmation code required",
          message: "Please enter the confirmation code sent to your email.",
        }),
      );
      return;
    }

    try {
      const resetResponse = await authApi.resetPassword({
        email: email.toLowerCase(),
        confirmationCode: otpCode.trim(),
        newPassword: _values.password,
      });

      dispatch(
        pushNotification({
          level: "success",
          title: "Password reset",
          message:
            resetResponse.message ||
            "Your password has been updated successfully.",
        }),
      );
      
      navigate(ROUTE_PATHS.login, { replace: true });
      tokenStorage.clearTokens();
      tokenStorage.clearUser();
      tokenStorage.clearAuth();
    } catch (error) {
      const responseMessage =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: unknown } } }).response
              ?.data?.message
          : undefined;
      dispatch(
        pushNotification({
          level: "error",
          title: "Reset failed",
          message:
            typeof responseMessage === "string" && responseMessage.trim()
              ? responseMessage
              : extractErrorMessage(
                  error,
                  "Unable to reset password. Please try again.",
                ),
        }),
      );
    }
  };


  const onSubmitChangePassword = async (_values: ChangePasswordFormValues) => {
    try {
      await authApi.resetPassword({
        currentPassword: _values.currentPassword,
        newPassword: _values.password,
      });

      dispatch(
        pushNotification({
          level: "success",
          title: "Password changed",
          message: "Your password has been updated successfully.",
        }),
      );

      const hasSafeReturnPath =
        isChangeMode &&
        returnTo?.pathname.startsWith("/") &&
        !returnTo.pathname.startsWith("//");

      if (hasSafeReturnPath && returnTo) {
        const returnState =
          typeof returnTo.state === "object" &&
          returnTo.state !== null &&
          !Array.isArray(returnTo.state)
            ? (returnTo.state as Record<string, unknown>)
            : {};

        navigate(
          `${returnTo.pathname}${returnTo.search ?? ""}${returnTo.hash ?? ""}`,
          {
            replace: true,
            state: { ...returnState, restoreScrollY: returnTo.scrollY },
          },
        );
      } else {
        navigate(ROUTE_PATHS.profile, { replace: true });
      }
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Change failed",
          message: "Unable to change password. Please try again.",
        }),
      );
    }
  };

  return (
    <Box className={styles.pageRoot}>
      <AuthHero
        headline="Where talent meets opportunity."
        headlineClassName={styles.heroHeadlineOverride}
      />

      <Box className={styles.formSection}>
        <Typography className={styles.formTitle}>
          {isChangeMode ? "Change your password" : "Reset your password"}
        </Typography>

        <Box
          component="form"
          className={styles.formFields}
          onSubmit={
            isChangeMode
              ? handleCurrentPasswordSubmit(onSubmitChangePassword)
              : handleSubmit(onSubmit)
          }
        >
          {isChangeMode ? (
            <AuthPasswordField
              label="Current password"
              placeholder="Password"
              value={currentPasswordValue}
              autoComplete="current-password"
              error={Boolean(currentPasswordErrors.currentPassword)}
              helperText={currentPasswordErrors.currentPassword?.message}
              registration={registerCurrentPassword("currentPassword")}
              fieldGroupClassName={styles.fieldGroup}
              fieldLabelClassName={styles.fieldLabel}
              inputFieldClassName={styles.inputField}
              toggleButtonClassName={styles.passwordToggleButton}
              toggleIconClassName={styles.passwordToggleIcon}
            />
          ) : (
            <Box className={styles.fieldGroup}>
              <Typography className={styles.fieldLabel}>Confirmation code</Typography>
              <Typography className={styles.otpDescription}>
                Enter the confirmation code sent to {email || "your email"} to reset your password.
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Confirmation code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                className={styles.inputField}
              />
              <Typography className={styles.resendText}>
                Haven&apos;t received the code?{" "}
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={handleResendCode}
                  disabled={isResendingCode}
                >
                  Resend
                </button>
                .
              </Typography>
            </Box>
          )}

          <AuthPasswordField
            label="New password"
            placeholder="Password"
            value={isChangeMode ? changeModePasswordValue : passwordValue}
            autoComplete="new-password"
            error={Boolean(isChangeMode ? currentPasswordErrors.password : errors.password)}
            helperText={
              isChangeMode
                ? currentPasswordErrors.password?.message
                : errors.password?.message
            }
            registration={
              isChangeMode
                ? registerCurrentPassword("password")
                : register("password")
            }
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
          />

          <AuthPasswordField
            label="Retype new password"
            placeholder="Password"
            value={
              isChangeMode
                ? changeModeConfirmPasswordValue
                : confirmPasswordValue
            }
            autoComplete="new-password"
            error={
              Boolean(
                isChangeMode
                  ? currentPasswordErrors.confirmPassword
                  : errors.confirmPassword,
              )
            }
            helperText={
              isChangeMode
                ? currentPasswordErrors.confirmPassword?.message
                : errors.confirmPassword?.message
            }
            registration={
              isChangeMode
                ? registerCurrentPassword("confirmPassword")
                : register("confirmPassword")
            }
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isChangeMode ? isCurrentPasswordSubmitting : isSubmitting}
            className={styles.submitButton}
          >
            {isChangeMode
              ? isCurrentPasswordSubmitting
                ? "Changing..."
                : "Change Password"
              : isSubmitting
                ? "Resetting..."
                : "Reset Password"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
