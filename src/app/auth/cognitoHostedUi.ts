/**
 * Cognito Hosted UI helpers — Authorization Code + PKCE flow.
 *
 * redirectToGoogleLogin():
 *   Builds the /oauth2/authorize URL with identity_provider=Google, generates
 *   the PKCE challenge, and navigates the browser. Call from LoginPage.
 *
 * exchangeCodeForTokens(code):
 *   Exchanges the authorization code + stored PKCE verifier for tokens at
 *   /oauth2/token. Call from AuthCallbackPage after Cognito redirects back.
 */

import { generateVerifier, computeChallenge, consumeVerifier } from '@/app/auth/pkce';
import type { JwtTokens } from '@/types/auth';

const COGNITO_DOMAIN = (import.meta.env.VITE_COGNITO_DOMAIN as string | undefined) ?? '';
const CLIENT_ID      = (import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined) ?? '';
const REDIRECT_URI   = (import.meta.env.VITE_COGNITO_REDIRECT_URI as string | undefined) ?? '';

export const hasCognitoHostedUiConfig = Boolean(
  COGNITO_DOMAIN && CLIENT_ID && REDIRECT_URI,
);

/**
 * Redirects the browser to the Cognito Hosted UI Google sign-in page.
 * The PKCE verifier is stored in sessionStorage; the challenge is sent to Cognito.
 * The browser will return to REDIRECT_URI (/callback) with ?code=...
 */
export const redirectToGoogleLogin = async (intent: 'login' | 'signup' = 'login'): Promise<void> => {
  const verifier  = generateVerifier();
  const challenge = await computeChallenge(verifier);

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    response_type:         'code',
    scope:                 'openid email profile aws.cognito.signin.user.admin',
    redirect_uri:          REDIRECT_URI,
    identity_provider:     'Google',
    state:                 intent,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  });

  window.location.assign(`${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`);
};

/**
 * Exchanges an authorization code + PKCE verifier for Cognito tokens.
 * Throws if the verifier is missing (different tab) or the request fails.
 */
export const exchangeCodeForTokens = async (code: string): Promise<JwtTokens> => {
  const verifier = consumeVerifier();
  if (!verifier) {
    throw new Error(
      'PKCE verifier missing from sessionStorage. ' +
      'The callback may have been opened in a different tab or the page was refreshed.',
    );
  }

  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    client_id:     CLIENT_ID,
    code,
    redirect_uri:  REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Cognito /oauth2/token failed (${response.status}): ${text}`);
  }

  const data = await response.json() as {
    access_token:  string;
    id_token:      string;
    refresh_token: string;
  };

  return {
    accessToken:  data.access_token,
    idToken:      data.id_token,
    refreshToken: data.refresh_token,
  };
};
