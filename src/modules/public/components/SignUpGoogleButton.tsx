import { Box, Button } from "@mui/material";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./CandidateSignUpDrawer.module.css";

type SignUpGoogleButtonProps = {
  hasGoogleClientId: boolean;
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (tokenResponse: TokenResponse) => void;
  onAuthError: () => void;
  onUnavailable: () => void;
};

type SignUpGoogleOAuthButtonProps = {
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (tokenResponse: TokenResponse) => void;
  onAuthError: () => void;
};

const SignUpGoogleOAuthButton = ({
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}: SignUpGoogleOAuthButtonProps) => {
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

const SignUpGoogleFallbackButton = ({
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

export const SignUpGoogleButton = ({
  hasGoogleClientId,
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
  onUnavailable,
}: SignUpGoogleButtonProps) => {
  if (!hasGoogleClientId) {
    return <SignUpGoogleFallbackButton onUnavailable={onUnavailable} />;
  }

  return (
    <SignUpGoogleOAuthButton
      disabled={disabled}
      onAuthStart={onAuthStart}
      onAuthSuccess={onAuthSuccess}
      onAuthError={onAuthError}
    />
  );
};
