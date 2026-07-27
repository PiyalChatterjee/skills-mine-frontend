import { useMemo } from "react";
import { useOpportunities, type Opportunity } from "@/modules/public/hooks/useOpportunities";

const filterByTitle = (items: Opportunity[], normalizedSearchTerm: string) => {
  const term = normalizedSearchTerm.toLowerCase();
  return items.filter((job) => job.title.toLowerCase().includes(term));
};

type UseOpportunitiesSearchOptions = {
  normalizedSearchTerm: string;
  shouldFilter: boolean;
  shouldUseDebouncedQuery: boolean;
  debouncedSearchTerm: string;
};

export const useOpportunitiesSearch = ({
  normalizedSearchTerm,
  shouldFilter,
  shouldUseDebouncedQuery,
  debouncedSearchTerm,
}: UseOpportunitiesSearchOptions) => {
  const activeSearchQuery = shouldUseDebouncedQuery
    ? debouncedSearchTerm
    : undefined;

  const {
    data: allOpportunities,
    isError: isOpportunitiesError,
    error: opportunitiesError,
  } = useOpportunities(activeSearchQuery, true);

  const instantFilteredOpportunities = useMemo(() => {
    const source = allOpportunities ?? [];

    if (!shouldFilter) {
      return source;
    }

    return filterByTitle(source, normalizedSearchTerm);
  }, [allOpportunities, normalizedSearchTerm, shouldFilter]);

  const visibleOpportunities = instantFilteredOpportunities;

  return {
    allOpportunities,
    visibleOpportunities,
    isOpportunitiesError,
    opportunitiesError,
  };
};
