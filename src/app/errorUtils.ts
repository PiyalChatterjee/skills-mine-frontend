export const API_ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED:
    "This email address is already registered. Please sign in or use a different email address.",
  STAFF_NUMBER_ALREADY_REGISTERED:
    "This staff number is already registered. Please sign in or contact your administrator.",
  COGNITO_USER_ALREADY_EXISTS:
    "An account already exists with these details. Please sign in or reset your password.",
  COGNITO_PROVISIONING_FAILED:
    "We couldn't create your account. Please try again later.",
  DATABASE_PROVISIONING_FAILED:
    "We couldn't complete your account setup. Please try again later.",
  INVITATION_INVALID:
    "This invitation is invalid. Please request a new invitation.",
  INVITATION_EXPIRED:
    "This invitation has expired. Please request a new invitation.",
  INVITATION_CONSUMED:
    "This invitation has already been used. Please sign in or contact your administrator.",
  INVITATION_REVOKED:
    "This invitation has been revoked. Please contact your administrator.",
  INVITATION_EMAIL_MISMATCH:
    "Your email address does not match the invitation. Please use the invited email address.",
  INVITATION_STAFF_NUMBER_MISMATCH:
    "Your staff number does not match the invitation. Please check it or contact your administrator.",
  STAFF_PROFILE_NOT_FOUND:
    "Your staff profile could not be found. Please contact your administrator.",
  STAFF_REGISTRATION_COMPLETED:
    "Your staff registration is already complete. Please sign in.",
  INVALID_CREDENTIALS:
    "The email address or password is incorrect. Please try again.",
  ACCOUNT_DISABLED: "Your account has been disabled. Please contact support.",
  ACCOUNT_LOCKED: "Your account is locked. Please contact support for help.",
  TOKEN_REVOKED: "Your session is no longer valid. Please sign in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  UNSUPPORTED_ROLE:
    "Your account role is not supported for this action. Please contact support.",
  PASSWORD_POLICY_VIOLATION:
    "Your password does not meet the security requirements. Please choose a stronger password.",
  INVALID_RESET_CODE:
    "The password reset code is invalid. Please check the code or request a new one.",
  RESET_CODE_EXPIRED:
    "The password reset code has expired. Please request a new one.",
  VISITOR_NOT_FOUND:
    "Your visitor profile could not be found. Please refresh the page and try again.",
  VISITOR_ALREADY_CONVERTED:
    "This visitor profile has already been linked to an account. Please sign in.",
  IDENTITY_ALREADY_LINKED:
    "This sign-in method is already linked to an account.",
  GOOGLE_ACCOUNT_CONFLICT:
    "This Google account conflicts with an existing account. Please sign in using your original sign-in method.",
  VALIDATION_ERROR:
    "Some details are invalid. Please check your entries and try again.",
  INVALID_INPUT:
    "The submitted information is invalid. Please check your entries and try again.",
  USER_NOT_FOUND:
    "The account could not be found. Please check your details and try again.",
  INVALID_OPERATION:
    "This action cannot be completed in the current state. Please refresh the page and try again.",
} as const;

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
