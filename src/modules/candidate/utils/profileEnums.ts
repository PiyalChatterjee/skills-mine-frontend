const PREFERRED_LOCATION_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
  ON_SITE: "On-site",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATELY: "Immediately",
  "2_WEEKS": "2 weeks",
  "1_MONTH": "1 month",
  "2_MONTHS": "2 months",
  "3_MONTHS": "3 months",
  NOTICE_REQUIRED: "Notice required",
};

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

export const toPreferredLocationLabel = (value?: string | null): string => {
  const normalized = toEnum(value);
  return PREFERRED_LOCATION_LABELS[normalized] ?? value?.trim() ?? "";
};

export const toPreferredLocationEnum = (value?: string | null): string => {
  const normalized = toEnum(value);
  return normalized === "ON_SITE" ? "ONSITE" : normalized;
};

export const toAvailabilityLabel = (value?: string | null): string => {
  const normalized = toEnum(value);
  return AVAILABILITY_LABELS[normalized] ?? value?.trim() ?? "";
};

export const toAvailabilityEnum = (value?: string | null): string =>
  toEnum(value);

export const toEmploymentTypeLabel = (value?: string | null): string => {
  const normalized = toEnum(value);
  return EMPLOYMENT_TYPE_LABELS[normalized] ?? value?.trim() ?? "";
};

export const toEmploymentTypeEnum = (value?: string | null): string => {
  const normalized = toEnum(value);
  return normalized === "PERMANENT" ? "FULL_TIME" : normalized;
};