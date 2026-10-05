import { describe, expect, it } from "vitest";
import { API_ERROR_MESSAGES, extractErrorCode, extractErrorMessage } from "./errorUtils";

describe("extractErrorMessage", () => {
  it.each(Object.entries(API_ERROR_MESSAGES))("maps %s to a readable message", (code, message) => {
    expect(extractErrorMessage({ code }, "Fallback")).toBe(message);
    expect(extractErrorMessage({ message: code }, "Fallback")).toBe(message);
    expect(message).not.toBe(code);
  });

  it("prefers the backend code over Axios codes and technical messages", () => {
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 409",
      response: { data: { code: "EMAIL_ALREADY_REGISTERED", message: "Internal provisioning details" } },
    };
    expect(extractErrorCode(error)).toBe("EMAIL_ALREADY_REGISTERED");
    expect(extractErrorMessage(error, "Fallback")).toBe(API_ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
  });

  it.each([
    { errorCode: "INVITATION_EXPIRED" },
    { error_code: "INVITATION_EXPIRED" },
    { response: { data: { error: { code: "INVITATION_EXPIRED" } } } },
    { data: { code: "INVITATION_EXPIRED" } },
    { details: { code: "INVITATION_EXPIRED" } },
    { response: { data: { error: "INVITATION_EXPIRED" } } },
  ])("maps supported payload shapes: %j", (error) => {
    expect(extractErrorMessage(error, "Fallback")).toBe(API_ERROR_MESSAGES.INVITATION_EXPIRED);
  });

  it("keeps a readable backend message for unknown codes", () => {
    expect(extractErrorMessage({ response: { data: { code: "NEW_ERROR_CODE", message: "Please try later." } } }, "Fallback")).toBe("Please try later.");
  });

  it("uses the fallback for unknown enum messages and whitespace", () => {
    expect(extractErrorMessage({ message: "NEW_ERROR_CODE" }, "Fallback")).toBe("Fallback");
    expect(extractErrorMessage({ message: "   " }, "Fallback")).toBe("Fallback");
  });

  it("prefers a backend message over a transport message", () => {
    expect(extractErrorMessage({ message: "Transport error", response: { data: { message: "Please check your details." } } }, "Fallback")).toBe("Please check your details.");
  });

  it("extracts an Error message", () => {
    expect(extractErrorMessage(new Error("Network timeout"), "Fallback")).toBe(
      "Network timeout",
    );
  });

  it("extracts an object message", () => {
    expect(extractErrorMessage({ message: "Request failed" }, "Fallback")).toBe(
      "Request failed",
    );
  });

  it("does not expose raw HTTP status messages", () => {
    expect(
      extractErrorMessage(
        { message: "Request failed with status code 403" },
        "Unable to save your profile.",
      ),
    ).toBe("Unable to save your profile.");
  });

  it("extracts an Axios response payload message", () => {
    expect(
      extractErrorMessage(
        {
          message: "Request failed with status code 401",
          response: { data: { message: "Invalid email or password." } },
        },
        "Login failed.",
      ),
    ).toBe("Invalid email or password.");
  });

  it("uses the fallback for absent or null messages", () => {
    expect(extractErrorMessage({ message: undefined }, "Fallback")).toBe("Fallback");
    expect(extractErrorMessage({ message: null }, "Fallback")).toBe("Fallback");
    expect(extractErrorMessage(undefined, "Fallback")).toBe("Fallback");
  });
});