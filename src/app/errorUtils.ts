export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message && !/^Request failed with status code \d{3}$/i.test(message)) {
      return message;
    }
  }

  return fallback;
};