import { Box, Button } from "@mui/material";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./CandidateSignUpDrawer.module.css";

type CandidateSignUpGoogleButtonProps = {
  hasGoogleClientId: boolean;
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (tokenResponse: TokenResponse) => void;
  onAuthError: () => void;
  onUnavailable: () => void;
};

type CandidateSignUpGoogleOAuthButtonProps = {
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (tokenResponse: TokenResponse) => void;
  onAuthError: () => void;
};

const CandidateSignUpGoogleOAuthButton = ({
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}: CandidateSignUpGoogleOAuthButtonProps) => {
  const startGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: onAuthSuccess,
    onError: onAuthError,
  });

  const handleClick = () => {
    onAuthStart();
    startGoogleLogin();
  };

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
      onClick={handleClick}
      disabled={disabled}
    >
      Sign Up with Google
    </Button>
  );
};

const CandidateSignUpGoogleFallbackButton = ({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) => {
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

export const CandidateSignUpGoogleButton = ({
  hasGoogleClientId,
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
  onUnavailable,
}: CandidateSignUpGoogleButtonProps) => {
  if (!hasGoogleClientId) {
    return <CandidateSignUpGoogleFallbackButton onUnavailable={onUnavailable} />;
  }

  return (
    <CandidateSignUpGoogleOAuthButton
      disabled={disabled}
      onAuthStart={onAuthStart}
      onAuthSuccess={onAuthSuccess}
      onAuthError={onAuthError}
    />
  );
};
