import {
  Box,
  Checkbox,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import arrowDownIcon from "@/assets/opportunities/figma-arrow-down-s-line.svg";
import searchIcon from "@/assets/opportunities/figma-search-line.svg";
import styles from "./OpportunitySearchControls.module.css";

export type OpportunityFilterOption = {
  value: string;
  label: string;
};

type OpportunitySearchControlsProps = {
  variant: "dialog" | "hero";
  titleId?: string;
  titleComponent?: "h1" | "h2";
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  isSearching?: boolean;
  industryOptions: readonly OpportunityFilterOption[];
  locationOptions: readonly OpportunityFilterOption[];
  datePostedOptions: readonly OpportunityFilterOption[];
  jobTypeOptions: readonly OpportunityFilterOption[];
  selectedIndustries: string[];
  selectedLocations: string[];
  selectedDatePosted: string[];
  selectedJobTypes: string[];
  onIndustriesChange: (value: string[]) => void;
  onLocationsChange: (value: string[]) => void;
  onDatePostedChange: (value: string[]) => void;
  onJobTypesChange: (value: string[]) => void;
};

type FilterSelectProps = {
  label: string;
  options: readonly OpportunityFilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  variant: "dialog" | "hero";
};

const FilterDropdownIcon = ({ className }: { className?: string }) => (
  <img src={arrowDownIcon} alt="" className={`${styles.filterArrow} ${className ?? ""}`} />
);

const FilterSelect = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  variant,
}: FilterSelectProps) => {
  const selectClassName = [styles.filterSelect, variant === "hero" ? styles.heroFilterSelect : ""]
    .filter(Boolean)
    .join(" ");

  if (multiple) {
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
        className={selectClassName}
        inputProps={{ "aria-label": label }}
        MenuProps={{ slotProps: { paper: { className: styles.filterMenu, sx: { maxHeight: 360 } } } }}
        renderValue={(selected) => selected.length > 0 ? `${label} (${selected.length})` : label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={value.includes(option.value)} />
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value ? [event.target.value] : []);
  };

  return (
    <Select
      displayEmpty
      value={value[0] ?? ""}
      onChange={handleChange}
      IconComponent={FilterDropdownIcon}
      className={selectClassName}
      inputProps={{ "aria-label": label }}
      MenuProps={{ slotProps: { paper: { className: styles.filterMenu, sx: { maxHeight: 360 } } } }}
      renderValue={(selected) => options.find((option) => option.value === selected)?.label ?? label}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export const OpportunitySearchControls = ({
  variant,
  titleId,
  titleComponent = "h1",
  searchValue,
  onSearchValueChange,
  onSearch,
  isSearching = false,
  industryOptions,
  locationOptions,
  datePostedOptions,
  jobTypeOptions,
  selectedIndustries,
  selectedLocations,
  selectedDatePosted,
  selectedJobTypes,
  onIndustriesChange,
  onLocationsChange,
  onDatePostedChange,
  onJobTypesChange,
}: OpportunitySearchControlsProps) => (
  <Box
    component="form"
    className={[styles.controls, variant === "hero" ? styles.heroControls : ""].filter(Boolean).join(" ")}
    onSubmit={(event) => {
      event.preventDefault();
      onSearch();
    }}
  >
    <Typography id={titleId} component={titleComponent} className={styles.title}>
      Discover opportunities that fit you.
    </Typography>

    <Box className={styles.searchField}>
      <InputBase
        autoFocus={variant === "dialog"}
        placeholder="Search"
        inputProps={{ "aria-label": "Search opportunities" }}
        className={styles.searchInput}
        value={searchValue}
        onChange={(event) => onSearchValueChange(event.target.value)}
      />
      <IconButton
        type="submit"
        aria-label="Submit opportunity search"
        className={styles.searchIconButton}
        disabled={isSearching}
      >
        <img src={searchIcon} alt="" className={styles.searchIcon} />
      </IconButton>
    </Box>

    <Box className={styles.filters} aria-label="Search filters">
      <FilterSelect label="Industry" options={industryOptions} value={selectedIndustries} onChange={onIndustriesChange} multiple variant={variant} />
      <FilterSelect label="Location" options={locationOptions} value={selectedLocations} onChange={onLocationsChange} multiple variant={variant} />
      <FilterSelect label="Date posted" options={datePostedOptions} value={selectedDatePosted} onChange={onDatePostedChange} variant={variant} />
      <FilterSelect label="Job type" options={jobTypeOptions} value={selectedJobTypes} onChange={onJobTypesChange} variant={variant} />
    </Box>
  </Box>
);