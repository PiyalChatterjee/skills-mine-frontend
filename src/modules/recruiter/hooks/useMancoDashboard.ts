import { useState, type ChangeEvent } from "react";
import {
  useGetMancoLowPerformingRecruitersQuery,
  useGetMancoRecruiterDetailQuery,
  useGetMancoRecruitersQuery,
  useResolveMancoLowPerformingAlertMutation,
} from "@/store/api/apiSlice";
import type {
  LowPerformanceAlert,
  MancoSortBy,
} from "@/services/api/mancoApi";

export type MancoSortKey =
  | "mtdPlacements"
  | "activeRoles"
  | "totalCandidates"
  | "conversionRate"
  | "alphabetical";

export const MANCO_SORT_OPTIONS: {
  key: MancoSortKey;
  label: string;
  sortBy: MancoSortBy;
}[] = [
  { key: "mtdPlacements", label: "MTD Placements", sortBy: "MTD_PLACEMENTS" },
  { key: "activeRoles", label: "Active Roles", sortBy: "ACTIVE_ROLES" },
  {
    key: "totalCandidates",
    label: "Total Candidates",
    sortBy: "TOTAL_CANDIDATES",
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    sortBy: "CONVERSION_RATE",
  },
  { key: "alphabetical", label: "Alphabetical", sortBy: "ALPHABETICAL" },
];

export const useMancoAttention = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAlert, setSelectedAlert] =
    useState<LowPerformanceAlert | null>(null);
  const alertQuery = useGetMancoLowPerformingRecruitersQuery();
  const [resolveAlert, resolveAlertState] =
    useResolveMancoLowPerformingAlertMutation();

  const alertCount = alertQuery.isLoading
    ? "..."
    : (alertQuery.data?.activeAlertCount ?? alertQuery.data?.totalCount ?? "-");

  const resolveSelectedAlert = () => {
    if (!selectedAlert) {
      return;
    }

    void resolveAlert(selectedAlert.alertId)
      .unwrap()
      .then(
        () => setSelectedAlert(null),
        () => undefined,
      );
  };

  return {
    alertCount,
    alerts: alertQuery.data?.items ?? [],
    hasLoadedAlerts: alertQuery.data !== undefined,
    isLoading: alertQuery.isLoading,
    isError: alertQuery.isError,
    isExpanded,
    isResolving: resolveAlertState.isLoading,
    hasResolveError: resolveAlertState.isError,
    selectedAlert,
    closeAlert: () => setSelectedAlert(null),
    resolveSelectedAlert,
    selectAlert: setSelectedAlert,
    toggleExpanded: () => setIsExpanded((expanded) => !expanded),
  };
};

export const useMancoRecruiters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<MancoSortKey>("mtdPlacements");
  const activeSortOption =
    MANCO_SORT_OPTIONS.find((option) => option.key === activeSort) ??
    MANCO_SORT_OPTIONS[0];
  const recruiterQuery = useGetMancoRecruitersQuery({
    query: searchQuery.trim() || undefined,
    sortBy: activeSortOption.sortBy,
    sortDirection: activeSort === "alphabetical" ? "ASC" : "DESC",
    page: 1,
    pageSize: 100,
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (sortKey: MancoSortKey) => {
    setActiveSort(sortKey);
  };

  return {
    activeSort,
    handleSearchChange,
    handleSortChange,
    recruiters: recruiterQuery.data?.items ?? [],
    recruiterQuery,
    searchQuery,
  };
};

export const useMancoRecruiterDetail = (recruiterId: string, enabled = true) =>
  useGetMancoRecruiterDetailQuery(recruiterId, { skip: !enabled });
