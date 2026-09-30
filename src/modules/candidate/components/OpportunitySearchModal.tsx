import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { datePostedOptions, jobTypeOptions, useOpportunitySearchModalState } from "@/modules/candidate/hooks/useOpportunitySearchModalState";
import { buildJobSearchParams } from "@/modules/candidate/jobSearchParams";
import { ROUTE_PATHS } from "@/routes/routePaths";
import closeIcon from "@/assets/opportunities/figma-close-line.svg";
import { OpportunitySearchControls } from "./OpportunitySearchControls";
import styles from "./OpportunitySearchModal.module.css";

type OpportunitySearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export const OpportunitySearchModal = ({
  open,
  onClose,
}: OpportunitySearchModalProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearch = () => {
    const params = buildJobSearchParams({
      search: searchQuery.trim(),
      industries: selectedIndustries,
      locations: selectedLocations,
      datePosted: selectedDatePosted[0],
      jobType: selectedJobTypes[0],
      page: 1,
    });
    onClose();
    navigate(`${ROUTE_PATHS.jobSearch}?${params.toString()}`);
  };

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

        <OpportunitySearchControls
          variant="dialog"
          titleId="opportunity-search-title"
          titleComponent="h2"
          searchValue={searchQuery}
          onSearchValueChange={setSearchQuery}
          onSearch={handleSearch}
          industryOptions={readableIndustryOptions}
          locationOptions={readableLocationOptions}
          datePostedOptions={datePostedOptions}
          jobTypeOptions={jobTypeOptions}
          selectedIndustries={selectedIndustries}
          selectedLocations={selectedLocations}
          selectedDatePosted={selectedDatePosted}
          selectedJobTypes={selectedJobTypes}
          onIndustriesChange={setSelectedIndustries}
          onLocationsChange={setSelectedLocations}
          onDatePostedChange={setSelectedDatePosted}
          onJobTypesChange={setSelectedJobTypes}
        />
      </DialogContent>
    </Dialog>
  );
};