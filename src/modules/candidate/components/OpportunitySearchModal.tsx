import { useState } from "react";
import { Box, Chip, Dialog, DialogContent, IconButton, InputBase, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { usePickerContext } from "@mui/x-date-pickers/hooks";
import type { Dayjs } from "dayjs";
import arrowDownIcon from "@/assets/opportunities/figma-arrow-down-s-line.svg";
import closeIcon from "@/assets/opportunities/figma-close-line.svg";
import searchIcon from "@/assets/opportunities/figma-search-line.svg";
import styles from "./OpportunitySearchModal.module.css";

type OpportunitySearchModalProps = {
  open: boolean;
  onClose: () => void;
};

// Renders the "Date posted" filter as a pill button that opens the calendar popup on click.
const DatePostedField = () => {
  const pickerContext = usePickerContext();
  const label = pickerContext.value ? pickerContext.value.format("MMM D, YYYY") : "Date posted";

  return (
    <button
      type="button"
      className={styles.filterButton}
      ref={pickerContext.triggerRef}
      onClick={() => pickerContext.setOpen((prev) => !prev)}
    >
      {label}
      <img src={arrowDownIcon} alt="" className={styles.filterArrow} />
    </button>
  );
};

export const OpportunitySearchModal = ({
  open,
  onClose,
}: OpportunitySearchModalProps) => {
  const [datePosted, setDatePosted] = useState<Dayjs | null>(null);

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
            {datePosted && (
              <Chip
                label={datePosted.format("MMM D, YYYY")}
                onDelete={() => setDatePosted(null)}
                className={styles.filterChip}
              />
            )}
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
            <button type="button" className={styles.filterButton}>
              Industry
              <img src={arrowDownIcon} alt="" className={styles.filterArrow} />
            </button>

            <button type="button" className={styles.filterButton}>
              Location
              <img src={arrowDownIcon} alt="" className={styles.filterArrow} />
            </button>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={datePosted}
                onChange={(value) => setDatePosted(value)}
                disableFuture
                slots={{ field: DatePostedField }}
              />
            </LocalizationProvider>

            <button type="button" className={styles.filterButton}>
              Job type
              <img src={arrowDownIcon} alt="" className={styles.filterArrow} />
            </button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};