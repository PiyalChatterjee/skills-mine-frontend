import {
  Alert,
  Box,
  Divider,
  Drawer,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CandidateSignUpForm } from "@/modules/public/components/CandidateSignUpForm";
import { CandidateSignUpGoogleButton } from "@/modules/public/components/CandidateSignUpGoogleButton";
import { CandidateSignUpSuccess } from "@/modules/public/components/CandidateSignUpSuccess";
import { useCandidateGoogleAuthState } from "@/modules/public/hooks/useCandidateGoogleAuthState";
import { useCandidateSignUpForm } from "@/modules/public/hooks/useCandidateSignUpForm";
import closeIconSrc from "@/assets/icons/close-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

type CandidateSignUpDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const CandidateSignUpDrawer = ({
  open,
  onClose,
}: CandidateSignUpDrawerProps) => {
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [snackbarErrorOpen, setSnackbarErrorOpen] = useState(false);
  const {
    register,
    control,
    errors,
    isSubmitting,
    submitForm,
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

  const handleSignUpSubmit = async () => {
    try {
      const success = await submitForm();
      if (success) {
        setSignUpSuccess(true);
      }
    } catch {
      setSnackbarErrorOpen(true);
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
          <CandidateSignUpSuccess />
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

          <Typography component="h2" className={styles.title}>
            Sign up to search roles.
          </Typography>

          <Divider className={styles.sectionDivider} />

          <CandidateSignUpGoogleButton
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

          <CandidateSignUpForm
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

      <Snackbar
        open={snackbarErrorOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbarErrorOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          Sign up failed. Please try again.
        </Alert>
      </Snackbar>
    </Drawer>
  );
};
