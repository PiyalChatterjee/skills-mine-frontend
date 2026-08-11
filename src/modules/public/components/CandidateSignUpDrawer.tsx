import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SignUpForm } from "@/modules/public/components/SignUpForm";
import { SignUpGoogleButton } from "@/modules/public/components/SignUpGoogleButton";
import { SignUpSuccess } from "@/modules/public/components/SignUpSuccess";
import { useCandidateGoogleAuthState } from "@/modules/public/hooks/useCandidateGoogleAuthState";
import { useCandidateSignUpForm } from "@/modules/public/hooks/useCandidateSignUpForm";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import closeIconSrc from "@/assets/icons/close-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

const CANDIDATE_PROFILE_CREATION_PENDING_KEY = "candidate_profile_creation_pending";
const CANDIDATE_POST_SIGNUP_QUERY = "postSignup=candidate";

type CandidateSignUpDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const CandidateSignUpDrawer = ({
  open,
  onClose,
}: CandidateSignUpDrawerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const {
    register,
    control,
    errors,
    isSubmitting,
    submitForm,
    resetForm,
  } = useCandidateSignUpForm();
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

  const handleDrawerClose = () => {
    onClose();
  };

  useEffect(() => {
    if (open) {
      return;
    }

    setSignUpSuccess(false);
    resetForm();
  }, [open, resetForm]);

  const handleSignUpSubmit = async () => {
    try {
      const success = await submitForm();
      if (success) {
        localStorage.setItem(CANDIDATE_PROFILE_CREATION_PENDING_KEY, "1");
        setSignUpSuccess(true);
        dispatch(
          pushNotification({
            title: "Sign up successful",
            message: "Your candidate account has been created.",
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
      onClose={handleDrawerClose}
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
            onClick={handleDrawerClose}
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" className={styles.closeIcon} />
          </IconButton>
          <SignUpSuccess
            heading="Your account has been created."
            subtext="Please log in to continue with your profile setup."
            ctaLabel="Done"
            navigateTo={`${ROUTE_PATHS.login}?${CANDIDATE_POST_SIGNUP_QUERY}`}
          />
        </>
      ) : (
        <Box className={styles.drawerContent}>
          <IconButton
            aria-label="Close sign up panel"
            className={styles.closeButton}
            onClick={handleDrawerClose}
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" className={styles.closeIcon} />
          </IconButton>

          <Typography component="h2" className={styles.title}>
            Sign up to search roles.
          </Typography>

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
