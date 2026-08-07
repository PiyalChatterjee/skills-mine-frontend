import { useState } from "react";
import type { TokenResponse } from "@react-oauth/google";
import type { GoogleAuthStatus } from "@/modules/public/components/SignUpDrawer.types";
import { authApi } from "@/services/api/authApi";

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

  const handleGoogleAuthSuccess = async (tokenResponse: TokenResponse) => {
    try {
      await authApi.exchangeGoogleToken({
        accessToken: tokenResponse.access_token,
      });
      setGoogleAuthStatus("success");
      setGoogleAuthMessage("Google sign-in succeeded.");
    } catch {
      setGoogleAuthStatus("error");
      setGoogleAuthMessage("Google sign-in failed. Please try again.");
    } finally {
      setPendingGoogleAuth(false);
    }
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
