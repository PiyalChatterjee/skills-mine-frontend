import { useIndustryOptions } from "@/modules/candidate/hooks/useIndustryOptions";
import { useLocationOptions } from "@/modules/candidate/hooks/useLocationOptions";
import { PROFILE_SELECT_OPTIONS } from "@/modules/candidate/pages/profileForm.config";
import { useCandidateFilters } from "./useCandidateFilters";

type FilterOption = {
  value: string;
  label: string;
};

export const datePostedOptions = [
  { value: "TODAY", label: "Today" },
  { value: "LAST_3_DAYS", label: "Last 3 days" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_14_DAYS", label: "Last 14 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
];

export const jobTypeOptions = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const toFilterOptions = (options: readonly string[]): FilterOption[] =>
  options.map((option) => ({ value: option, label: option }));

const filterKeys = ["datePosted", "industries", "locations", "jobTypes"] as const;

export const useOpportunitySearchModalState = (open: boolean) => {
  const {
    hasSelectedFilters,
    removeFilterValue,
    selectedFilters,
    setFilterValues,
  } = useCandidateFilters(filterKeys, open);
  const industryOptions = useIndustryOptions(PROFILE_SELECT_OPTIONS.targetedIndustries);
  const readableIndustryOptions = toFilterOptions(industryOptions);
  const locationOptions = useLocationOptions(PROFILE_SELECT_OPTIONS.preferredLocations);
  const readableLocationOptions = toFilterOptions(locationOptions);

  const getDatePostedLabel = (value: string) =>
    datePostedOptions.find((option) => option.value === value)?.label ?? value;

  const getJobTypeLabel = (value: string) =>
    jobTypeOptions.find((option) => option.value === value)?.label ?? value;

  const removeDatePostedFilter = (datePosted: string) => {
    removeFilterValue("datePosted", datePosted);
  };

  const removeIndustryFilter = (industry: string) => {
    removeFilterValue("industries", industry);
  };

  const removeLocationFilter = (location: string) => {
    removeFilterValue("locations", location);
  };

  const removeJobTypeFilter = (jobType: string) => {
    removeFilterValue("jobTypes", jobType);
  };

  return {
    getDatePostedLabel,
    getJobTypeLabel,
    hasSelectedFilters,
    readableIndustryOptions,
    readableLocationOptions,
    removeDatePostedFilter,
    removeIndustryFilter,
    removeJobTypeFilter,
    removeLocationFilter,
    selectedDatePosted: selectedFilters.datePosted,
    selectedIndustries: selectedFilters.industries,
    selectedJobTypes: selectedFilters.jobTypes,
    selectedLocations: selectedFilters.locations,
    setSelectedDatePosted: (values: string[]) => setFilterValues("datePosted", values),
    setSelectedIndustries: (values: string[]) => setFilterValues("industries", values),
    setSelectedJobTypes: (values: string[]) => setFilterValues("jobTypes", values),
    setSelectedLocations: (values: string[]) => setFilterValues("locations", values),
  };
};