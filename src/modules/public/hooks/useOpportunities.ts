import { useStandardQuery } from "@/hooks/useStandardQuery";
import { opportunitiesApi } from "@/services/api/opportunitiesApi";
import type { Opportunity } from "@/types";

export type { Opportunity };

export const useOpportunities = () =>
  useStandardQuery<Opportunity[]>(
    ["public", "opportunities"],
    () => opportunitiesApi.list(),
    {
      staleTime: 60_000,
      retry: 1,
    },
  );
