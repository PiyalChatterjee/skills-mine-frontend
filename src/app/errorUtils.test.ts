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

  it("uses the fallback for absent or null messages", () => {
    expect(extractErrorMessage({ message: undefined }, "Fallback")).toBe("Fallback");
    expect(extractErrorMessage({ message: null }, "Fallback")).toBe("Fallback");
    expect(extractErrorMessage(undefined, "Fallback")).toBe("Fallback");
  });
});