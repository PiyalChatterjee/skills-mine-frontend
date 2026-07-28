import { useStandardQuery } from "@/hooks/useStandardQuery";
import { jobsApi } from "@/services/api/jobsApi";
import type { Job, JobsResponse } from "@/types";

export type { Job, JobsResponse };

export const useJobs = (searchQuery?: string, enabled = true) =>
  useStandardQuery<JobsResponse>(
    ["public", "jobs", searchQuery ?? ""],
    () => jobsApi.list(searchQuery),
    {
      enabled,
      staleTime: 60_000,
      retry: 1,
      placeholderData: (previousData) => previousData,
    },
  );
