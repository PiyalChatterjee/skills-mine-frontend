import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useSearchQueryState } from "@/hooks/useSearchQueryState";
import { useJobsSearch } from "@/modules/public/hooks/useJobsSearch";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { selectRecommendedJobIds } from "@/store/selectors";
import { setSelectedJobId } from "@/store/slices/candidateSlice";
import type { Job, RecommendedJob } from "@/types";
import { getApplicationStatusLabel } from "../utils/applicationStatus";
import { useAppliedJobIds } from "./useAppliedJobIds";
import {
  useRecommendedPositionsQuery,
  useSavedJobsQuery,
} from "./useCandidateQueries";
import { useOptimisticSaveJob } from "./useOptimisticSaveJob";

export type JobsFeedMode = "latest" | "saved" | "recommended";

type JobsFeedModeConfig = {
  title: string;
  route: string;
  showSearch: boolean;
};

export const JOBS_FEED_MODE_CONFIG = {
  latest: {
    title: "Latest Opportunities",
    route: ROUTE_PATHS.latestJobs,
    showSearch: true,
  },
  saved: {
    title: "Saved Jobs",
    route: ROUTE_PATHS.savedJobs,
    showSearch: false,
  },
  recommended: {
    title: "Recommended Jobs",
    route: ROUTE_PATHS.recommendedJobs,
    showSearch: true,
  },
} as const satisfies Record<JobsFeedMode, JobsFeedModeConfig>;

type JobsFeedJob = Job & { matchScore?: number };

type JobsFeedCandidateJob = RecommendedJob & {
  employmentType?: string;
  savedAt?: string;
};

export type JobsFeedCard = {
  job: JobsFeedJob;
  jobId: string;
  title: string;
  description: string;
  tags: string[];
  matchScore?: number;
  applicationStatus?: string;
  applicationStatusKey?: string;
  isSaved: boolean;
  isSaving: boolean;
  saveLabel: string;
};

const toCityFromLocation = (location: string) => {
  const [city] = location.split(",");
  return city?.trim() || "Unknown";
};

const toContractJob = (job: JobsFeedCandidateJob): JobsFeedJob => ({
  ...job,
  industry: job.industry,
  employmentType: job.employmentType ?? "Permanent",
  status: "Open",
  applicationCount: job.applicationCount ?? 0,
  requirements: job.requirements ?? [],
  responsibilities: job.responsibilities ?? [],
});

