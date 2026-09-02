import { Box, Checkbox, Dialog, DialogContent, IconButton, InputBase, MenuItem, Select, Typography, type SelectChangeEvent } from "@mui/material";
import { datePostedOptions, jobTypeOptions, useOpportunitySearchModalState } from "@/modules/candidate/hooks/useOpportunitySearchModalState";
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
          <Checkbox checked={value.includes(option.value)} />
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

const FilterSingleSelect = ({
  label,
  options,
  value,
  onChange,
}: FilterMultiSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const nextValue = event.target.value;
    onChange(nextValue ? [nextValue] : []);
  };

  return (
    <Select
      displayEmpty
      value={value[0] ?? ""}
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
        const option = options.find((item) => item.value === selected);
        return option ? option.label : label;
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
  const {
    readableIndustryOptions,
    readableLocationOptions,
    selectedDatePosted,
    selectedIndustries,
    selectedJobTypes,
    selectedLocations,
    setSelectedDatePosted,
    setSelectedIndustries,
    setSelectedJobTypes,
    setSelectedLocations,
  } = useOpportunitySearchModalState(open);

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

            <FilterSingleSelect
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};