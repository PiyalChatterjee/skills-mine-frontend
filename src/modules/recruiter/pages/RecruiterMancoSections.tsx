import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import closeIcon from "@/assets/icons/close-icon.svg";
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
import { ROUTE_PATHS } from "@/routes/routePaths";
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
const PIPELINE_DISTRIBUTION_STAGES = PIPELINE_STAGES.filter(
  (stage) => stage.key !== "totalPipeline",
);
const PIPELINE_CHART_STAGES = PIPELINE_DISTRIBUTION_STAGES.filter(
  (stage) => stage.key !== "rejected",
);

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
  const navigate = useNavigate();
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(
    null,
  );
  const [openPipelineIds, setOpenPipelineIds] = useState<Set<string>>(
    () => new Set(),
  );
  const {
    activeSort,
    handleSearchChange,
    handleSortChange,
    recruiters,
    recruiterQuery,
    searchQuery,
  } = useMancoRecruiters();

  const togglePipeline = (recruiterId: string) => {
    setOpenPipelineIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(recruiterId)) {
        nextIds.delete(recruiterId);
      } else {
        nextIds.add(recruiterId);
      }
      return nextIds;
    });
  };

  const viewRecruiterPipeline = (recruiterId: string) => {
    setSelectedRecruiterId(null);
    navigate(
      ROUTE_PATHS.recruiterMancoPipeline.replace(
        ":recruiterId",
        encodeURIComponent(recruiterId),
      ),
    );
  };

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
          pipelineOpen={openPipelineIds.has(recruiter.recruiterId)}
          onTogglePipeline={() => togglePipeline(recruiter.recruiterId)}
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
          onViewPipeline={() => viewRecruiterPipeline(selectedRecruiterId)}
        />
      )}
    </>
  );
};

type EmployeeCardProps = {
  recruiter: MancoRecruiter;
  onViewDetails: (id: string) => void;
  pipelineOpen: boolean;
  onTogglePipeline: () => void;
};

const EmployeeCard = ({
  recruiter,
  onViewDetails,
  pipelineOpen,
  onTogglePipeline,
}: EmployeeCardProps) => {
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
        onClick={onTogglePipeline}
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
            <PipelineDistributionChart
              distribution={pipelineQuery.data.pipelineDistribution}
            />
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

type PipelineDistributionChartProps = {
  distribution: MancoPipelineDistribution;
};

const PipelineDistributionChart = ({
  distribution,
}: PipelineDistributionChartProps) => {
  const pipelineTotal = Math.max(1, distribution.totalPipeline);

  return (
    <Box className={styles.detailPipelineGrid}>
      {PIPELINE_CHART_STAGES.map((stage) => {
        const count = distribution[stage.key];

        return (
          <Box
            key={stage.key}
            className={styles.detailPipelineRow}
            role="meter"
            aria-label={`${stage.label}: ${count}`}
            aria-valuemin={0}
            aria-valuemax={pipelineTotal}
            aria-valuenow={count}
            style={{
              width: count === 0 ? "100%" : `${(count / pipelineTotal) * 100}%`,
            }}
          >
            {count > 0 ? (
              <Box className={styles.detailPipelineBar} data-stage={stage.key}>
                <Box className={styles.detailPipelineTextGroup}>
                  <Typography className={styles.detailPipelineLabel}>
                    {stage.label}
                  </Typography>
                  <Typography className={styles.detailPipelineValue}>
                    {count}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box className={styles.detailPipelineZeroRow}>
                <Typography className={styles.detailPipelineLabel}>
                  {stage.label}
                </Typography>
                <Typography className={styles.detailPipelineValue}>
                  {count}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
      <Box
        className={styles.detailRejectedRow}
        role="meter"
        aria-label={`Rejected: ${distribution.rejected}`}
        aria-valuemin={0}
        aria-valuemax={pipelineTotal}
        aria-valuenow={distribution.rejected}
      >
        {distribution.rejected > 0 && (
          <Box className={styles.detailRejectedMarker} aria-hidden="true" />
        )}
        <Typography className={styles.detailRejectedLabel}>
          Rejected
        </Typography>
        <Typography className={styles.detailRejectedValue}>
          {distribution.rejected}
        </Typography>
      </Box>
    </Box>
  );
};

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
  onViewPipeline: () => void;
};

const RecruiterDetailsDialog = ({
  recruiterId,
  onClose,
  onViewPipeline,
}: RecruiterDetailsDialogProps) => {
  const detailQuery = useMancoRecruiterDetail(recruiterId);
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      fullWidth
      aria-labelledby="manco-recruiter-details-title"
      slotProps={{ paper: { className: styles.detailDialogPaper } }}
    >
      <DialogTitle id="manco-recruiter-details-title" className={styles.detailDialogTitle}>
        <Box className={styles.detailHeading}>
          <Typography component="h2" className={styles.detailName}>
            {detailQuery.data?.recruiter.fullName ?? "Recruiter details"}
          </Typography>
          {detailQuery.data && (
            <Typography className={styles.detailRole}>
              {detailQuery.data.recruiter.roleName}
            </Typography>
          )}
        </Box>
        <ButtonBase
          className={styles.detailCloseButton}
          onClick={onClose}
          aria-label="Close recruiter details"
          disableRipple
        >
          <img src={closeIcon} alt="" aria-hidden="true" />
        </ButtonBase>
      </DialogTitle>
      <DialogContent className={styles.detailDialogContent}>
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
            <Box className={styles.detailMetricsGrid}>
              <DetailMetric label="MTD Placements" value={detailQuery.data.metrics.mtdPlacements} />
              <DetailMetric label="Active Roles" value={detailQuery.data.metrics.activeRoles} />
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
            </Box>
            <Box className={styles.detailPipelineSection}>
              <Typography component="h3" className={styles.detailSectionTitle}>
                Pipeline distribution
              </Typography>
              <PipelineDistributionChart
                distribution={detailQuery.data.pipelineDistribution}
              />
            </Box>
            <Box className={styles.detailPerformanceSection}>
              <Typography component="h3" className={styles.detailSectionTitle}>
                Performance Summary
              </Typography>
              <Box className={styles.detailPerformanceSummary}>
                <Typography className={styles.detailPerformanceLabel}>
                  Avg. Candidates per Role
                </Typography>
                <Typography className={styles.detailPerformanceValue}>
                  {detailQuery.data.performanceSummary.averageCandidatesPerRole ?? "-"}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className={styles.detailDialogActions}>
        <ButtonBase
          className={styles.detailCancelButton}
          onClick={onClose}
          disableRipple
        >
          Cancel
        </ButtonBase>
        <ButtonBase
          className={styles.detailViewPipelineButton}
          onClick={onViewPipeline}
          disabled={!detailQuery.data}
          disableRipple
        >
          View Pipeline
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