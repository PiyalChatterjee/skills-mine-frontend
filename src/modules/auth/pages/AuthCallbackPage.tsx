import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/app/auth/AuthContext';
import { exchangeCodeForTokens } from '@/app/auth/cognitoHostedUi';
import { tokenStorage } from '@/app/auth/tokenStorage';
import { extractErrorMessage, isConflictError } from '@/app/errorUtils';
import { authApi, buildAuthUserFromCurrentUser } from '@/services/api/authApi';
import { PENDING_CANDIDATE_PROFILE_STORAGE_KEY } from '@/modules/candidate/types/profileCreation';
import { roleToDefaultRoute } from '@/routes/roleDefaultRoutes';
import { ROUTE_PATHS } from '@/routes/routePaths';
import styles from './AuthCallbackPage.module.css';

/**
 * AuthCallbackPage — handles the redirect from Cognito Hosted UI after Google sign-in.
 *
 * Cognito redirects here as:
 *   /callback?code=<AUTH_CODE>&state=<login|signup>
 *
 * Steps:
 *   1. Extract ?code from URL.
 *   2. Exchange code + PKCE verifier for tokens via POST /oauth2/token.
 *   3. Temporarily store tokens so the Axios interceptor attaches the Bearer header.
 *   4. For sign-up, provision the candidate via POST /auth/candidates/register-google.
 *   5. Fetch GET /users/me, store the session, and route to the appropriate page.
 *
 * On any failure: clear auth state and redirect to /login?error=google_callback
 * so LoginPage can surface an error message.
 */
const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { login }      = useAuth();
  // Guard against React StrictMode's double-invoke in development
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code  = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const isSignup = searchParams.get('state') === 'signup';

    const redirectToLoginWithError = (message: string) => {
      const params = new URLSearchParams({
        error: "google_callback",
        message,
      });
      navigate(`${ROUTE_PATHS.login}?${params.toString()}`, { replace: true });
    };

    // Cognito signals a user-cancelled or IdP error via ?error=
    if (error != null || code == null) {
      redirectToLoginWithError(
        errorDescription ?? error ?? "Google sign-in failed. Please try again.",
      );
      return;
    }

    const handle = async () => {
      try {
        // Step 1: exchange authorization code for Cognito tokens (PKCE)
        const tokens = await exchangeCodeForTokens(code);
        if (!tokens.idToken) {
          throw new Error('Cognito token exchange did not return an idToken.');
        }

        // Step 2: store tokens so authApi's Axios interceptor sends Authorization header
        tokenStorage.setTokens(tokens);

        // Step 3: provision first-time Google candidates for sign-up callbacks
        if (isSignup) {
          sessionStorage.removeItem(PENDING_CANDIDATE_PROFILE_STORAGE_KEY);

          try {
            await authApi.exchangeGoogleToken({ idToken: tokens.idToken });
          } catch (error) {
            if (!isConflictError(error)) {
              throw error;
            }
          }
        }

        // Step 4: fetch the application profile
        const currentUser = await authApi.getCurrentUser();

        // Step 5: build the AuthUser and log in
        const user = await buildAuthUserFromCurrentUser(currentUser, tokens.idToken);
        tokenStorage.setUser(user);
        login({ user, tokens });

        // Step 6: enter through the dashboard so the onboarding guard can
        // route incomplete candidates to profile or CV setup as needed.
        const destination =
          isSignup && user.role === 'JOB_SEEKER'
            ? ROUTE_PATHS.candidateDashboard
            : roleToDefaultRoute[user.role] ?? ROUTE_PATHS.login;
        navigate(destination, { replace: true });
      } catch (callbackError) {
        tokenStorage.clearAuth();
        redirectToLoginWithError(
          extractErrorMessage(
            callbackError,
            "Google sign-in failed. Please try again.",
          ),
        );
      }
    };

    void handle();
  }, [login, navigate, searchParams]);

  return (
    <Box className={styles.authCallback}>
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
