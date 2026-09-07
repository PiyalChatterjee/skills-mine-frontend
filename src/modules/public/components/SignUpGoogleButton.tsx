import { Box, Button } from "@mui/material";
import { hasCognitoHostedUiConfig, redirectToGoogleLogin } from "@/app/auth/cognitoHostedUi";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./CandidateSignUpDrawer.module.css";

type SignUpGoogleButtonProps = {
  hasGoogleClientId: boolean;
  disabled: boolean;
  onUnavailable: () => void;
};
const SignUpGoogleFallbackButton = ({ onUnavailable }: { onUnavailable: () => void }) => {
  return (
    <Button
      variant="outlined"
      className={styles.googleButton}
      startIcon={
        <Box
          component="img"
          src={googleLogoUrl}
          alt=""
          aria-hidden="true"
          className={styles.googleIcon}
        />
      }
      onClick={onUnavailable}
    >
      Sign Up with Google
    </Button>
  );
};

export const SignUpGoogleButton = ({
  hasGoogleClientId,
  disabled,
  onUnavailable,
}: SignUpGoogleButtonProps) => {
  if (!hasGoogleClientId || !hasCognitoHostedUiConfig) {
    return <SignUpGoogleFallbackButton onUnavailable={onUnavailable} />;
  }

  return (
    <Button
      variant="outlined"
      disabled={disabled}
      className={styles.googleButton}
      startIcon={
        <Box
          component="img"
          src={googleLogoUrl}
          alt=""
          aria-hidden="true"
          className={styles.googleIcon}
        />
      }
      onClick={() => {
        void redirectToGoogleLogin("signup");
      }}
    >
      Sign Up with Google
    </Button>
  );
};
