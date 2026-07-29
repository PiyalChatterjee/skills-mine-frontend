import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { SignUpForm } from "@/modules/public/components/SignUpForm";
import { SignUpGoogleButton } from "@/modules/public/components/SignUpGoogleButton";
import { SignUpSuccess } from "@/modules/public/components/SignUpSuccess";
import { useCandidateGoogleAuthState } from "@/modules/public/hooks/useCandidateGoogleAuthState";
import { useRecruiterSignUpForm } from "@/modules/public/hooks/useRecruiterSignUpForm";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import closeIconSrc from "@/assets/icons/close-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

type RecruiterSignUpDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const RecruiterSignUpDrawer = ({
  open,
  onClose,
}: RecruiterSignUpDrawerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const {
    register,
    control,
    errors,
    isSubmitting,
    submitForm,
  } = useRecruiterSignUpForm();
  const {
    hasGoogleClientId,
    pendingGoogleAuth,
    googleAuthStatus,
    googleAuthMessage,
    handleGoogleAuthStart,
    handleGoogleAuthSuccess,
    handleGoogleAuthError,
    handleGoogleLoginUnavailable,
  } = useCandidateGoogleAuthState();

  const googleStatusClassName =
    googleAuthStatus === "success"
      ? styles.googleStatusSuccess
      : googleAuthStatus === "error"
        ? styles.googleStatusError
        : styles.googleStatus;

  const handleSignUpSubmit = async () => {
    try {
      const success = await submitForm();
      if (success) {
        setSignUpSuccess(true);
        dispatch(
          pushNotification({
            title: "Sign up successful",
            message: "Your recruiter account request was submitted.",
            level: "success",
          }),
        );
      }
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : "Sign up failed. Please try again.";
      dispatch(
        pushNotification({
          title: "Sign up failed",
          message,
          level: "error",
        }),
      );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: styles.drawerPaper,
        },
      }}
    >
      {signUpSuccess ? (
        <>
          <IconButton
            aria-label="Close sign up panel"
            className={styles.closeButton}
            onClick={onClose}
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" className={styles.closeIcon} />
          </IconButton>
          <SignUpSuccess
            navigateTo={ROUTE_PATHS.login}
          />
        </>
      ) : (
        <Box className={styles.drawerContent}>
          <IconButton
            aria-label="Close sign up panel"
            className={styles.closeButton}
            onClick={onClose}
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" className={styles.closeIcon} />
          </IconButton>

          <Box className={styles.titleBlock}>
            <Typography component="h2" className={styles.title}>
              Sign up to start recruiting.
            </Typography>
            <Typography className={styles.subtitle}>
              Your recruitment manager will share your login credentials.
            </Typography>
          </Box>

          <Divider className={styles.sectionDivider} />

          <SignUpGoogleButton
            hasGoogleClientId={hasGoogleClientId}
            disabled={pendingGoogleAuth}
            onAuthStart={handleGoogleAuthStart}
            onAuthSuccess={handleGoogleAuthSuccess}
            onAuthError={handleGoogleAuthError}
            onUnavailable={handleGoogleLoginUnavailable}
          />

          {hasGoogleClientId && googleAuthMessage ? (
            <Typography className={`${styles.googleStatus} ${googleStatusClassName}`}>
              {googleAuthMessage}
            </Typography>
          ) : null}

          <Box className={styles.dividerRow}>
            <Divider className={styles.dividerLine} />
            <Typography className={styles.dividerText}>or continue manually</Typography>
            <Divider className={styles.dividerLine} />
          </Box>

          <SignUpForm
            register={register}
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            disableSubmit={pendingGoogleAuth}
            onSubmit={() => {
              void handleSignUpSubmit();
            }}
          />
        </Box>
      )}

    </Drawer>
  );
};
