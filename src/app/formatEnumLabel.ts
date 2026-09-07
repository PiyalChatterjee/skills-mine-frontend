const LABEL_OVERRIDES: Record<string, string> = {
  ONSITE: "On-site",
};

const DISPLAY_ACRONYMS = new Set(["AI", "CRM", "CV", "EE", "ID"]);

export const formatEnumLabel = (value?: string | null): string => {
  const normalized = value?.trim() ?? "";
  if (!normalized) return "";
  if (!/^[A-Z0-9_]+$/.test(normalized)) return normalized;
  if (LABEL_OVERRIDES[normalized]) return LABEL_OVERRIDES[normalized];

  return normalized
    .split("_")
    .filter(Boolean)
    .map((word) => DISPLAY_ACRONYMS.has(word)
      ? word
      : word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};