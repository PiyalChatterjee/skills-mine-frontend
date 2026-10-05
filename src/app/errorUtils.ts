import { API_ERROR_MESSAGES } from "@/enums/apiErrorMessages";

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const getErrorSources = (error: unknown) => {
  const source = asRecord(error);
  const payload = asRecord(asRecord(source?.response)?.data);
  const details = asRecord(source?.details);
  return [
    payload,
    asRecord(payload?.error),
    source,
    asRecord(source?.data),
    details,
    asRecord(details?.error),
  ];
};

export const extractErrorCode = (error: unknown): string | undefined => {
  for (const source of getErrorSources(error)) {
    for (const value of [
      source?.code,
      source?.errorCode,
      source?.error_code,
      source?.error,
      source?.message,
    ]) {
      if (
        typeof value === "string" &&
        Object.hasOwn(API_ERROR_MESSAGES, value.trim())
      ) {
        return value.trim();
      }
    }
  }
  return undefined;
};

export const extractErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const code = extractErrorCode(error);
  if (code) {
    return API_ERROR_MESSAGES[code as keyof typeof API_ERROR_MESSAGES];
  }

  for (const source of getErrorSources(error)) {
    const message = source?.message;
    if (typeof message === "string" && message.trim()) {
      const trimmed = message.trim();
      if (
        !/^Request failed with status code \d{3}$/i.test(trimmed) &&
        !/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(trimmed)
      ) {
        return trimmed;
      }
    }
  }

  return fallback;
};

// Reads the HTTP status from either a raw Axios error (error.response.status)
// or an already-mapped ApiError/RTK Query error (error.status).
export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    response?: { status?: unknown };
  };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }

  return undefined;
};

export const isNotFoundError = (error: unknown): boolean =>
  getErrorStatus(error) === 404;

export const isConflictError = (error: unknown): boolean =>
  getErrorStatus(error) === 409;

export const isUnauthorizedError = (error: unknown): boolean =>
  getErrorStatus(error) === 401;

export const isForbiddenError = (error: unknown): boolean =>
  getErrorStatus(error) === 403;
