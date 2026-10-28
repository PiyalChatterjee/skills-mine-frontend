import { mancoApiClient } from "./axios";
import { apiEndpoints } from "./endpoints";

export type ExcoDashboard = {
  metricDate: string;
  strategicKpis: {
    placementsYtd: number;
    avgContractValue: number | null;
    revenueEarnedYtd: number | null;
    revenueEarnedMtd: number | null;
  };
  topHiringIndustries: {
    industryName: string;
    placementCount: number;
  }[];
  riskIndicators: {
    clientChurnRate: number | null;
    atRiskClientCount: number | null;
  };
  activeClientsCount: number | null;
  placementVelocity: number | null;
  avgTimeToFillDays: number | null;
  offerAcceptanceRate: number | null;
};

export const excoApi = {
  getDashboard(metricDate?: string) {
    return mancoApiClient
      .get<ExcoDashboard>(apiEndpoints.exco.dashboard, {
        params: metricDate ? { metricDate } : undefined,
      })
      .then((response) => response.data);
  },
};
