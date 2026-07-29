import { useInfiniteQuery } from "@tanstack/react-query";
import { jobsApi } from "@/services/api/jobsApi";
import type { ApiError, Job, JobsResponse } from "@/types";

export type { Job, JobsResponse };

export const DEFAULT_JOBS_PAGE_SIZE = 6;

export const useJobs = (
  searchQuery?: string,
  enabled = true,
  pageSize = DEFAULT_JOBS_PAGE_SIZE,
) =>
  useInfiniteQuery<JobsResponse, ApiError>({
    queryKey: ["public", "jobs", searchQuery ?? "", pageSize],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      jobsApi.list(searchQuery, Number(pageParam), pageSize),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.jobs.length,
        0,
      );
      const resolvedTotal =
        typeof lastPage.total === "number" && lastPage.total >= 0
          ? lastPage.total
          : loadedCount;
      const responsePageSize =
        typeof lastPage.pageSize === "number" && lastPage.pageSize > 0
          ? lastPage.pageSize
          : pageSize;
      const currentPage =
        typeof lastPage.page === "number" && lastPage.page > 0
          ? lastPage.page
          : allPages.length;

      if (lastPage.jobs.length === 0) {
        return undefined;
      }

      if (resolvedTotal > 0 && loadedCount >= resolvedTotal) {
        return undefined;
      }

      if (lastPage.jobs.length < responsePageSize) {
        return undefined;
      }

      return currentPage + 1;
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
    meta: {
      handledError: true,
    },
  });
