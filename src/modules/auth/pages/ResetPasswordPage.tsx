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

  return (
    <Box className={styles.pageRoot}>
      <AuthHero
        headline="Where talent meets opportunity."
        headlineClassName={styles.heroHeadlineOverride}
      />

      <Box className={styles.formSection}>
        <Typography className={styles.formTitle}>
          Reset your password
        </Typography>

        <Box
          component="form"
          className={styles.formFields}
          onSubmit={handleSubmit(onSubmit)}
        >
          <AuthPasswordField
            label="New password"
            placeholder="Password"
            value={passwordValue}
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            registration={register("password")}
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
          />

          <AuthPasswordField
            label="Retype new password"
            placeholder="Password"
            value={confirmPasswordValue}
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
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
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
