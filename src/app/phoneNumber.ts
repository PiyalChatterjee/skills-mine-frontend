import { z } from "zod";

export const PHONE_NUMBER_FORMAT_MESSAGE =
  "Enter a valid 10-digit phone number";

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
  /^\d{10}$/.test(value.trim()) && /[1-9]/.test(value.trim());

export const localPhoneNumberSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidLocalPhoneNumber, PHONE_NUMBER_FORMAT_MESSAGE);

// Blank is allowed since this backs optional "alternate contact" fields.
export const optionalLocalPhoneNumberSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || isValidLocalPhoneNumber(value), PHONE_NUMBER_FORMAT_MESSAGE);

export const toSouthAfricaApiPhoneNumber = (value: string) => {
  let digits = digitsOnly(value);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("27") && digits.length > 10) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 10);

  if (digits.length === 10 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `+27${digits}`;
};

export const fromSouthAfricaApiPhoneNumber = (value: string) => {
  let digits = digitsOnly(value);

  // Remove the country code without adding a local prefix to the field value.
  if (digits.startsWith("27") && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};
