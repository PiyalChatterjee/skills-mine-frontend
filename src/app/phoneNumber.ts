import { z } from "zod";

export const PHONE_NUMBER_FORMAT_MESSAGE =
  "Phone number must be 9 or 10 digits";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const normalizePhoneNumberInput = (value: string) => {
  let digits = digitsOnly(value);

  // If a +27 number is pasted, convert to local-number entry format.
  if (digits.startsWith("27") && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

export const isValidLocalPhoneNumber = (value: string) =>
  /^\d{9,10}$/.test(value.trim());

export const localPhoneNumberSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidLocalPhoneNumber, PHONE_NUMBER_FORMAT_MESSAGE);

export const toSouthAfricaApiPhoneNumber = (value: string) => {
  let digits = digitsOnly(value);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("27") && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `+27${digits}`;
};

export const fromSouthAfricaApiPhoneNumber = (value: string) =>
  normalizePhoneNumberInput(value);