export const useJobsFeedViewModel = (mode: JobsFeedMode) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { savedJobIds, isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const { applicationStages } = useAppliedJobIds();
  const isSavedOnlyMode = mode === "saved";
  const isRecommendedOnlyMode = mode === "recommended";
  const isLatestMode = !isSavedOnlyMode && !isRecommendedOnlyMode;
  const modeConfig = JOBS_FEED_MODE_CONFIG[mode];
  const recommendedJobIds = useSelector(selectRecommendedJobIds);
  const savedJobsQuery = useSavedJobsQuery(isSavedOnlyMode);
  const recommendedPositionsQuery = useRecommendedPositionsQuery(isRecommendedOnlyMode);

  const {
    inputValue: searchInputValue,
    normalizedValue: normalizedSearchTerm,
    debouncedValue: debouncedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    handleInputChange: handleSearchChange,
    clear: handleClearSearch,
  } = useSearchQueryState({
    minCharacters: 3,
    debounceMs: 250,
  });

  const {
    allJobs,
    visibleJobs,
    isJobsError,
    jobsError,
    isJobsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useJobsSearch({
    normalizedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    debouncedSearchTerm,
    enabled: isLatestMode,
  });

  const jobsLoadTriggerRef = useInfiniteScrollTrigger({
    enabled: isLatestMode,
    hasNextPage,
    isFetchingNextPage,
    isError: isJobsError,
    itemCount: visibleJobs.length,
    onLoadMore: fetchNextPage,
  });

  const jobsWithMatch = useMemo(() => {
    if (isSavedOnlyMode) {
      return (savedJobsQuery.data?.jobs ?? []).map(toContractJob);
    }

    if (isRecommendedOnlyMode) {
      return (recommendedPositionsQuery.data?.jobs ?? []).map(toContractJob);
    }

    return visibleJobs.map((job) => ({
      ...job,
      matchScore: undefined,
    }));
  }, [isRecommendedOnlyMode, isSavedOnlyMode, recommendedPositionsQuery.data, savedJobsQuery.data, visibleJobs]);

  const feedJobs = useMemo(() => {
    if ((isSavedOnlyMode || isRecommendedOnlyMode) && shouldFilterOpportunities) {
      const term = normalizedSearchTerm.toLowerCase();
      return jobsWithMatch.filter((job) => job.title.toLowerCase().includes(term));
    }

    return jobsWithMatch;
  }, [
    isRecommendedOnlyMode,
    isSavedOnlyMode,
    jobsWithMatch,
    normalizedSearchTerm,
    shouldFilterOpportunities,
  ]);

  const jobCards = useMemo(
    () =>
      feedJobs.map((job) => {
        const isSaved = isJobSaved(job.jobId);
        const applicationStage = applicationStages.get(job.jobId);

        return {
          job,
          jobId: job.jobId,
          title: job.title,
          description: job.description ?? "",
          tags: [job.industry, toCityFromLocation(job.location ?? ""), job.employmentType].filter(Boolean) as string[],
          matchScore: isRecommendedOnlyMode ? job.matchScore : undefined,
          applicationStatus: getApplicationStatusLabel(applicationStage),
          applicationStatusKey: applicationStage?.trim().toLowerCase(),
          isSaved,
          isSaving: isJobSaving(job.jobId),
          saveLabel: isSaved ? `Unsave ${job.title}` : `Save ${job.title}`,
        };
      }),
    [applicationStages, feedJobs, isJobSaved, isJobSaving, isRecommendedOnlyMode],
  );

  const getEmptyMessage = () => {
    if (isSavedOnlyMode || isRecommendedOnlyMode) {
      const modeLabel = isSavedOnlyMode ? "saved" : "recommended";
      const sourceIds = isSavedOnlyMode ? savedJobIds : recommendedJobIds;

      if (sourceIds.size === 0) {
        return `You have no ${modeLabel} jobs yet.`;
      }

      if (shouldFilterOpportunities) {
        return `No ${modeLabel} jobs found for your search.`;
      }

      return `No ${modeLabel} jobs available right now.`;
    }

    if (shouldFilterOpportunities) {
      return "No jobs found for your search.";
    }

    if (allJobs.length === 0) {
      return "No jobs available right now.";
    }

    return "No matching jobs found.";
  };

  const handleBack = () => {
    navigate(ROUTE_PATHS.candidateDashboard);
  };

  const handleViewJob = (job: JobsFeedJob) => {
    dispatch(setSelectedJobId(job.jobId));
    navigate(ROUTE_PATHS.jobDetails.replace(":jobId", job.jobId), {
      state: { job, from: modeConfig.route },
    });
  };

  const handleToggleSave = (jobId: string) => {
    void toggleJobSaved(jobId);
  };

  return {
    emptyMessage: getEmptyMessage(),
    handleBack,
    handleClearSearch,
    handleSearchChange,
    handleToggleSave,
    handleViewJob,
    hasJobs: jobCards.length > 0,
    hasNextPage,
    isError: isJobsError || savedJobsQuery.isError || recommendedPositionsQuery.isError,
    isFetchingNextPage,
    isLatestMode,
    isLoading: isJobsLoading || savedJobsQuery.isLoading || recommendedPositionsQuery.isLoading,
    isRecommendedOnlyMode,
    isSavedOnlyMode,
    jobCards,
    jobsLoadTriggerRef,
    loadMoreMessage: isFetchingNextPage ? "Loading more opportunities..." : "Scroll to load more opportunities",
    loadErrorMessage: jobsError?.message || "Failed to load jobs.",
    modeConfig,
    searchInputValue,
  };
};