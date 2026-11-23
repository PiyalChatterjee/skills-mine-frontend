export const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATELY: "None/Immediate",
  "2_WEEKS": "2 weeks",
  "1_MONTH": "1 month",
  "2_MONTHS": "2 months",
  "3_MONTHS": "3 months",
  "30_DAYS": "30 days",
};

export const AVAILABILITY_OPTIONS = Object.values(AVAILABILITY_LABELS);

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  TEMPORARY: "TEMPORARY",
  INTERNSHIP: "INTERNSHIP",
  FREELANCE: "FREELANCE",
  PERMANENT: "FULL_TIME",
};

const toEnum = (value?: string | null): string =>
  (value?.trim() ?? "").toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");

export const toPreferredLocationLabel = (
  value?: string | null,
  options: readonly string[] = [],
): string => {
  const normalize = (option: string) =>
    toPreferredLocationEnum(option).replace(/[()]/g, "");
  const currentValue = value?.trim() ?? "";
  return options.find((option) => normalize(option) === normalize(currentValue)) ?? currentValue;
};

export const toPreferredLocationEnum = (value?: string | null): string => {
  const normalized = toEnum(value);
  return normalized === "ON_SITE" ? "ONSITE" : normalized;
};

export const toAvailabilityEnum = (value?: string | null): string => {
  const normalized = toEnum(value);
  if (
    normalized === "NONE/IMMEDIATE" ||
    normalized === "NONE" ||
    normalized === "IMMEDIATE"
  ) {
    return "IMMEDIATELY";
  }
  return normalized;
};

export const toAvailabilityLabel = (value?: string | null): string => {
  const normalized = toAvailabilityEnum(value);
  return AVAILABILITY_LABELS[normalized] ?? value?.trim() ?? "";
};

export const toEmploymentTypeLabel = (value?: string | null): string => {
  const normalized = toEnum(value);
  return EMPLOYMENT_TYPE_LABELS[normalized] ?? value?.trim() ?? "";
};

export const toEmploymentTypeEnum = (value?: string | null): string => {
  const normalized = toEnum(value);
  return normalized === "PERMANENT" ? "FULL_TIME" : normalized;
};
