/**
 * PKCE (Proof Key for Code Exchange) utilities for the Cognito Hosted UI flow.
 *
 * Usage:
 *   1. generateVerifier()   — generates a random verifier, stores it in sessionStorage
 *   2. computeChallenge()   — SHA-256 hash of the verifier, base64url-encoded
 *   3. Pass challenge+method to /oauth2/authorize; verifier to /oauth2/token
 *   4. consumeVerifier()    — reads + removes verifier from sessionStorage (single-use)
 */

const VERIFIER_KEY = 'skillsmine.pkce.verifier';

const base64urlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** Generates a cryptographically-random 96-byte base64url verifier and stores it. */
export const generateVerifier = (): string => {
  const array = new Uint8Array(96);
  window.crypto.getRandomValues(array);
  const verifier = base64urlEncode(array);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  return verifier;
};

/** Reads and removes the stored verifier (single-use — call exactly once per callback). */
export const consumeVerifier = (): string | null => {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  return verifier;
};

/** SHA-256 hash of the verifier, base64url-encoded — sent as code_challenge. */
export const computeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(new Uint8Array(hashBuffer));
};
