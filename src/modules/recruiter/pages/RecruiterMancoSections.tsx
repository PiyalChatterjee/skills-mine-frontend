import { useState } from "react";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import alertCircleIcon from "@/assets/recruiter/manco-alert-circle.svg";
import alertCloseIcon from "@/assets/recruiter/manco-alert-close.svg";
import alertWarningIcon from "@/assets/recruiter/manco-alert-warning.svg";
import groupsIcon from "@/assets/recruiter/manco-groups.svg";
import resolvedCheckIcon from "@/assets/recruiter/manco-resolved-check.svg";
import arrowDownIcon from "@/assets/opportunities/figma-arrow-down-s-line.svg";
import searchIcon from "@/assets/opportunities/figma-search-line.svg";
import chevronDownIcon from "@/assets/cv-builder/chevron-down.svg";
import {
  MANCO_SORT_OPTIONS,
  useMancoAttention,
  useMancoRecruiterDetail,
  useMancoRecruiters,
} from "@/modules/recruiter/hooks/useMancoDashboard";
import {
  formatAlertIssue,
  formatAlertMetric,
  formatPercentage,
  formatRevenue,
} from "@/modules/recruiter/utils/mancoFormatters";
import type {
  LowPerformanceAlert,
  MancoPipelineDistribution,
  MancoRecruiter,
} from "@/services/api/mancoApi";
import styles from "./RecruiterMancoPage.module.css";

const PIPELINE_STAGES: { key: keyof MancoPipelineDistribution; label: string }[] = [
  { key: "inbound", label: "Inbound" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "filled", label: "Filled" },
  { key: "totalPipeline", label: "Total pipeline" },
];

export const MancoPageHeader = () => (
  <Box className={styles.pageHeader}>
    <Typography component="h1" className={styles.pageTitle}>
      MANCO Dashboard
    </Typography>
    <Typography component="p" className={styles.pageSubtitle}>
      Recruitment team performance metrics and pipeline overview
    </Typography>
  </Box>
);

