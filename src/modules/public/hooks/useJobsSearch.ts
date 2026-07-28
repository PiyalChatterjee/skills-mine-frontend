import { useMemo } from "react";
import { useJobs, type Job } from "@/modules/public/hooks/useJobs";

const filterByTitle = (items: Job[], normalizedSearchTerm: string) => {
  const term = normalizedSearchTerm.toLowerCase();
  return items.filter((job) => job.title.toLowerCase().includes(term));
};

type UseJobsSearchOptions = {
  normalizedSearchTerm: string;
  shouldFilter: boolean;
  shouldUseDebouncedQuery: boolean;
  debouncedSearchTerm: string;
};

export const useJobsSearch = ({
  normalizedSearchTerm,
  shouldFilter,
  shouldUseDebouncedQuery,
  debouncedSearchTerm,
}: UseJobsSearchOptions) => {
  const activeSearchQuery = shouldUseDebouncedQuery
    ? debouncedSearchTerm
    : undefined;

  const {
    data: jobsResponse,
    isError: isJobsError,
    error: jobsError,
  } = useJobs(activeSearchQuery, true);

  const allJobs = jobsResponse?.jobs ?? [];

  const visibleJobs = useMemo(() => {
    if (!shouldFilter) {
      return allJobs;
    }

    return filterByTitle(allJobs, normalizedSearchTerm);
  }, [allJobs, normalizedSearchTerm, shouldFilter]);

  return {
    jobsResponse,
    allJobs,
    visibleJobs,
    isJobsError,
    jobsError,
  };
};
