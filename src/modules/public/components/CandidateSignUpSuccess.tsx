import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/routes/routePaths";
import registerSuccessIcon from "@/assets/icons/register-success-icon.svg";
import styles from "./CandidateSignUpDrawer.module.css";

export const CandidateSignUpSuccess = () => {
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
          Your request has been received.
        </Typography>
        <Typography className={styles.successSubtext}>
          Check your inbox for further instructions.
        </Typography>
      </Box>

      <Divider className={styles.sectionDivider} />

      <Button
        variant="contained"
        className={styles.signInButton}
        onClick={() => {
          navigate(ROUTE_PATHS.candidateDashboard);
        }}
      >
        Sign in
      </Button>
    </Box>
  );
};
