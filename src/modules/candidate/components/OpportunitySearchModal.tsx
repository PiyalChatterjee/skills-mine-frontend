import { Box, Dialog, DialogContent, IconButton, InputBase, Typography } from "@mui/material";
import arrowDownIcon from "@/assets/opportunities/figma-arrow-down-s-line.svg";
import closeIcon from "@/assets/opportunities/figma-close-line.svg";
import searchIcon from "@/assets/opportunities/figma-search-line.svg";
import styles from "./OpportunitySearchModal.module.css";

type OpportunitySearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const filters = ["Industry", "Location", "Date posted", "Job type"];

export const OpportunitySearchModal = ({
  open,
  onClose,
}: OpportunitySearchModalProps) => (
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
          {filters.map((filter) => (
            <button key={filter} type="button" className={styles.filterButton}>
              {filter}
              <img src={arrowDownIcon} alt="" className={styles.filterArrow} />
            </button>
          ))}
        </Box>
      </Box>
    </DialogContent>
  </Dialog>
);