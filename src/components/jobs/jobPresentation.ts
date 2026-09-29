type JobPresentationSource = {
  industry?: string;
  location?: string;
  employmentType?: string;
};

export const getJobCity = (location?: string, fallback = "Unknown") => {
  // The API returns a comma-separated location label; cards display only its city segment.
  if (!location) return fallback;
  const [city] = location.split(",");
  return city?.trim() || fallback;
};

export const getJobTags = ({
  industry,
  location,
  employmentType,
}: JobPresentationSource): string[] =>
  [industry, getJobCity(location), employmentType].filter(
    (value): value is string => Boolean(value),
  );