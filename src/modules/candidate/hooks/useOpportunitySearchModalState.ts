import { useEffect, useState } from "react";
import { useIndustryOptions } from "@/modules/candidate/hooks/useIndustryOptions";
import { PROFILE_SELECT_OPTIONS } from "@/modules/candidate/pages/profileForm.config";

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

export const useOpportunitySearchModalState = (open: boolean) => {
  const [selectedDatePosted, setSelectedDatePosted] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const industryOptions = useIndustryOptions(PROFILE_SELECT_OPTIONS.targetedIndustries);
  const readableIndustryOptions = toFilterOptions(industryOptions);
  const readableLocationOptions = toFilterOptions(PROFILE_SELECT_OPTIONS.preferredLocations);

  const getDatePostedLabel = (value: string) =>
    datePostedOptions.find((option) => option.value === value)?.label ?? value;

  const getJobTypeLabel = (value: string) =>
    jobTypeOptions.find((option) => option.value === value)?.label ?? value;

  const removeDatePostedFilter = (datePosted: string) => {
    setSelectedDatePosted((current) => current.filter((item) => item !== datePosted));
  };

  const removeIndustryFilter = (industry: string) => {
    setSelectedIndustries((current) => current.filter((item) => item !== industry));
  };

  const removeLocationFilter = (location: string) => {
    setSelectedLocations((current) => current.filter((item) => item !== location));
  };

  const removeJobTypeFilter = (jobType: string) => {
    setSelectedJobTypes((current) => current.filter((item) => item !== jobType));
  };

  const hasSelectedFilters =
    selectedDatePosted.length > 0 ||
    selectedIndustries.length > 0 ||
    selectedLocations.length > 0 ||
    selectedJobTypes.length > 0;

  useEffect(() => {
    if (open) {
      setSelectedDatePosted([]);
      setSelectedIndustries([]);
      setSelectedLocations([]);
      setSelectedJobTypes([]);
    }
  }, [open]);

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
    selectedDatePosted,
    selectedIndustries,
    selectedJobTypes,
    selectedLocations,
    setSelectedDatePosted,
    setSelectedIndustries,
    setSelectedJobTypes,
    setSelectedLocations,
  };
};