export const formatRevenue = (value?: number | null): string => {
  if (value == null) {
    return "-";
  }

  const formatted = new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/,/g, " ");

  return `R${formatted}`;
};

export const formatPercentage = (value?: number | null): string =>
  value == null ? "-" : `${value}%`;

export const formatName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s'\u2019-])(\p{L})/gu,
      (_match, separator: string, letter: string) =>
        `${separator}${letter.toUpperCase()}`,
    );
