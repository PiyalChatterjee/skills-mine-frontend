import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useZodForm } from "@/hooks/useZodForm";
import AuthHero from "@/modules/auth/components/AuthHero";
import AuthPasswordField from "@/modules/auth/components/AuthPasswordField";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/modules/auth/types/resetPassword";
import styles from "./ResetPasswordPage.module.css";
import { pushNotification } from "@/store/slices/notificationSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useSearchParams } from "react-router-dom";
import { resetPasswordThunk } from "@/store/slices/authThunks";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { tokenStorage } from "@/app/auth/tokenStorage";
import { authApi } from "@/services/api/authApi";
import { z } from "zod";
import { strongPasswordSchema } from "@/app/passwordPolicy";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
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

  const onSubmit = async (_values: ResetPasswordFormValues) => {
    const token = searchParams.get("token")?.trim() ?? "";

    if (!token) {
      dispatch(
        pushNotification({
          level: "error",
          title: "Reset link invalid",
          message: "Missing reset token. Please request a new reset link.",
        }),
      );
      return;
    }

    try {
      const resetResponse = await dispatch(
        resetPasswordThunk({
          resetToken: token,
          newPassword: _values.password,
          confirmNewPassword: _values.confirmPassword,
        }),
      ).unwrap();

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
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Reset failed",
          message: "Unable to reset password. Please try again.",
        }),
      );
    }
  };

  const onSubmitChangePassword = async (_values: {
    currentPassword: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await authApi.changePassword({
        currentPassword: _values.currentPassword,
        newPassword: _values.password,
        confirmNewPassword: _values.confirmPassword,
      });

      dispatch(
        pushNotification({
          level: "success",
          title: "Password changed",
          message: "Your password has been updated successfully.",
        }),
      );

      navigate(ROUTE_PATHS.profile, { replace: true });
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
          ) : null}

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
                : "Change password"
              : isSubmitting
                ? "Resetting..."
                : "Reset password"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
