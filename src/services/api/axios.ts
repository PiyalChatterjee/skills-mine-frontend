import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { authEvents } from "@/app/auth/authEvents";
import { tokenStorage } from "@/app/auth/tokenStorage";
import type { SuccessEnvelope } from "@/types/api";

// Set on a request's config to opt out of the global "401 -> log the user out"
// behavior, for endpoints whose failures shouldn't end the session (e.g. best-effort
// AI features) — the caller handles the error itself instead.
declare module "axios" {
  interface AxiosRequestConfig {
    skipUnauthorizedRedirect?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
// Individual backend services can be pointed at their real deployed URLs
// independently of the general API base, which stays on the mock server.
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || API_BASE_URL;
const CANDIDATE_API_BASE_URL = import.meta.env.VITE_CANDIDATE_API_BASE_URL || API_BASE_URL;
const MANDATE_API_BASE_URL = import.meta.env.VITE_MANDATE_API_BASE_URL || API_BASE_URL;
const REQUEST_TIMEOUT_MS = Number(
  import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 5000,
);

const createApiClient = (baseURL: string) => {
  const client = axios.create({ baseURL, timeout: REQUEST_TIMEOUT_MS });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tokens = tokenStorage.getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Only react to 401s that end an active session; otherwise a 401 from an
      // already-logged-out/public request would keep re-triggering clearSession
      // -> resetApiState() -> refetch -> 401 in an infinite loop.
      if (
        error.response?.status === 401 &&
        tokenStorage.getTokens()?.accessToken &&
        !error.config?.skipUnauthorizedRedirect
      ) {
        tokenStorage.clearAuth();
        authEvents.emitUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const apiClient = createApiClient(API_BASE_URL);
export const authApiClient = createApiClient(AUTH_API_BASE_URL);
export const candidateApiClient = createApiClient(CANDIDATE_API_BASE_URL);
export const mandateApiClient = createApiClient(MANDATE_API_BASE_URL);

export const unwrapResponseData = async <T>(
  responsePromise: Promise<AxiosResponse<T>>,
): Promise<T> => {
  const response = await responsePromise;
  return response.data;
};

export const unwrapEnvelopeData = async <T>(
  responsePromise: Promise<AxiosResponse<SuccessEnvelope<T>>>,
): Promise<T> => {
  const response = await responsePromise;
  return response.data.data;
};
