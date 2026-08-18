import { useMemo } from "react";
import { useJobs, type Job } from "@/modules/public/hooks/useJobs";
import { DEFAULT_JOBS_PAGE_SIZE } from "../constants/landingPage.constants";

const filterByTitle = (items: Job[], normalizedSearchTerm: string) => {
  const term = normalizedSearchTerm.toLowerCase();
  return items.filter((job) => job.title.toLowerCase().includes(term));
};

type UseJobsSearchOptions = {
  normalizedSearchTerm: string;
  shouldFilter: boolean;
  shouldUseDebouncedQuery: boolean;
  debouncedSearchTerm: string;
  enabled?: boolean;
};

export const useJobsSearch = ({
  normalizedSearchTerm,
  shouldFilter,
  shouldUseDebouncedQuery,
  debouncedSearchTerm,
  enabled = true,
}: UseJobsSearchOptions) => {
  const activeSearchQuery = shouldUseDebouncedQuery
    ? debouncedSearchTerm
    : undefined;

  const jobsQuery = useJobs(activeSearchQuery, enabled, DEFAULT_JOBS_PAGE_SIZE);

  const pages = jobsQuery.data?.pages ?? [];

  const allJobs = useMemo(() => {
    const seenJobIds = new Set<string>();
    const mergedJobs: Job[] = [];

    pages.forEach((page) => {
      if (!page || !Array.isArray(page.jobs)) {
        return;
      }

      page.jobs.forEach((job) => {
        if (seenJobIds.has(job.jobId)) {
          return;
        }

        seenJobIds.add(job.jobId);
        mergedJobs.push(job);
      });
    });

    return mergedJobs;
  }, [pages]);

  const visibleJobs = useMemo(() => {
    if (!shouldFilter) {
      return allJobs;
    }

    return filterByTitle(allJobs, normalizedSearchTerm);
  }, [allJobs, normalizedSearchTerm, shouldFilter]);

  return {
    jobsResponse: pages.at(-1),
    allJobs,
    visibleJobs,
    isJobsError: jobsQuery.isError,
    jobsError: jobsQuery.error,
    hasNextPage: Boolean(jobsQuery.hasNextPage),
    isFetchingNextPage: jobsQuery.isFetchingNextPage,
    fetchNextPage: jobsQuery.fetchNextPage,
    isJobsLoading: jobsQuery.isLoading,
  };
};
