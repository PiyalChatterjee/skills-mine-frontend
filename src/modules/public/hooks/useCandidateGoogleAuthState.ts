import { useState } from "react";
import type { TokenResponse } from "@react-oauth/google";
import type { GoogleAuthStatus } from "@/modules/public/components/CandidateSignUpDrawer.types";

export const useCandidateGoogleAuthState = () => {
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] =
    useState<GoogleAuthStatus>("idle");
  const [googleAuthMessage, setGoogleAuthMessage] = useState<string>("");

  const hasGoogleClientId = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim(),
  );

  const handleGoogleAuthStart = () => {
    setPendingGoogleAuth(true);
    setGoogleAuthStatus("idle");
    setGoogleAuthMessage("");
  };

  const handleGoogleAuthSuccess = (tokenResponse: TokenResponse) => {
    setGoogleAuthStatus("success");
    setGoogleAuthMessage(
      "Google sign-in succeeded. Final backend token exchange is still TODO.",
    );
    setPendingGoogleAuth(false);

    // TODO: Exchange tokenResponse.access_token with backend auth endpoint.
    console.info("Google token response", tokenResponse);
  };

  const handleGoogleAuthError = () => {
    setGoogleAuthStatus("error");
    setGoogleAuthMessage("Google sign-in failed. Please try again.");
    setPendingGoogleAuth(false);
  };

  const handleGoogleLoginUnavailable = () => {
    setPendingGoogleAuth(false);
    /* setGoogleAuthStatus("error");
    setGoogleAuthMessage(
      "Google Client ID is missing. Set VITE_GOOGLE_CLIENT_ID in your env.",
    ); */
  };

  return {
    hasGoogleClientId,
    pendingGoogleAuth,
    googleAuthStatus,
    googleAuthMessage,
    handleGoogleAuthStart,
    handleGoogleAuthSuccess,
    handleGoogleAuthError,
    handleGoogleLoginUnavailable,
  };
};
