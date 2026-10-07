import { describe, expect, it } from "vitest";
import {
  formatPhoneNumberDisplay,
  isValidLocalPhoneNumber,
  normalizePhoneNumberInput,
  toSouthAfricaApiPhoneNumber,
} from "./phoneNumber";

describe("phone number display", () => {
  it.each([
    ["", ""],
    ["2", "2"],
    ["234", "234"],
    ["2345", "234 5"],
    ["234567", "234 567"],
    ["2345678", "234 567 8"],
    ["2345677890", "234 567 7890"],
    ["074 822 7664", "074 822 7664"],
    ["(074) 822-7664", "074 822 7664"],
    ["+27748227664", "074 822 7664"],
    ["+27 074 822 7664", "074 822 7664"],
  ])("formats %s as %s", (value, expected) => {
    expect(formatPhoneNumberDisplay(value)).toBe(expected);
  });

  it("keeps formatted input compatible with raw form values and API conversion", () => {
    const value = normalizePhoneNumberInput("074 822 7664");
    expect(value).toBe("0748227664");
    expect(isValidLocalPhoneNumber(value)).toBe(true);
    expect(toSouthAfricaApiPhoneNumber(value)).toBe("+27748227664");
  });

  it("normalizes pasted country codes before displaying local input", () => {
    expect(formatPhoneNumberDisplay(normalizePhoneNumberInput("+27 074 822 7664"))).toBe("074 822 7664");
  });
});