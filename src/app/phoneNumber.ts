import { z } from "zod";
import type { ChangeEvent, KeyboardEvent } from "react";

export const PHONE_NUMBER_FORMAT_MESSAGE =
  "Enter a valid 10-digit phone number";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const formatPhoneNumberDisplay = (value: string) => {
  let digits = digitsOnly(value);
  if (value.trim().startsWith("+27") && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(2);
    if (digits.length === 9) digits = `0${digits}`;
  }
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");
};

const hasCountryCodePrefix = (value: string, isPaste: boolean) => {
  const digits = digitsOnly(value);
  // Only strip "27" for pasted values or explicit "+27"; when typing, a local
  // number may legitimately start with 27 and extra digits must be dropped.
  return digits.startsWith("27") && digits.length > 10 && (isPaste || value.trim().startsWith("+"));
};

export const normalizePhoneNumberInput = (value: string, isPaste = false) => {
  let digits = digitsOnly(value);

  // If a +27 number is pasted, convert to local-number entry format.
  if (hasCountryCodePrefix(value, isPaste)) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

export const getPhoneNumberInputProps = (value: string, onChange: (value: string) => void) => ({
  type: "tel" as const,
  value: formatPhoneNumberDisplay(value),
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = event.target;
    const cursor = input.selectionStart ?? input.value.length;
    const isPaste = (event.nativeEvent as InputEvent | undefined)?.inputType === "insertFromPaste";
    const countryCodeLength = hasCountryCodePrefix(input.value, isPaste) ? 2 : 0;
    const digitsBeforeCursor = Math.max(0, digitsOnly(input.value.slice(0, cursor)).length - countryCodeLength);
    const normalized = normalizePhoneNumberInput(input.value, isPaste);
    const formatted = formatPhoneNumberDisplay(normalized);
    const nextCursor = Math.min(formatted.length, digitsBeforeCursor + (digitsBeforeCursor > 3 ? 1 : 0) + (digitsBeforeCursor > 6 ? 1 : 0));
    input.value = formatted;
    input.setSelectionRange(nextCursor, nextCursor);
    onChange(normalized);
  },
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    const input = event.target as HTMLInputElement;
    const cursor = input.selectionStart;
    if (cursor === null || cursor === undefined || cursor !== input.selectionEnd) return;
    if (event.key === "Backspace" && input.value[cursor - 1] === " ") {
      input.setSelectionRange(cursor - 1, cursor - 1);
    } else if (event.key === "Delete" && input.value[cursor] === " ") {
      input.setSelectionRange(cursor + 1, cursor + 1);
    }
  },
});

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
