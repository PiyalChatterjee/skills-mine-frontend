import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/app/auth/AuthContext';
import { exchangeCodeForTokens } from '@/app/auth/cognitoHostedUi';
import { tokenStorage } from '@/app/auth/tokenStorage';
import { authApi, buildAuthUserFromCurrentUser } from '@/services/api/authApi';
import { roleToDefaultRoute } from '@/routes/roleDefaultRoutes';
import { ROUTE_PATHS } from '@/routes/routePaths';

/**
 * AuthCallbackPage — handles the redirect from Cognito Hosted UI after Google sign-in.
 *
 * Cognito redirects here as:
 *   /auth/callback?code=<AUTH_CODE>&state=<OPAQUE>
 *
 * Steps:
 *   1. Extract ?code from URL.
 *   2. Exchange code + PKCE verifier for tokens via POST /oauth2/token.
 *   3. Temporarily store tokens so the Axios interceptor attaches the Bearer header.
 *   4. Fetch GET /api/auth-service/v1/users/me — triggers JIT provisioning on first
 *      Google login; returns roles/candidateId for existing users.
 *   5. Store the full session via AuthContext.login() and route to dashboard.
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

    // Cognito signals a user-cancelled or IdP error via ?error=
    if (error != null || code == null) {
      navigate(`${ROUTE_PATHS.login}?error=google_callback`, { replace: true });
      return;
    }

    const handle = async () => {
      try {
        // Step 1: exchange authorization code for Cognito tokens (PKCE)
        const tokens = await exchangeCodeForTokens(code);

        // Step 2: store tokens so authApi's Axios interceptor sends Authorization header
        tokenStorage.setTokens(tokens);

        // Step 3: fetch the application profile (JIT provision on first login)
        const currentUser = await authApi.getCurrentUser();

        // Step 4: build the AuthUser and log in
        const user = buildAuthUserFromCurrentUser(currentUser, tokens.accessToken);
        tokenStorage.setUser(user);
        login({ user, tokens });

        // Step 5: route to the user's default page
        navigate(roleToDefaultRoute[user.role] ?? ROUTE_PATHS.login, { replace: true });
      } catch {
        tokenStorage.clearAuth();
        navigate(`${ROUTE_PATHS.login}?error=google_callback`, { replace: true });
      }
    };

    void handle();
  }, [login, navigate, searchParams]);

  return (
    <Box
      sx={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
        gap:            2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
