import type { LowPerformanceAlert } from "@/services/api/mancoApi";

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

export const formatAlertIssue = (alert: LowPerformanceAlert): string => {
  switch (alert.metric) {
    case "enhancedConversionRate":
      return `Low conversion rate (${alert.actualValue}%)`;
    case "placementRate":
      return `Low placement rate (${alert.actualValue}%)`;
    case "applicationsCount":
      return `Low applications count (${alert.actualValue})`;
    default:
      return `Low average candidates per role (${alert.actualValue})`;
  }
};

export const formatAlertMetric = (metric: string): string => {
  switch (metric) {
    case "enhancedConversionRate":
      return "Conversion Rate";
    case "placementRate":
      return "Placement Rate";
    case "applicationsCount":
      return "Applications Count";
    default:
      return "Average Candidates per Role";
  }
};