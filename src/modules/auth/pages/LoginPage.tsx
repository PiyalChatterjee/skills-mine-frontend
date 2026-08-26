import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { useZodForm } from "@/hooks/useZodForm";
import AuthHero from "@/modules/auth/components/AuthHero";
import AuthPasswordField from "@/modules/auth/components/AuthPasswordField";
import ChangePasswordModal from "@/modules/candidate/components/ChangePasswordModal";
import { roleToDefaultRoute } from "@/routes/roleDefaultRoutes";
import { loginSchema, type LoginFormValues } from "@/modules/auth/types";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { authApi, mapLoginResponseToSession } from "@/services/api/authApi";
import googleLogoUrl from "@/assets/public-layout/google-logo.png";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(false);
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema, {
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
  });
  const passwordValue = watch("password");
  const usernameValue = watch("username");
  const isForgotPasswordModalOpen = searchParams.get("forgot-password") === "1";
  const isPostSignupCandidate = searchParams.get("postSignup") === "candidate";

  const handleForgotPasswordClose = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("forgot-password");
    setSearchParams(nextSearchParams, { replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    let isActive = true;

    const routeAuthenticatedUser = async () => {
      if (user.role !== "JOB_SEEKER") {
        navigate(roleToDefaultRoute[user.role], { replace: true });
        return;
      }

      if (!isActive) {
        return;
      }

      navigate(
        isPostSignupCandidate
          ? ROUTE_PATHS.profileCreation
          : roleToDefaultRoute[user.role],
        { replace: true },
      );
    };

    void routeAuthenticatedUser();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isPostSignupCandidate, navigate, user]);

  const handleGoogleAuthSuccess = async (tokenResponse: TokenResponse) => {
    try {
      setGoogleAuthError(null);
      const response = await authApi.exchangeGoogleToken({
        accessToken: tokenResponse.access_token,
      });
      const session = await mapLoginResponseToSession(response);
      login(session);
    } catch {
      setGoogleAuthError("Google sign-in failed. Please try again.");
    } finally {
      setPendingGoogleAuth(false);
    }
  };

  const handleGoogleAuthError = () => {
    setPendingGoogleAuth(false);
    setGoogleAuthError("Google sign-in failed. Please try again.");
  };

  const startGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: handleGoogleAuthSuccess,
    onError: handleGoogleAuthError,
  });

  const handleGoogleLogin = () => {
    setSubmitError(null);

    if (!hasGoogleClientId) {
      setGoogleAuthError("Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID.");
      return;
    }

    setGoogleAuthError(null);
    setPendingGoogleAuth(true);
    startGoogleLogin();
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null);

      const response = await authApi.login(values);
      const session = await mapLoginResponseToSession(response);
      login(session);
    } catch {
      setSubmitError("Login failed. Check your credentials and try again.");
    }
  };

  return (
    <Box className={styles.pageRoot}>
      <ChangePasswordModal
        open={isForgotPasswordModalOpen}
        prefillEmail={usernameValue}
        onClose={handleForgotPasswordClose}
        mode="reset"
      />
      <AuthHero
        headline="Where talent meets opportunity."
        headlineClassName={styles.heroHeadlineOverride}
      />

      <Box className={styles.formSection}>
        <Typography className={styles.formHeading}>
          Log in using your email and provided password.
        </Typography>

        <Box component="form" className={styles.formFields} onSubmit={handleSubmit(onSubmit)}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          {googleAuthError ? <Alert severity="error">{googleAuthError}</Alert> : null}

          <Box className={styles.fieldGroup}>
            <Typography className={styles.fieldLabel}>Email</Typography>
            <TextField
              placeholder="Email"
              autoComplete="email"
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              {...register("username")}
              className={styles.inputField}
            />
          </Box>

          <AuthPasswordField
            label="Password"
            placeholder="Password"
            value={passwordValue}
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            registration={register("password")}
            fieldGroupClassName={styles.fieldGroup}
            fieldLabelClassName={styles.fieldLabel}
            inputFieldClassName={styles.inputField}
            toggleButtonClassName={styles.passwordToggleButton}
            toggleIconClassName={styles.passwordToggleIcon}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || pendingGoogleAuth}
            className={styles.submitButton}
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </Button>

          <Box className={styles.forgotPasswordRow}>
            <Typography
              component={Link}
              to="?forgot-password=1"
              replace
              className={styles.forgotPasswordLink}
            >
              Forgot password?
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            className={styles.googleButton}
            onClick={handleGoogleLogin}
            disabled={isSubmitting || pendingGoogleAuth}
            startIcon={
              <Box
                component="img"
                src={googleLogoUrl}
                alt=""
                aria-hidden="true"
                className={styles.googleIcon}
              />
            }
          >
            {pendingGoogleAuth ? "Opening Google..." : "Sign in with Google"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
