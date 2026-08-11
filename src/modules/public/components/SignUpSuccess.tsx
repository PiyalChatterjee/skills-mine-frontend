import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import registerSuccessIcon from "@/assets/icons/register-success-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

type SignUpSuccessProps = {
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  navigateTo: string;
  onNavigate?: () => void;
};

export const SignUpSuccess = ({
  heading = "Your request has been received.",
  subtext = "Check your inbox for further instructions.",
  ctaLabel = "Sign in",
  navigateTo,
  onNavigate,
}: SignUpSuccessProps) => {
  const navigate = useNavigate();

  return (
    <Box className={styles.successContent}>
      <img
        src={registerSuccessIcon}
        alt="Registration successful"
        className={styles.successIcon}
      />

      <Box className={styles.successTextBlock}>
        <Typography component="h2" className={styles.successHeading}>
          {heading}
        </Typography>
        <Typography className={styles.successSubtext}>
          {subtext}
        </Typography>
      </Box>

      <Divider className={styles.sectionDivider} />

      <Button
        variant="contained"
        className={styles.signInButton}
        onClick={() => {
          onNavigate?.();
          navigate(navigateTo, { replace: true });
        }}
      >
        {ctaLabel}
      </Button>
    </Box>
  );
};
