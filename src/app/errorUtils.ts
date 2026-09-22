export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message && !/^Request failed with status code \d{3}$/i.test(message)) {
      return message;
    }
  }

  if (typeof error === "object" && error !== null) {
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
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

  const candidate = error as { status?: unknown; response?: { status?: unknown } };

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