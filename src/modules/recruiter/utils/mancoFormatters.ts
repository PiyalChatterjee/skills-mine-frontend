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
