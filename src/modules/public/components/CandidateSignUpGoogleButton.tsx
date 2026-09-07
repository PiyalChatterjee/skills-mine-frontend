import { Box, Button } from "@mui/material";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./CandidateSignUpDrawer.module.css";

type CandidateSignUpGoogleButtonProps = {
  hasGoogleClientId: boolean;
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (credentialResponse: CredentialResponse) => void;
  onAuthError: () => void;
  onUnavailable: () => void;
};

type CandidateSignUpGoogleOAuthButtonProps = {
  disabled: boolean;
  onAuthStart: () => void;
  onAuthSuccess: (credentialResponse: CredentialResponse) => void;
  onAuthError: () => void;
};

const CandidateSignUpGoogleOAuthButton = ({
  disabled,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}: CandidateSignUpGoogleOAuthButtonProps) => {
  return (
    <Box
      className={styles.googleButton}
      sx={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}
    >
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          onAuthStart();
          onAuthSuccess(credentialResponse);
        }}
        onError={onAuthError}
        useOneTap={false}
      />
    </Box>
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
