import { useStandardQuery } from "@/hooks/useStandardQuery";
import { opportunitiesApi } from "@/services/api/opportunitiesApi";
import type { Opportunity } from "@/types";

export type { Opportunity };

export const useOpportunities = (searchQuery?: string, enabled = true) =>
  useStandardQuery<Opportunity[]>(
    ["public", "opportunities", searchQuery ?? ""],
    () => opportunitiesApi.list(searchQuery),
    {
      enabled,
      staleTime: 60_000,
      retry: 1,
      placeholderData: (previousData) => previousData,
    },
  );
