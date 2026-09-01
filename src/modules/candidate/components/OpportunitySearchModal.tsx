import { useEffect, useState } from "react";
import { Box, Chip, Dialog, DialogContent, IconButton, InputBase, MenuItem, Select, Typography, type SelectChangeEvent } from "@mui/material";
import { useIndustryOptions } from "@/modules/candidate/hooks/useIndustryOptions";
import { PROFILE_SELECT_OPTIONS } from "@/modules/candidate/pages/profileForm.config";
import arrowDownIcon from "@/assets/opportunities/figma-arrow-down-s-line.svg";
import closeIcon from "@/assets/opportunities/figma-close-line.svg";
import searchIcon from "@/assets/opportunities/figma-search-line.svg";
import styles from "./OpportunitySearchModal.module.css";

type OpportunitySearchModalProps = {
  open: boolean;
  onClose: () => void;
};

type FilterOption = {
  value: string;
  label: string;
};

type FilterMultiSelectProps = {
  label: string;
  options: readonly FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

const toFilterOptions = (options: readonly string[]) =>
  options.map((option) => ({ value: option, label: option }));

const datePostedOptions = [
  { value: "TODAY", label: "Today" },
  { value: "LAST_3_DAYS", label: "Last 3 days" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_14_DAYS", label: "Last 14 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
];

const jobTypeOptions = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const FilterDropdownIcon = ({ className }: { className?: string }) => (
  <img src={arrowDownIcon} alt="" className={`${styles.filterArrow} ${className ?? ""}`} />
);

const FilterMultiSelect = ({
  label,
  options,
  value,
  onChange,
}: FilterMultiSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const nextValue = event.target.value;
    onChange(typeof nextValue === "string" ? nextValue.split(",") : nextValue);
  };

  return (
    <Select
      multiple
      displayEmpty
      value={value}
      onChange={handleChange}
      IconComponent={FilterDropdownIcon}
      className={styles.filterSelect}
      inputProps={{ "aria-label": label }}
      MenuProps={{
        slotProps: {
          paper: {
            sx: { maxHeight: 360 },
          },
        },
      }}
      renderValue={(selected) => {
        const values = selected as string[];
        return values.length > 0 ? `${label} (${values.length})` : label;
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export const OpportunitySearchModal = ({
  open,
  onClose,
}: OpportunitySearchModalProps) => {
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      aria-labelledby="opportunity-search-title"
      slotProps={{ paper: { className: styles.paper } }}
    >
      <DialogContent className={styles.content}>
        <IconButton
          aria-label="Close search"
          onClick={onClose}
          className={styles.closeButton}
        >
          <img src={closeIcon} alt="" className={styles.closeIcon} />
        </IconButton>

        <Box className={styles.searchContent}>
          <Typography id="opportunity-search-title" component="h2" className={styles.title}>
            Discover opportunities that fit you.
          </Typography>

          <Box className={styles.searchField}>
            <InputBase
              autoFocus
              placeholder="Search by job type"
              inputProps={{ "aria-label": "Search by job type" }}
              className={styles.searchInput}
            />
            <IconButton aria-label="Search opportunities" className={styles.searchIconButton}>
              <img src={searchIcon} alt="" className={styles.searchIcon} />
            </IconButton>
          </Box>

          <Box className={styles.filters} aria-label="Search filters">
            <FilterMultiSelect
              label="Industry"
              options={readableIndustryOptions}
              value={selectedIndustries}
              onChange={setSelectedIndustries}
            />

            <FilterMultiSelect
              label="Location"
              options={readableLocationOptions}
              value={selectedLocations}
              onChange={setSelectedLocations}
            />

            <FilterMultiSelect
              label="Date posted"
              options={datePostedOptions}
              value={selectedDatePosted}
              onChange={setSelectedDatePosted}
            />

            <FilterMultiSelect
              label="Job type"
              options={jobTypeOptions}
              value={selectedJobTypes}
              onChange={setSelectedJobTypes}
            />
          </Box>

          {hasSelectedFilters ? (
            <Box className={styles.selectedFilters} aria-label="Selected search filters">
              {selectedDatePosted.map((datePosted) => (
                <Chip
                  key={datePosted}
                  label={getDatePostedLabel(datePosted)}
                  onDelete={() => removeDatePostedFilter(datePosted)}
                  className={styles.filterChip}
                />
              ))}
              {selectedIndustries.map((industry) => (
                <Chip
                  key={industry}
                  label={industry}
                  onDelete={() => removeIndustryFilter(industry)}
                  className={styles.filterChip}
                />
              ))}
              {selectedLocations.map((location) => (
                <Chip
                  key={location}
                  label={location}
                  onDelete={() => removeLocationFilter(location)}
                  className={styles.filterChip}
                />
              ))}
              {selectedJobTypes.map((jobType) => (
                <Chip
                  key={jobType}
                  label={getJobTypeLabel(jobType)}
                  onDelete={() => removeJobTypeFilter(jobType)}
                  className={styles.filterChip}
                />
              ))}
            </Box>
          ) : null}
        </Box>
      </DialogContent>
    </Dialog>
  );
};