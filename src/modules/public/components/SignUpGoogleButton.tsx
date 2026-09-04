import { Box, Button } from "@mui/material";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./CandidateSignUpDrawer.module.css";

type SignUpGoogleButtonProps = {
  hasGoogleClientId: boolean;
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (credentialResponse: CredentialResponse) => void;
  onAuthError: () => void;
  onUnavailable: () => void;
};

type SignUpGoogleOAuthButtonProps = {
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (credentialResponse: CredentialResponse) => void;
  onAuthError: () => void;
};

const SignUpGoogleOAuthButton = ({
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}: SignUpGoogleOAuthButtonProps) => {
  return (
    <Box
      className={styles.googleButton}
      sx={{
        position: "relative",
        height: 50,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <Box className={styles.googleButtonContent} aria-hidden="true">
        <Box
          component="img"
          src={googleLogoUrl}
          alt=""
          className={styles.googleIcon}
        />
        Sign Up with Google
      </Box>
      {/* Real Google button rendered invisibly on top so clicks trigger the actual OAuth flow */}
      <Box className={styles.googleButtonOverlay}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            onAuthStart();
            onAuthSuccess(credentialResponse);
          }}
          onError={onAuthError}
          useOneTap={false}
        />
      </Box>
    </Box>
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
