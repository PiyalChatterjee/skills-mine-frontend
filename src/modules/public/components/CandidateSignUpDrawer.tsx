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
import { useCandidateSignUpForm } from "@/modules/public/hooks/useCandidateSignUpForm";
import { hasCognitoHostedUiConfig } from "@/app/auth/cognitoHostedUi";
import { extractErrorMessage } from "@/app/errorUtils";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import closeIconSrc from "@/assets/icons/close-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

type CandidateSignUpDrawerProps = {
  open: boolean;
  onClose: () => void;
  visitorId?: string;
  visitorEmail?: string;
};

export const CandidateSignUpDrawer = ({
  open,
  onClose,
  visitorId,
  visitorEmail = "",
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
  } = useCandidateSignUpForm(visitorId, visitorEmail);
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
          : extractErrorMessage(error, "Sign up failed. Please try again.");
      dispatch(
        pushNotification({
          title: "Sign up",
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
            navigateTo={`${ROUTE_PATHS.login}?postSignup=candidate`}
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
            hasGoogleClientId={hasCognitoHostedUiConfig}
            disabled={false}
            onUnavailable={() => undefined}
          />

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
            disableSubmit={false}
            emailDisabled={Boolean(visitorId && visitorEmail)}
            onSubmit={() => {
              void handleSignUpSubmit();
            }}
          />
        </Box>
      )}

    </Drawer>
  );
};