export const MancoAttentionSection = () => {
  const {
    alertCount,
    alerts,
    closeAlert,
    hasLoadedAlerts,
    hasResolveError,
    isError,
    isExpanded,
    isLoading,
    isResolving,
    resolveSelectedAlert,
    selectAlert,
    selectedAlert,
    toggleExpanded,
  } = useMancoAttention();

  return (
    <>
      <Box className={styles.alertCard}>
        <Box className={styles.alertCardTopRow}>
          <Typography component="p" className={styles.alertCardValue}>
            {alertCount}
          </Typography>
          <Box className={styles.alertCardActions}>
            <Box className={styles.alertCardIconBtn} aria-label="Info">
              <img src={alertCircleIcon} alt="" aria-hidden="true" />
            </Box>
            <ButtonBase
              className={`${styles.alertExpandButton} ${isExpanded ? styles.alertExpandButtonOpen : ""}`}
              onClick={toggleExpanded}
              disableRipple
              aria-label={isExpanded ? "Hide attention alerts" : "Show attention alerts"}
              aria-expanded={isExpanded}
              aria-controls="manco-attention-alerts"
            >
              <img src={chevronDownIcon} alt="" aria-hidden="true" />
            </ButtonBase>
          </Box>
        </Box>
        <Typography component="p" className={styles.alertCardLabel}>
          Recruiters requiring attention
        </Typography>
        {isExpanded && (
          <Box
            id="manco-attention-alerts"
            className={styles.alertList}
            aria-live="polite"
          >
            {isLoading && (
              <Typography className={styles.alertListMessage} role="status">
                Loading alerts...
              </Typography>
            )}
            {isError && (
              <Typography className={styles.alertListMessage} role="alert">
                Attention alerts could not be loaded.
              </Typography>
            )}
            {hasLoadedAlerts && alerts.length === 0 && (
              <Typography className={styles.alertListMessage}>
                No active alerts.
              </Typography>
            )}
            {alerts.map((alert) => (
              <Box className={styles.alertListItem} key={alert.alertId}>
                <Typography className={styles.alertListName}>
                  {alert.fullName}
                </Typography>
                <Box className={styles.alertListDetails}>
                  <Typography className={styles.alertListIssue}>
                    {formatAlertIssue(alert)}
                  </Typography>
                  <ButtonBase
                    className={styles.alertViewDetailsButton}
                    onClick={() => selectAlert(alert)}
                    disableRipple
                  >
                    View details
                  </ButtonBase>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <AlertDetailsDialog
        alert={selectedAlert}
        isResolving={isResolving}
        hasResolveError={hasResolveError}
        onClose={closeAlert}
        onResolve={resolveSelectedAlert}
      />
    </>
  );
};

export const MancoCrmCard = () => (
  <Box className={styles.crmCard}>
    <Typography component="p" className={styles.crmCardLabel}>
      CRM Integration
    </Typography>
    <Box className={styles.crmCardIcon}>
      <img src={groupsIcon} alt="" aria-hidden="true" />
    </Box>
  </Box>
);

export const MancoRecruiterSection = () => {
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(
    null,
  );
  const {
    activeSort,
    handleSearchChange,
    handleSortChange,
    recruiters,
    recruiterQuery,
    searchQuery,
  } = useMancoRecruiters();

  return (
    <>
      <Box className={styles.searchSection}>
        <Typography component="h2" className={styles.searchSectionTitle}>
          Search Employees
        </Typography>
        <Box className={styles.searchInputWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or role"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search employees"
          />
          <Box className={styles.searchInputIcon}>
            <img src={searchIcon} alt="" aria-hidden="true" />
          </Box>
        </Box>
        <Box className={styles.sortBar}>
          <Typography component="span" className={styles.sortLabel}>
            Sort
          </Typography>
          {MANCO_SORT_OPTIONS.map((option) => (
            <ButtonBase
              key={option.key}
              component="button"
              className={`${styles.sortBtn} ${activeSort === option.key ? styles.sortBtnActive : ""}`}
              onClick={() => handleSortChange(option.key)}
              disableRipple
            >
              {option.label}
              <Box className={styles.sortChevron}>
                <img
                  className={activeSort === option.key ? styles.sortArrowActive : undefined}
                  src={arrowDownIcon}
                  alt=""
                  aria-hidden="true"
                />
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Box>
      {recruiterQuery.isLoading && !recruiterQuery.data && (
        <Typography className={styles.statusMessage} role="status">
          Loading recruiter metrics...
        </Typography>
      )}
      {recruiterQuery.isError && !recruiterQuery.data && (
        <Box className={styles.statusMessage} role="alert">
          <Typography>Recruiter metrics could not be loaded.</Typography>
          <ButtonBase
            className={styles.retryButton}
            onClick={() => void recruiterQuery.refetch()}
          >
            Retry
          </ButtonBase>
        </Box>
      )}
      {recruiters.map((recruiter) => (
        <EmployeeCard
          key={recruiter.recruiterId}
          recruiter={recruiter}
          onViewDetails={setSelectedRecruiterId}
        />
      ))}
      {!recruiterQuery.isLoading &&
        !recruiterQuery.isError &&
        recruiterQuery.data &&
        recruiters.length === 0 && (
          <Typography className={styles.statusMessage}>
            No recruiters found.
          </Typography>
        )}
      {selectedRecruiterId && (
        <RecruiterDetailsDialog
          recruiterId={selectedRecruiterId}
          onClose={() => setSelectedRecruiterId(null)}
        />
      )}
    </>
  );
};

type EmployeeCardProps = {
  recruiter: MancoRecruiter;
  onViewDetails: (id: string) => void;
};

const EmployeeCard = ({ recruiter, onViewDetails }: EmployeeCardProps) => {
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const pipelineQuery = useMancoRecruiterDetail(
    recruiter.recruiterId,
    pipelineOpen,
  );

  return (
    <Box className={styles.employeeCard}>
      <Box className={styles.employeeCardTopRow}>
        <Box>
          <Typography component="h3" className={styles.employeeName}>
            {recruiter.fullName}
          </Typography>
          <Typography component="p" className={styles.employeeMeta}>
            <span className={styles.employeeRole}>{recruiter.roleName}</span>
          </Typography>
        </Box>
        <ButtonBase
          className={styles.viewDetailsBtn}
          onClick={() => onViewDetails(recruiter.recruiterId)}
          disableRipple
        >
          View Details
        </ButtonBase>
      </Box>
      <Box className={styles.statsRow}>
        <RecruiterMetric label="MTD Placements" value={recruiter.metrics.mtdPlacements} />
        <RecruiterMetric label="Active Roles" value={recruiter.metrics.activeRoles} />
        <RecruiterMetric
          label="Revenue Earned (MTD)"
          value={formatRevenue(recruiter.metrics.revenueEarnedMtd)}
        />
        <RecruiterMetric
          label="Revenue Earned (YTD)"
          value={formatRevenue(recruiter.metrics.revenueEarnedYtd)}
        />
        <RecruiterMetric
          label="Conversion"
          value={formatPercentage(recruiter.metrics.conversionRate)}
        />
      </Box>
      <Box className={styles.cardDivider} />
      <ButtonBase
        className={styles.pipelineRow}
        onClick={() => setPipelineOpen((open) => !open)}
        disableRipple
        component="button"
        aria-expanded={pipelineOpen}
        aria-controls={`pipeline-${recruiter.recruiterId}`}
        aria-label={`Pipeline distribution for ${recruiter.fullName}`}
      >
        <Typography component="p" className={styles.pipelineRowLabel}>
          Pipeline distribution
        </Typography>
        <Box className={`${styles.pipelineChevron} ${pipelineOpen ? styles.pipelineChevronOpen : ""}`}>
          <img src={chevronDownIcon} alt="" aria-hidden="true" />
        </Box>
      </ButtonBase>
      {pipelineOpen && (
        <Box
          id={`pipeline-${recruiter.recruiterId}`}
          className={styles.pipelineDistribution}
          aria-live="polite"
        >
          {pipelineQuery.isLoading && (
            <Typography className={styles.statusMessage}>
              Loading pipeline...
            </Typography>
          )}
          {pipelineQuery.isError && (
            <Typography className={styles.statusMessage}>
              Pipeline data could not be loaded.
            </Typography>
          )}
          {pipelineQuery.data && (
            <Box className={styles.pipelineGrid}>
              {PIPELINE_STAGES.map((stage) => (
                <Box className={styles.pipelineStage} key={stage.key}>
                  <Typography className={styles.pipelineStageLabel}>
                    {stage.label}
                  </Typography>
                  <Typography className={styles.pipelineStageValue}>
                    {pipelineQuery.data!.pipelineDistribution[stage.key]}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

type RecruiterMetricProps = {
  label: string;
  value: string | number;
};

const RecruiterMetric = ({ label, value }: RecruiterMetricProps) => (
  <Box className={styles.statCell}>
    <Typography component="p" className={styles.statCellLabel}>
      {label}
    </Typography>
    <Typography component="p" className={styles.statCellValue}>
      {value}
    </Typography>
  </Box>
);

type AlertDetailsDialogProps = {
  alert: LowPerformanceAlert | null;
  isResolving: boolean;
  hasResolveError: boolean;
  onClose: () => void;
  onResolve: () => void;
};

const AlertDetailsDialog = ({
  alert,
  isResolving,
  hasResolveError,
  onClose,
  onResolve,
}: AlertDetailsDialogProps) => (
  <Dialog
    open={alert !== null}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    aria-labelledby="manco-alert-details-title"
    slotProps={{ paper: { className: styles.alertDialogPaper } }}
  >
    <DialogTitle id="manco-alert-details-title" className={styles.alertDialogHeader}>
      <Box className={styles.alertDialogHeading}>
        {alert && <img src={alertWarningIcon} alt="" aria-hidden="true" />}
        <Typography component="h2" className={styles.alertDialogName}>
          {alert?.fullName ?? "Alert details"}
        </Typography>
      </Box>
      <ButtonBase
        className={styles.alertDialogClose}
        onClick={onClose}
        aria-label="Close alert details"
        disableRipple
      >
        <img src={alertCloseIcon} alt="" aria-hidden="true" />
      </ButtonBase>
    </DialogTitle>
    <DialogContent dividers={false} className={styles.alertDialogContent}>
      {alert && (
        <Box className={styles.alertDetail}>
          <Box className={styles.alertIssueSummary}>
            <Box className={styles.alertIssueRow}>
              <Typography className={styles.alertSummaryLabel}>Issue</Typography>
              <Typography className={styles.alertSummaryValue}>
                {formatAlertIssue(alert)}
              </Typography>
            </Box>
            <Box className={styles.alertIssueRow}>
              <Typography className={styles.alertSummaryLabel}>Metric</Typography>
              <Typography className={styles.alertSummaryValue}>
                {formatAlertMetric(alert.metric)}
              </Typography>
            </Box>
          </Box>
          {alert.recommendedActions && (
            <Box className={styles.alertActionsSection}>
              <Typography component="h3" className={styles.alertActionsTitle}>
                Recommended Actions
              </Typography>
              <Box component="ul" className={styles.alertRecommendedActions}>
                {alert.recommendedActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </Box>
            </Box>
          )}
          {hasResolveError && (
            <Typography className={styles.statusMessage} role="alert">
              The alert could not be resolved. Try again.
            </Typography>
          )}
        </Box>
      )}
    </DialogContent>
    <DialogActions className={styles.alertDialogActions}>
      <ButtonBase className={styles.alertCancelButton} onClick={onClose} disableRipple>
        Cancel
      </ButtonBase>
      <ButtonBase
        className={styles.alertResolvedButton}
        onClick={onResolve}
        disabled={isResolving || !alert}
        disableRipple
      >
        <img src={resolvedCheckIcon} alt="" aria-hidden="true" />
        {isResolving ? "Resolving..." : "Resolved"}
      </ButtonBase>
    </DialogActions>
  </Dialog>
);

type RecruiterDetailsDialogProps = {
  recruiterId: string;
  onClose: () => void;
};

const RecruiterDetailsDialog = ({ recruiterId, onClose }: RecruiterDetailsDialogProps) => {
  const detailQuery = useMancoRecruiterDetail(recruiterId);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="manco-recruiter-details-title"
    >
      <DialogTitle id="manco-recruiter-details-title" className={styles.detailDialogTitle}>
        <Box>
          <Typography component="h2" className={styles.detailName}>
            {detailQuery.data?.recruiter.fullName ?? "Recruiter details"}
          </Typography>
          {detailQuery.data && (
            <Typography className={styles.detailRole}>
              {detailQuery.data.recruiter.roleName}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers className={styles.detailDialogContent}>
        {detailQuery.isLoading && (
          <Typography className={styles.statusMessage} role="status">
            Loading recruiter details...
          </Typography>
        )}
        {detailQuery.isError && (
          <Typography className={styles.statusMessage} role="alert">
            Recruiter details could not be loaded.
          </Typography>
        )}
        {detailQuery.data && (
          <>
            <Typography component="h3" className={styles.detailSectionTitle}>
              Performance metrics
            </Typography>
            <Box className={styles.detailMetricsGrid}>
              <DetailMetric label="MTD Placements" value={detailQuery.data.metrics.mtdPlacements} />
              <DetailMetric label="Active Roles" value={detailQuery.data.metrics.activeRoles} />
              <DetailMetric label="Total Candidates" value={detailQuery.data.metrics.totalCandidates} />
              <DetailMetric
                label="Revenue Earned (MTD)"
                value={formatRevenue(detailQuery.data.metrics.revenueEarnedMtd)}
              />
              <DetailMetric
                label="Revenue Earned (YTD)"
                value={formatRevenue(detailQuery.data.metrics.revenueEarnedYtd)}
              />
              <DetailMetric
                label="Conversion"
                value={formatPercentage(detailQuery.data.metrics.conversionRate)}
              />
              <DetailMetric
                label="Average Candidates per Role"
                value={detailQuery.data.performanceSummary.averageCandidatesPerRole ?? "-"}
              />
            </Box>
            <Typography component="h3" className={styles.detailSectionTitle}>
              Pipeline distribution
            </Typography>
            <Box className={styles.detailPipelineGrid}>
              {PIPELINE_STAGES.map((stage) => (
                <DetailMetric
                  key={stage.key}
                  label={stage.label}
                  value={detailQuery.data!.pipelineDistribution[stage.key]}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className={styles.detailDialogActions}>
        <ButtonBase className={styles.dialogCloseButton} onClick={onClose}>
          Close
        </ButtonBase>
      </DialogActions>
    </Dialog>
  );
};

type DetailMetricProps = {
  label: string;
  value: string | number;
};

const DetailMetric = ({ label, value }: DetailMetricProps) => (
  <Box className={styles.detailMetric}>
    <Typography className={styles.detailMetricLabel}>{label}</Typography>
    <Typography className={styles.detailMetricValue}>{value}</Typography>
  </Box>
);