import { useMemo } from "react";
import {
  useJobs,
  type Job,
  type JobsResponse,
} from "@/modules/public/hooks/useJobs";
import { DEFAULT_JOBS_PAGE_SIZE } from "../constants/landingPage.constants";

const EMPTY_PAGES: JobsResponse[] = [];

type UseJobsSearchOptions = {
  normalizedSearchTerm: string;
  shouldFilter: boolean;
  shouldUseDebouncedQuery: boolean;
  debouncedSearchTerm: string;
  enabled?: boolean;
  pageSize?: number;
};

export const useJobsSearch = ({
  normalizedSearchTerm,
  shouldFilter,
  shouldUseDebouncedQuery,
  debouncedSearchTerm,
  enabled = true,
  pageSize = DEFAULT_JOBS_PAGE_SIZE,
}: UseJobsSearchOptions) => {
  const activeSearchQuery = shouldUseDebouncedQuery
    ? debouncedSearchTerm
    : undefined;

  const jobsQuery = useJobs(activeSearchQuery, enabled, pageSize);

  const pages = jobsQuery.data?.pages ?? EMPTY_PAGES;

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
    if (!shouldFilter || shouldUseDebouncedQuery) {
      return allJobs;
    }

    const term = normalizedSearchTerm.toLowerCase();
    return allJobs.filter((job) => job.title.toLowerCase().includes(term));
  }, [allJobs, normalizedSearchTerm, shouldFilter, shouldUseDebouncedQuery]);

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
