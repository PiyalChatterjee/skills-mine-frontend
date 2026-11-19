import {
  extractErrorCode,
  extractErrorMessage,
  getErrorStatus,
} from "@/app/errorUtils";

const isTechnicalErrorMessage = (message: string): boolean =>
  /timeout of \d+ms exceeded|network error|network timeout|failed to fetch|request failed with status code \d{3}|^(?:ERR_|ECONN|ETIMEDOUT)/i.test(
    message,
  );

export const getCrmApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const status = getErrorStatus(error);
  if (status === 401) {
    return "Your session may have expired. Please sign in and try again.";
  }
  if (status === 403) {
    return "You don't have permission to access this CRM information.";
  }

  const code = extractErrorCode(error);
  if (code) {
    return extractErrorMessage(error, fallback);
  }

  const message = extractErrorMessage(error, fallback);
  return isTechnicalErrorMessage(message) ? fallback : message;
};
