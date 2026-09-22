import { describe, expect, it } from "vitest";
import { extractErrorMessage } from "./errorUtils";

describe("extractErrorMessage", () => {
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