import { useEffect, useState } from "react";

type CandidateFilterValues<FilterKey extends string> = Record<FilterKey, string[]>;

const createEmptyFilterValues = <FilterKey extends string>(
  filterKeys: readonly FilterKey[],
): CandidateFilterValues<FilterKey> =>
  filterKeys.reduce<CandidateFilterValues<FilterKey>>((filters, key) => {
    filters[key] = [];
    return filters;
  }, {} as CandidateFilterValues<FilterKey>);

export const useCandidateFilters = <FilterKey extends string>(
  filterKeys: readonly FilterKey[],
  resetSignal: boolean,
) => {
  const [selectedFilters, setSelectedFilters] = useState<CandidateFilterValues<FilterKey>>(
    () => createEmptyFilterValues(filterKeys),
  );

  useEffect(() => {
    if (resetSignal) {
      setSelectedFilters(createEmptyFilterValues(filterKeys));
    }
  }, [filterKeys, resetSignal]);

  const setFilterValues = (filterKey: FilterKey, values: string[]) => {
    setSelectedFilters((current) => ({ ...current, [filterKey]: values }));
  };

  const removeFilterValue = (filterKey: FilterKey, value: string) => {
    setSelectedFilters((current) => ({
      ...current,
      [filterKey]: current[filterKey].filter((item) => item !== value),
    }));
  };

  const hasSelectedFilters = filterKeys.some((key) => selectedFilters[key].length > 0);

  return {
    hasSelectedFilters,
    removeFilterValue,
    selectedFilters,
    setFilterValues,
  };
};