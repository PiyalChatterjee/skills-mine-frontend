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

// ---------------------------------------------------------------------------
// Base URLs — derived from a single gateway host.
// Only VITE_API_BASE_URL needs to be set in .env.
// To add a new microservice, append its path suffix here — no .env change needed.
// ---------------------------------------------------------------------------
const gateway = import.meta.env.VITE_API_BASE_URL ?? "/api";

const serviceBaseUrls = {
  default:   gateway,                                    // recruiter / pipeline / manco
  auth:      `${gateway}/api/auth-service/v1`,                                    // auth paths carry /api/auth-service/v1/... themselves
  candidate: `${gateway}/api/candidate-service`,
  mandate:   `${gateway}/api/mandate-service`,
  document:  `${gateway}/api/document-service`,
  crm:       `${gateway}/api/crm-service`,
  ai:        `${gateway}/api/ai-service`,
  visitor:  `${gateway}/api/visitor-service`,
} as const;

// Tune here — no .env variable needed.
const REQUEST_TIMEOUT_MS = 5000;
const AI_REQUEST_TIMEOUT_MS = 60000;

const createApiClient = (
  baseURL: string,
  timeout = REQUEST_TIMEOUT_MS,
) => {
  const client = axios.create({ baseURL, timeout });

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

export const apiClient       = createApiClient(serviceBaseUrls.default);
export const authApiClient   = createApiClient(serviceBaseUrls.auth);
export const candidateApiClient = createApiClient(serviceBaseUrls.candidate);
export const mandateApiClient   = createApiClient(serviceBaseUrls.mandate);
export const documentApiClient  = createApiClient(serviceBaseUrls.document);
export const crmApiClient       = createApiClient(serviceBaseUrls.crm);
export const aiApiClient        = createApiClient(
  serviceBaseUrls.ai,
  AI_REQUEST_TIMEOUT_MS,
);
export const visitorApiClient = createApiClient(serviceBaseUrls.visitor);

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
