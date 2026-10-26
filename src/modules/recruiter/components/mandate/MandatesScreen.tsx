import { JobPostStatus, JobPostStatusLabel } from "@/enums/statuses";
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { mandateApi } from "@/services/api/mandateApi";
import { recruiterCandidatesApi } from "@/services/api/recruiterCandidatesApi";
import { pushNotification } from "@/store/slices/notificationSlice";
import type { AppDispatch } from "@/store";
import type { JobPost } from "@/types/api";
import { ROUTE_PATHS } from "@/routes/routePaths";
import editPostIcon from "@/assets/recruiter/job-post-edit.svg";
import closePostIcon from "@/assets/recruiter/job-post-close.svg";
import deletePostIcon from "@/assets/recruiter/job-post-delete.svg";
import dismissIcon from "@/assets/recruiter/job-post-dismiss.svg";
import closeWarningIcon from "@/assets/recruiter/job-post-close-warning.svg";
import styles from "./MandatesScreen.module.css";

type MandatesScreenProps = {
  onNewJobPost: () => void;
  onEditJobPost: (mandateId: string) => void;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [JobPostStatusLabel.POSTED, JobPostStatusLabel.CLOSED] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

type CompanyOption = { name: string; clientId: string };

/** Format ISO date string to "D Mon YYYY" e.g. "15 Oct 2024" */
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" }).slice(0, 3);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Capitalise first letter, lowercase rest e.g. "POSTED" → "Posted" */
function toTitleCase(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const MandatesScreen = ({
  onNewJobPost,
  onEditJobPost,
}: MandatesScreenProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // Delete check / confirmation / block dialogs
  const [deleteCheckLoading, setDeleteCheckLoading] = useState(false);
  const [blockDeleteDialogOpen, setBlockDeleteDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const pendingDeleteRef = useRef<{ id: string; title: string } | null>(null);

  // Close job post confirmation dialog
  const [closeJobLoading, setCloseJobLoading] = useState(false);
  const [closeJobConfirmOpen, setCloseJobConfirmOpen] = useState(false);
  const pendingCloseJobRef = useRef<{ id: string; title: string } | null>(null);

  // Status filter dropdown
  const statusBtnRef = useRef<HTMLButtonElement | null>(null);
  const [statusAnchorEl, setStatusAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([]);

  // Company filter dropdown — stores the selected clientId (single selection)
  const companyBtnRef = useRef<HTMLButtonElement | null>(null);
  const [companyAnchorEl, setCompanyAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Stable company list seeded from the initial unfiltered load
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Timeline sort: 'asc' | 'desc' | null
  const [timelineSortDir, setTimelineSortDir] = useState<"asc" | "desc" | null>(
    null,
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Location filter dropdown
  const locationBtnRef = useRef<HTMLButtonElement | null>(null);
  const [locationAnchorEl, setLocationAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Stable location list seeded from the initial unfiltered load
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // ── Fetch job posts whenever filters change ───────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    mandateApi
      .getJobPosts({
        search: searchQuery.trim() || undefined,
        status:
          selectedStatuses.length === 1
            ? selectedStatuses[0].toUpperCase()
            : undefined,
        locationText:
          selectedLocations.length > 0 ? [...selectedLocations] : undefined,
        clientId: selectedClientId ?? undefined,
      })
      .then((envelope) => {
        const posts = envelope.data ?? [];
        setJobPosts(posts);
        // Populate company and location options from the first (unfiltered) load only
        if (
          !selectedClientId &&
          selectedLocations.length === 0 &&
          selectedStatuses.length === 0 &&
          !searchQuery.trim()
        ) {
          const seen = new Map<string, string>();
          posts.forEach((p) => {
            if (p.clientId && p.client) seen.set(p.clientId, p.client);
          });
          setCompanyOptions(
            [...seen.entries()]
              .map(([clientId, name]) => ({ clientId, name }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          const locationsSeen = new Set<string>(["Remote", "Hybrid"]);
          posts.forEach((p) => {
            if (p.location) locationsSeen.add(p.location);
          });
          setLocationOptions(
            [...locationsSeen].sort((a, b) => a.localeCompare(b)),
          );
        }
      })
      .catch(() => {
        setError("Failed to load job posts. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchQuery, selectedStatuses, selectedLocations, selectedClientId]);

  // ── Reset page when filters change ───────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatuses, selectedLocations, selectedClientId]);

  // ── Strip CANCELLED rows, then optionally sort by fill-by date ───────────
  const filteredRows = useMemo(() => {
    const rows = jobPosts.filter(
      (post) => post.status.toUpperCase() !== JobPostStatus.CANCELLED,
    );
    if (!timelineSortDir) return rows;
    return [...rows].sort((a, b) => {
      const aTime = a.targetCloseDate
        ? new Date(a.targetCloseDate).getTime()
        : 0;
      const bTime = b.targetCloseDate
        ? new Date(b.targetCloseDate).getTime()
        : 0;
      return timelineSortDir === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [jobPosts, timelineSortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCompanyChipClick = () =>
    setCompanyAnchorEl(companyBtnRef.current);
  const handleCompanyClose = () => setCompanyAnchorEl(null);

  const toggleCompany = (clientId: string) => {
    setSelectedClientId((prev) => (prev === clientId ? null : clientId));
  };

  const handleStatusChipClick = () => setStatusAnchorEl(statusBtnRef.current);
  const handleStatusClose = () => setStatusAnchorEl(null);

  const toggleStatus = (option: StatusOption) => {
    setSelectedStatuses((prev) =>
      prev.includes(option)
        ? prev.filter((s) => s !== option)
        : [...prev, option],
    );
  };

  const handleLocationChipClick = () =>
    setLocationAnchorEl(locationBtnRef.current);
  const handleLocationClose = () => setLocationAnchorEl(null);

  const toggleLocation = (option: string) => {
    setSelectedLocations((prev) =>
      prev.includes(option)
        ? prev.filter((l) => l !== option)
        : [...prev, option],
    );
  };

  const companyOpen = Boolean(companyAnchorEl);
  const selectedCompanyName =
    companyOptions.find((c) => c.clientId === selectedClientId)?.name ?? null;
  const statusOpen = Boolean(statusAnchorEl);
  const locationOpen = Boolean(locationAnchorEl);

  const handleMoreClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    rowId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(rowId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const handleEditPost = () => {
    if (activeRowId) {
      onEditJobPost(activeRowId);
    }
    handleClose();
  };

  const activeRowPost = jobPosts.find((p) => p.mandateId === activeRowId);

  const handleCloseJobClick = () => {
    const idToClose = activeRowId;
    const postToClose = jobPosts.find((p) => p.mandateId === idToClose);
    handleClose();
    if (
      !idToClose ||
      !postToClose ||
      postToClose.status.toUpperCase() === JobPostStatus.CLOSED
    )
      return;

    pendingCloseJobRef.current = {
      id: idToClose,
      title: postToClose.title ?? "",
    };
    setCloseJobConfirmOpen(true);
  };

  const confirmCloseJob = () => {
    const pending = pendingCloseJobRef.current;
    if (!pending || closeJobLoading) return;
    setCloseJobLoading(true);

    mandateApi
      .updateJobStatus(pending.id, JobPostStatus.CLOSED)
      .then(() => {
        setJobPosts((prev) =>
          prev.map((p) =>
            p.mandateId === pending.id ? { ...p, status: JobPostStatus.CLOSED } : p,
          ),
        );
        dispatch(
          pushNotification({
            level: "success",
            title: "Job post closed",
            message: pending.title
              ? `"${pending.title}" has been closed.`
              : undefined,
          }),
        );
        setCloseJobConfirmOpen(false);
        pendingCloseJobRef.current = null;
      })
      .catch(() => {
        dispatch(
          pushNotification({
            level: "error",
            title: "Failed to close job post",
            message: "Could not close the job post. Please try again.",
          }),
        );
      })
      .finally(() => {
        setCloseJobLoading(false);
      });
  };

  const handleDelete = () => {
    const idToDelete = activeRowId;
    handleClose();
    if (!idToDelete) return;

    const deletedPost = jobPosts.find((p) => p.mandateId === idToDelete);

    setDeleteCheckLoading(true);
    recruiterCandidatesApi
      .listCandidates({ jobProfileId: idToDelete, limit: 1 })
      .then((envelope) => {
        const total = envelope.data?.pagination?.total ?? 0;
        if (total > 0) {
          // Candidates have applied — block the delete
          setBlockDeleteDialogOpen(true);
          return;
        }

        // No applications — show confirmation dialog before deleting
        pendingDeleteRef.current = {
          id: idToDelete,
          title: deletedPost?.title ?? "",
        };
        setConfirmDeleteDialogOpen(true);
      })
      .catch(() => {
        dispatch(
          pushNotification({
            level: "error",
            title: "Delete failed",
            message:
              "Could not verify applications for this job post. Please try again.",
          }),
        );
      })
      .finally(() => {
        setDeleteCheckLoading(false);
      });
  };

  const confirmDelete = () => {
    const pending = pendingDeleteRef.current;
    setConfirmDeleteDialogOpen(false);
    pendingDeleteRef.current = null;
    if (!pending) return;

    setJobPosts((prev) => prev.filter((p) => p.mandateId !== pending.id));
    mandateApi
      .deleteJobPost(pending.id)
      .then(() => {
        dispatch(
          pushNotification({
            level: "success",
            title: "Job post deleted",
            message: pending.title
              ? `"${pending.title}" has been deleted.`
              : undefined,
          }),
        );
      })
      .catch(() => {
        mandateApi.getJobPosts().then((envelope) => {
          setJobPosts(envelope.data ?? []);
        });
        dispatch(
          pushNotification({
            level: "error",
            title: "Delete failed",
            message: "Could not delete the job post. Please try again.",
          }),
        );
      });
  };

  const open = Boolean(anchorEl);

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          All Job Posts
        </Typography>
        <Button
          variant="contained"
          className={styles.newMandateBtn}
          onClick={onNewJobPost}
          disableElevation
        >
          New Job Post
        </Button>
      </Box>

      <Box className={styles.filtersRow}>
        {/* Company dropdown chip */}
        <ButtonBase
          ref={companyBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedClientId !== null || companyOpen ? styles.filterChipActive : ""}`}
          disableRipple
          onClick={handleCompanyChipClick}
          aria-haspopup="true"
          aria-expanded={companyOpen ? "true" : undefined}
        >
          {/* Building / company icon */}
          <span
            className={`${styles.filterChipSvgIcon} ${styles.assetMask} ${styles.companyIcon}`}
            aria-hidden="true"
          />
          {selectedCompanyName ?? "Company"}
        </ButtonBase>

        {/* Location dropdown chip */}
        <ButtonBase
          ref={locationBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedLocations.length > 0 || locationOpen ? styles.filterChipActive : ""}`}
          disableRipple
          onClick={handleLocationChipClick}
          aria-haspopup="true"
          aria-expanded={locationOpen ? "true" : undefined}
        >
          {/* Pin / location icon */}
          <span
            className={`${styles.filterChipSvgIcon} ${styles.assetMask} ${styles.locationIcon}`}
            aria-hidden="true"
          />
          Location
        </ButtonBase>

        {/* Status dropdown chip */}
        <ButtonBase
          ref={statusBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedStatuses.length > 0 || statusOpen ? styles.filterChipActive : ""}`}
          disableRipple
          onClick={handleStatusChipClick}
          aria-haspopup="true"
          aria-expanded={statusOpen ? "true" : undefined}
        >
          {/* Circle-check / status icon */}
          <span
            className={`${styles.filterChipSvgIcon} ${styles.assetMask} ${styles.statusIcon}`}
            aria-hidden="true"
          />
          Status
        </ButtonBase>

        <Box component="label" className={styles.searchField}>
          {/* Magnifier / search icon */}
          <span
            className={`${styles.filterChipSvgIcon} ${styles.assetMask} ${styles.searchIcon}`}
            aria-hidden="true"
          />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search job posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search job posts"
          />
        </Box>
      </Box>

      {/* Company dropdown popover */}
      <Popover
        open={companyOpen}
        anchorEl={companyAnchorEl}
        onClose={handleCompanyClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {companyOptions.map((option) => (
          <div
            key={option.clientId}
            role="menuitemradio"
            aria-checked={selectedClientId === option.clientId}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleCompany(option.clientId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCompany(option.clientId);
              }
            }}
          >
            <span
              className={`${styles.filterCheckboxIcon} ${selectedClientId === option.clientId ? styles.filterCheckboxIconChecked : ""}`}
              aria-hidden="true"
            />
            <span className={styles.filterDropdownLabel}>{option.name}</span>
          </div>
        ))}
      </Popover>

      {/* Status dropdown popover */}
      <Popover
        open={statusOpen}
        anchorEl={statusAnchorEl}
        onClose={handleStatusClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <div
            key={option}
            role="menuitemcheckbox"
            aria-checked={selectedStatuses.includes(option)}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleStatus(option)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleStatus(option);
              }
            }}
          >
            <span
              className={`${styles.filterCheckboxIcon} ${selectedStatuses.includes(option) ? styles.filterCheckboxIconChecked : ""}`}
              aria-hidden="true"
            />
            <span className={styles.filterDropdownLabel}>{option}</span>
          </div>
        ))}
      </Popover>

      {/* Location dropdown popover */}
      <Popover
        open={locationOpen}
        anchorEl={locationAnchorEl}
        onClose={handleLocationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {locationOptions.map((option) => (
          <div
            key={option}
            role="menuitemcheckbox"
            aria-checked={selectedLocations.includes(option)}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleLocation(option)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleLocation(option);
              }
            }}
          >
            <span
              className={`${styles.filterCheckboxIcon} ${selectedLocations.includes(option) ? styles.filterCheckboxIconChecked : ""}`}
              aria-hidden="true"
            />
            <span className={styles.filterDropdownLabel}>{option}</span>
          </div>
        ))}
      </Popover>

      {/* Table */}
      <Box className={styles.tableWrap}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Typography sx={{ textAlign: "center", py: 6, color: "error.main" }}>
            {error}
          </Typography>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <Typography
            sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
          >
            No job posts found.
          </Typography>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <Box className={styles.table}>
            {paginatedRows.map((post) => {
              const displayStatus = toTitleCase(post.status);
              const isDraft = post.status.toUpperCase() === JobPostStatus.DRAFT;
              const timeline = `${formatDate(post.openDate)} – ${formatDate(post.targetCloseDate)}`;

              return (
                <Box
                  key={post.mandateId}
                  className={`${styles.tableRow} ${styles.tableRowClickable}`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(
                      ROUTE_PATHS.recruiterMandate.replace(
                        ":cardId",
                        post.mandateId,
                      ),
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(
                        ROUTE_PATHS.recruiterMandate.replace(
                          ":cardId",
                          post.mandateId,
                        ),
                      );
                    }
                  }}
                >
                  <Box className={styles.companyStrip}>
                    <Typography component="span" className={styles.companyName}>
                      {post.client}
                    </Typography>
                  </Box>

                  <Box className={styles.gridHeader}>
                    <Typography component="span" className={styles.gridLabel}>
                      JOB TITLE
                    </Typography>
                    <Typography component="span" className={styles.gridLabel}>
                      CLIENT RATE
                    </Typography>
                    <Typography component="span" className={styles.gridLabel}>
                      INDUSTRY
                    </Typography>
                    <Typography component="span" className={styles.gridLabel}>
                      LOCATION
                    </Typography>
                    <Box className={styles.timelineHeader}>
                      <Typography component="span" className={styles.gridLabel}>
                        TIMELINE
                      </Typography>
                      <Box
                        component="span"
                        className={styles.timelineSortBtns}
                        aria-label="Sort by timeline"
                      >
                        <button
                          type="button"
                          className={`${styles.timelineSortBtn} ${timelineSortDir === "asc" ? styles.timelineSortBtnActive : ""}`}
                          aria-label="Sort ascending"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimelineSortDir((prev) =>
                              prev === "asc" ? null : "asc",
                            );
                          }}
                        >
                          <span
                            className={`${styles.assetMask} ${styles.sortAscendingIcon}`}
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          className={`${styles.timelineSortBtn} ${timelineSortDir === "desc" ? styles.timelineSortBtnActive : ""}`}
                          aria-label="Sort descending"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimelineSortDir((prev) =>
                              prev === "desc" ? null : "desc",
                            );
                          }}
                        >
                          <span
                            className={`${styles.assetMask} ${styles.sortDescendingIcon}`}
                            aria-hidden="true"
                          />
                        </button>
                      </Box>
                    </Box>
                    <Typography component="span" className={styles.gridLabel}>
                      STATUS
                    </Typography>
                  </Box>

                  <Box className={styles.gridBody}>
                    <Typography component="span" className={styles.gridValue}>
                      {post.title}
                    </Typography>
                    <Typography component="span" className={styles.gridValue}>
                      {post.clientRate || "—"}
                    </Typography>
                    <Typography component="span" className={styles.gridValue}>
                      {post.industry}
                    </Typography>
                    <Typography component="span" className={styles.gridValue}>
                      {post.location}
                    </Typography>
                    <Typography component="span" className={styles.gridValue}>
                      {timeline}
                    </Typography>
                    <Box className={styles.statusCell}>
                      <Box
                        className={`${styles.statusPill} ${isDraft ? styles.statusDraft : post.status.toUpperCase() === JobPostStatus.CLOSED ? styles.statusClosed : styles.statusPosted}`}
                      >
                        {displayStatus}
                      </Box>
                    </Box>
                    <ButtonBase
                      component="button"
                      className={`${styles.moreButton} ${activeRowId === post.mandateId && open ? styles.moreButtonActive : ""}`}
                      disableRipple
                      aria-label={`More actions for ${post.title}`}
                      aria-haspopup="true"
                      aria-expanded={
                        activeRowId === post.mandateId && open
                          ? "true"
                          : undefined
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoreClick(
                          e as React.MouseEvent<HTMLButtonElement>,
                          post.mandateId,
                        );
                      }}
                    >
                      <Box component="span" className={styles.moreDot} />
                      <Box component="span" className={styles.moreDot} />
                      <Box component="span" className={styles.moreDot} />
                    </ButtonBase>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {!loading && !error && filteredRows.length > 0 && (
        <Box className={styles.pagination}>
          <ButtonBase
            component="button"
            className={styles.pageBtn}
            disableRipple
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            aria-label="Previous page"
          >
            <span
              className={`${styles.assetMask} ${styles.previousIcon}`}
              aria-hidden="true"
            />
          </ButtonBase>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <ButtonBase
              key={page}
              component="button"
              className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ""}`}
              disableRipple
              onClick={() => goToPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </ButtonBase>
          ))}

          <ButtonBase
            component="button"
            className={styles.pageBtn}
            disableRipple
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            aria-label="Next page"
          >
            <span
              className={`${styles.assetMask} ${styles.nextIcon}`}
              aria-hidden="true"
            />
          </ButtonBase>
        </Box>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { className: styles.menuPaper },
        }}
      >
        <ButtonBase
          className={styles.menuItem}
          onClick={handleEditPost}
          disableRipple
        >
          <img
            src={editPostIcon}
            className={styles.menuIcon}
            alt=""
            aria-hidden="true"
          />
          Edit post
        </ButtonBase>

        <ButtonBase
          className={styles.menuItem}
          onClick={handleCloseJobClick}
          disableRipple
          disabled={activeRowPost?.status.toUpperCase() === JobPostStatus.CLOSED}
        >
          <img
            src={closePostIcon}
            className={styles.menuIcon}
            alt=""
            aria-hidden="true"
          />
          Close job post
        </ButtonBase>

        <ButtonBase
          className={`${styles.menuItem} ${styles.menuItemDelete}`}
          onClick={handleDelete}
          disableRipple
          disabled={deleteCheckLoading}
        >
          {deleteCheckLoading ? (
            <CircularProgress
              size={14}
              className={styles.menuIcon}
              sx={{ color: "#d32f2f" }}
            />
          ) : (
            <img
              src={deletePostIcon}
              className={styles.menuIcon}
              alt=""
              aria-hidden="true"
            />
          )}
          Delete
        </ButtonBase>
      </Popover>

      {/* Block-delete dialog — shown when candidates have applied */}
      <Dialog
        open={blockDeleteDialogOpen}
        onClose={() => setBlockDeleteDialogOpen(false)}
        slotProps={{ paper: { className: styles.blockDeleteDialog } }}
        aria-labelledby="block-delete-title"
        aria-describedby="block-delete-desc"
      >
        <DialogTitle
          id="block-delete-title"
          className={styles.blockDeleteTitle}
        >
          Cannot delete job post
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="block-delete-desc"
            className={styles.blockDeleteBody}
          >
            This job post cannot be deleted because candidates have already
            applied to it.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.blockDeleteActions}>
          <Button
            variant="contained"
            disableElevation
            className={styles.blockDeleteOkBtn}
            onClick={() => setBlockDeleteDialogOpen(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm-delete dialog — shown when no candidates have applied */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => {
          setConfirmDeleteDialogOpen(false);
          pendingDeleteRef.current = null;
        }}
        slotProps={{ paper: { className: styles.blockDeleteDialog } }}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
      >
        <DialogTitle
          id="confirm-delete-title"
          className={styles.blockDeleteTitle}
        >
          Delete job post?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="confirm-delete-desc"
            className={styles.blockDeleteBody}
          >
            Are you sure you want to delete this job post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ButtonBase
            disableRipple
            sx={{
              px: 2,
              py: 1,
              fontSize: 14,
              borderRadius: 1,
              color: "#57606a",
            }}
            onClick={() => {
              setConfirmDeleteDialogOpen(false);
              pendingDeleteRef.current = null;
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            disableRipple
            sx={{
              px: 2,
              py: 1,
              fontSize: 14,
              borderRadius: 1,
              color: "#d32f2f",
              fontWeight: 600,
            }}
            onClick={confirmDelete}
          >
            Delete
          </ButtonBase>
        </DialogActions>
      </Dialog>

      {/* ── Close Job confirmation modal ── */}
      {closeJobConfirmOpen && (
        <Box
          className={styles.confirmBackdrop}
          onClick={() => {
            if (!closeJobLoading) {
              setCloseJobConfirmOpen(false);
              pendingCloseJobRef.current = null;
            }
          }}
        >
          <Box
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-job-modal-title"
          >
            {/* header */}
            <Box className={styles.confirmModalHeader}>
              <Typography
                component="h2"
                id="close-job-modal-title"
                className={styles.confirmModalTitle}
              >
                Close Job Post
              </Typography>
              <ButtonBase
                className={styles.confirmModalCloseBtn}
                disableRipple
                aria-label="Cancel"
                disabled={closeJobLoading}
                onClick={() => {
                  setCloseJobConfirmOpen(false);
                  pendingCloseJobRef.current = null;
                }}
              >
                <img
                  src={dismissIcon}
                  width="18"
                  height="18"
                  alt=""
                  aria-hidden="true"
                />
              </ButtonBase>
            </Box>

            {/* body */}
            <Box className={styles.confirmModalBody}>
              <img
                src={closeWarningIcon}
                className={styles.closeWarningIcon}
                width="44"
                height="44"
                alt=""
                aria-hidden="true"
              />
              <Box>
                <Typography
                  component="p"
                  className={styles.confirmModalMessage}
                >
                  Are you sure you want to close this job post?
                </Typography>
                <Typography
                  component="p"
                  className={styles.confirmModalSubMessage}
                >
                  This action cannot be undone. The job will be marked as closed
                  and will no longer accept new applicants.
                </Typography>
              </Box>
            </Box>

            {/* footer */}
            <Box className={styles.confirmModalFooter}>
              <ButtonBase
                className={styles.confirmCancelBtn}
                disableRipple
                disabled={closeJobLoading}
                onClick={() => {
                  setCloseJobConfirmOpen(false);
                  pendingCloseJobRef.current = null;
                }}
              >
                Cancel
              </ButtonBase>
              <ButtonBase
                className={styles.confirmCloseBtn}
                disableRipple
                disabled={closeJobLoading}
                onClick={confirmCloseJob}
              >
                {closeJobLoading ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  "Yes, Close Job"
                )}
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
