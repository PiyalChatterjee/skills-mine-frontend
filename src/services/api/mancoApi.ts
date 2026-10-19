import { mancoApiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";

export type MancoSortBy =
  | "MTD_PLACEMENTS"
  | "ACTIVE_ROLES"
  | "TOTAL_CANDIDATES"
  | "CONVERSION_RATE"
  | "ALPHABETICAL";

export type MancoSortDirection = "ASC" | "DESC";

export type MancoRecruiterListParams = {
  query?: string;
  sortBy: MancoSortBy;
  sortDirection: MancoSortDirection;
  page: number;
  pageSize: number;
};

export type MancoRecruiterMetrics = {
  mtdPlacements: number;
  activeRoles: number;
  totalCandidates: number;
  revenueEarnedMtd?: number | null;
  revenueEarnedYtd?: number | null;
  conversionRate?: number | null;
};

export type MancoRecruiter = {
  recruiterId: string;
  staffId: string;
  fullName: string;
  roleName: string;
  metrics: MancoRecruiterMetrics;
  calculatedOn: string;
};

export type MancoRecruiterPage = {
  asOfDate: string;
  page: number;
  pageSize: number;
  totalItems: number;
  items: MancoRecruiter[];
};

export type LowPerformanceAlert = {
  alertId: string;
  recruiterId: string;
  fullName: string;
  alertType: string;
  thresholdValue: number;
  actualValue: number;
  metric: string;
  issue: string;
  generatedAt: string;
  recommendedActions?: string[];
};

export type LowPerformanceAlertPage = {
  activeAlertCount?: number;
  totalCount?: number;
  calculationMonth?: string;
  items: LowPerformanceAlert[];
};

export type ResolveLowPerformanceAlertResponse = {
  alertId: string;
  alertStatus: string;
  resolvedAt: string;
};

export type MancoPipelineDistribution = {
  inbound: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
  filled: number;
  totalPipeline: number;
};

export type MancoRecruiterDetail = {
  recruiter: Pick<MancoRecruiter, "recruiterId" | "staffId" | "fullName" | "roleName">;
  calculatedOn: string;
  metrics: MancoRecruiterMetrics;
  pipelineDistribution: MancoPipelineDistribution;
  performanceSummary: {
    averageCandidatesPerRole: number | null;
  };
};

export const mancoApi = {
  listRecruiters(params: MancoRecruiterListParams) {
    return mancoApiClient
      .get<MancoRecruiterPage>(apiEndpoints.manco.dashboardRecruiters, { params })
      .then((response) => response.data);
  },

  listLowPerformingRecruiters() {
    return mancoApiClient
      .get<LowPerformanceAlertPage>(apiEndpoints.manco.lowPerformingRecruiters)
      .then((response) => response.data);
  },

  resolveLowPerformingAlert(alertId: string) {
    return mancoApiClient
      .patch<ResolveLowPerformanceAlertResponse>(
        resolveEndpoint(apiEndpoints.manco.resolveLowPerformingAlert, {
          alertId,
        }),
      )
      .then((response) => response.data);
  },

  getRecruiterPerformanceDetail(recruiterId: string) {
    return mancoApiClient
      .get<MancoRecruiterDetail>(
        resolveEndpoint(apiEndpoints.manco.recruiterDetails, { recruiterId }),
      )
      .then((response) => response.data);
  },
};