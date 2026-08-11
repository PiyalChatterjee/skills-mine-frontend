import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { authEvents } from "@/app/auth/authEvents";
import { tokenStorage } from "@/app/auth/tokenStorage";
import type { SuccessEnvelope } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const REQUEST_TIMEOUT_MS = Number(
  import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 5000,
);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = tokenStorage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clearAuth();
      authEvents.emitUnauthorized();
    }
    return Promise.reject(error);
  },
);
