import { JobPostStatus, PipelineStageCode, PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Typography,
} from "@mui/material";
import { RecruiterSidebar } from "@/modules/recruiter/components/RecruiterSidebar";
import { RecruiterTour } from "@/modules/recruiter/components/RecruiterTour";
import { useMancoRecruiterDetail } from "@/modules/recruiter/hooks/useMancoDashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/app/auth/AuthContext";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { mandateApi } from "@/services/api/mandateApi";
import cvsDueIcon from "@/assets/recruiter/cvs-due.svg";
import interviewsIcon from "@/assets/recruiter/interviews.svg";
import offerLetterIcon from "@/assets/recruiter/offer-letter.svg";
import type {
  PipelineDashboardStats,
  PipelineApplication,
  PipelinesListData,
  RecruiterDashboardData,
  RecruiterMandatesData,
  UniversalPipelineItem,
} from "@/types/api";
import styles from "./RecruiterPage.module.css";

// ── Types ─────────────────────────────────────────────────────────────

type PipelineStageLabel = Exclude<PipelineLabel, typeof PipelineLabel.PLACED>;

type CardTone =
  | "cream"
  | "lilac"
  | "yellow"
  | "blush"
  | "ice"
  | "mint"
  | "success"
  | "danger";

type PipelineCard = {
  id: string;
  jobProfileId: string;
  title: string;
  fullTitle: string;
  company: string;
  companyIcon: string;
  tone: CardTone;
  stage: PipelineStageLabel;
};

type PipelineColumn = {
  label: PipelineStageLabel;
  colorClass: string;
  cards: PipelineCard[];
};

// ── Constants ─────────────────────────────────────────────────────────

/** Column skeleton — no cards; cards are loaded from the API. */
const PIPELINE_COLUMNS: PipelineColumn[] = [
  { label: PipelineLabel.INBOUND, colorClass: styles.colInbound, cards: [] },
  { label: PipelineLabel.SCREENING, colorClass: styles.colScreening, cards: [] },
  { label: PipelineLabel.ASSESSMENT, colorClass: styles.colAssessment, cards: [] },
  { label: PipelineLabel.INTERVIEW, colorClass: styles.colInterview, cards: [] },
  { label: PipelineLabel.SHORTLIST, colorClass: styles.colShortlist, cards: [] },
  { label: PipelineLabel.OFFER, colorClass: styles.colOffer, cards: [] },
  { label: PipelineLabel.CLOSED, colorClass: styles.colClosed, cards: [] },
];

// ── Sub-components ────────────────────────────────────────────────────

type KpiCardProps = {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
};

const KpiCard = ({ value, label, icon, colorClass }: KpiCardProps) => (
  <Box className={`${styles.kpiCard} ${colorClass}`}>
    <Box className={styles.kpiTop}>
      <Typography component="p" className={styles.kpiValue}>
        {value}
      </Typography>
      <Box className={styles.kpiIcon} aria-hidden="true">
        {icon}
      </Box>
    </Box>
    <Typography component="p" className={styles.kpiLabel}>
      {label}
    </Typography>
    <Box className={styles.kpiSpacer} />
  </Box>
);

type PipelineCardProps = {
  card: PipelineCard;
  onView: (id: string, jobProfileId: string, stage: PipelineStageLabel) => void;
};

const PipelineCardItem = ({ card, onView }: PipelineCardProps) => {
  return (
    <Box
      className={`${styles.pipelineCard} ${styles[`card${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}
    >
      <Typography
        component="p"
        className={styles.pipelineCardTitle}
        title={card.fullTitle}
      >
        {card.title}
      </Typography>
      <Box className={styles.pipelineCardCompany}>
        <Typography component="span" className={styles.pipelineCardCompanyName}>
          {card.company}
        </Typography>
      </Box>
      <Box className={styles.pipelineCardActions}>
        <ButtonBase
          className={styles.pipelineCardViewBtn}
          onClick={() => onView(card.id, card.jobProfileId, card.stage)}
          disableRipple
          aria-label="View"
        >
          <span className={styles.pipelineCardViewBtnIcon} aria-hidden="true" />
          View
        </ButtonBase>
      </Box>
    </Box>
  );
};

// ── Pipeline helpers ──────────────────────────────────────────────────

const STAGE_CODE_MAP: Record<string, PipelineStageLabel> = {
  [PipelineStageCode.INBOUND]: PipelineLabel.INBOUND,
  [PipelineStageCode.SCREENING]: PipelineLabel.SCREENING,
  [PipelineStageCode.ASSESSMENT]: PipelineLabel.ASSESSMENT,
  [PipelineStageCode.INTERVIEW]: PipelineLabel.INTERVIEW,
  [PipelineStageCode.SHORTLIST]: PipelineLabel.SHORTLIST,
  [PipelineStageCode.SHORTLISTED]: PipelineLabel.SHORTLIST,
  [PipelineStageCode.OFFER]: PipelineLabel.OFFER,
  [PipelineStageCode.CLOSED]: PipelineLabel.CLOSED,
};

const STAGE_TONE_MAP: Record<PipelineStageLabel, CardTone> = {
  [PipelineLabel.INBOUND]: "cream",
  [PipelineLabel.SCREENING]: "lilac",
  [PipelineLabel.ASSESSMENT]: "yellow",
  [PipelineLabel.INTERVIEW]: "blush",
  [PipelineLabel.SHORTLIST]: "ice",
  [PipelineLabel.OFFER]: "mint",
  [PipelineLabel.CLOSED]: "danger",
};

const truncate = (text: string, max = 16) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const mapUniversalItemToCard = (
  item: UniversalPipelineItem,
): PipelineCard | null => {
  const resolvedStatus =
    item.jobStatus?.toUpperCase() === JobPostStatus.POSTED &&
    item.pipelineStatus?.toUpperCase() === PipelineStageCode.CLOSED
      ? PipelineStageCode.OFFER
      : item.pipelineStatus.toUpperCase();
  const stage = STAGE_CODE_MAP[resolvedStatus];
  if (!stage) return null;
  return {
    id: item.jobProfileId,
    jobProfileId: item.jobProfileId,
    title: truncate(item.positionTitle),
    fullTitle: item.positionTitle,
    company: truncate(item.clientName, 18),
    companyIcon: item.clientName.charAt(0).toUpperCase(),
    tone: STAGE_TONE_MAP[stage],
    stage,
  };
};

const buildColumnsFromApi = (
  items: UniversalPipelineItem[],
  baseColumns: PipelineColumn[],
): PipelineColumn[] => {
  const cardsByStage: Record<PipelineStageLabel, PipelineCard[]> = {
    [PipelineLabel.INBOUND]: [],
    [PipelineLabel.SCREENING]: [],
    [PipelineLabel.ASSESSMENT]: [],
    [PipelineLabel.INTERVIEW]: [],
    [PipelineLabel.SHORTLIST]: [],
    [PipelineLabel.OFFER]: [],
    [PipelineLabel.CLOSED]: [],
  };

  for (const item of items) {
    const card = mapUniversalItemToCard(item);
    if (card) {
      cardsByStage[card.stage].push(card);
    }
  }

  return baseColumns.map((col) => ({
    ...col,
    cards: cardsByStage[col.label],
  }));
};

export const buildColumnsFromApplications = (
  applications: PipelineApplication[],
  baseColumns: PipelineColumn[],
): PipelineColumn[] => {
  const cardsByStage: Record<PipelineStageLabel, PipelineCard[]> = {
    [PipelineLabel.INBOUND]: [],
    [PipelineLabel.SCREENING]: [],
    [PipelineLabel.ASSESSMENT]: [],
    [PipelineLabel.INTERVIEW]: [],
    [PipelineLabel.SHORTLIST]: [],
    [PipelineLabel.OFFER]: [],
    [PipelineLabel.CLOSED]: [],
  };
  const cardsByJobProfileId = new Map<string, PipelineCard>();

  for (const application of applications) {
    const stage = STAGE_CODE_MAP[application.currentStageCode?.toUpperCase()];
    const jobProfileId = application.jobProfile?.jobProfileId;
    if (!stage || !jobProfileId) {
      continue;
    }

    const existingCard = cardsByJobProfileId.get(jobProfileId);
    const stageIndex = baseColumns.findIndex((column) => column.label === stage);
    const existingStageIndex = existingCard
      ? baseColumns.findIndex((column) => column.label === existingCard.stage)
      : -1;
    if (stageIndex <= existingStageIndex) {
      continue;
    }

    const positionTitle =
      application.jobProfile?.positionTitle ?? "Untitled Position";
    const clientName = application.jobProfile?.clientName ?? "Company";

    cardsByJobProfileId.set(jobProfileId, {
      id: jobProfileId,
      jobProfileId,
      title: truncate(positionTitle),
      fullTitle: positionTitle,
      company: truncate(clientName, 18),
      companyIcon: clientName.charAt(0).toUpperCase() || "C",
      tone: STAGE_TONE_MAP[stage],
      stage,
    });
  }

  for (const card of cardsByJobProfileId.values()) {
    cardsByStage[card.stage].push(card);
  }

  return baseColumns.map((column) => ({
    ...column,
    cards: cardsByStage[column.label],
  }));
};

// ── Main Component ────────────────────────────────────────────────────

const CARDS_VISIBLE = 4;

const RecruiterPage = () => {
  const { recruiterId } = useParams<{ recruiterId?: string }>();
  const employeeQuery = useMancoRecruiterDetail(
    recruiterId ?? "",
    Boolean(recruiterId),
  );
  usePageTitle(recruiterId ? "Recruitment Pipeline" : "Recruiter Dashboard");
  const navigate = useNavigate();
  const { isFirstLogin } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<RecruiterDashboardData | null>(null);
  const [pipelineDashboardStats, setPipelineDashboardStats] =
    useState<PipelineDashboardStats | null>(null);
  const [mandatesData, setMandatesData] =
    useState<RecruiterMandatesData | null>(null);
  const [employeePipelineData, setEmployeePipelineData] =
    useState<PipelinesListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<PipelineColumn[]>(PIPELINE_COLUMNS);
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        setEmployeePipelineData(null);

        if (recruiterId) {
          const pipelineResponse = await mandateApi.listPipelines({
            recruiterId,
            page: 1,
            size: 100,
          });

          if (!isActive) {
            return;
          }

          setEmployeePipelineData(pipelineResponse);
          setColumns(
            buildColumnsFromApplications(
              pipelineResponse.data,
              PIPELINE_COLUMNS,
            ),
          );
          return;
        }

        const [
          dashboardResponse,
          pipelineDashboardResponse,
          universalPipelinesResponse,
          mandatesResponse,
        ] = await Promise.all([
          mandateApi.getRecruiterDashboard(),
          mandateApi.getPipelineDashboard(),
          mandateApi.listUniversalPipelines({ page: 1, size: 100 }),
          mandateApi.listRecruiterMandates({ page: 1, limit: 12 }),
        ]);

        if (!isActive) {
          return;
        }

        setDashboardData(dashboardResponse.data);
        setPipelineDashboardStats(pipelineDashboardResponse);
        setMandatesData(mandatesResponse.data);
        setColumns(
          buildColumnsFromApi(
            universalPipelinesResponse.data,
            PIPELINE_COLUMNS,
          ),
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          typeof error === "object" && error !== null && "message" in error
            ? String(
                (error as { message?: unknown }).message ??
                  `Failed to load ${recruiterId ? "recruiter pipeline" : "recruiter dashboard"}.`,
              )
            : `Failed to load ${recruiterId ? "recruiter pipeline" : "recruiter dashboard"}.`;
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [recruiterId]);

  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStageLabel, number> = {
      [PipelineLabel.INBOUND]: 0,
      [PipelineLabel.SCREENING]: 0,
      [PipelineLabel.ASSESSMENT]: 0,
      [PipelineLabel.INTERVIEW]: 0,
      [PipelineLabel.SHORTLIST]: 0,
      [PipelineLabel.OFFER]: 0,
      [PipelineLabel.CLOSED]: 0,
    };

    dashboardData?.pipeline.forEach((stage) => {
      const normalized = stage.stage.trim().toLowerCase();
      if (normalized === PipelineStageCode.INBOUND.toLowerCase()) counts.Inbound = stage.count;
      if (normalized === PipelineStageCode.SCREENING.toLowerCase()) counts.Screening = stage.count;
      if (normalized === PipelineStageCode.ASSESSMENT.toLowerCase()) counts.Assessment = stage.count;
      if (normalized === PipelineStageCode.INTERVIEW.toLowerCase()) counts.Interview = stage.count;
      if (normalized === PipelineStageCode.SHORTLISTED.toLowerCase() || normalized === PipelineStageCode.SHORTLIST.toLowerCase())
        counts.Shortlist = stage.count;
      if (normalized === PipelineStageCode.OFFER.toLowerCase()) counts.Offer = stage.count;
      if (normalized === PipelineStageCode.CLOSED.toLowerCase()) counts.Closed = stage.count;
    });

    return counts;
  }, [dashboardData]);

  const handleNewJobPost = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost);
  };

  const handleViewMore = () => {
    setAllExpanded(true);
  };

  const handleCardView = (_cardId: string, jobProfileId: string) => {
    navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", jobProfileId));
  };

  if (loading || (recruiterId && employeeQuery.isLoading)) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.shell}>
      {!recruiterId && <RecruiterTour isFirstLogin={isFirstLogin} />}
      <RecruiterSidebar />

      <Box
        className={`${styles.pageRoot} ${recruiterId ? styles.employeePipelinePage : ""}`}
      >
        {recruiterId && (
          <Box
            component="nav"
            aria-label="Breadcrumb"
            className={styles.employeeBreadcrumbs}
          >
            <ButtonBase
              className={styles.employeeBackButton}
              onClick={() => navigate(ROUTE_PATHS.recruiterManco)}
              disableRipple
            >
              Back
            </ButtonBase>
            <ButtonBase
              className={styles.employeeBreadcrumbLink}
              onClick={() => navigate(ROUTE_PATHS.recruiterManco)}
              disableRipple
            >
              MANCO Dashboard
            </ButtonBase>
            <Box
              className={styles.employeeBreadcrumbChevron}
              aria-hidden="true"
            />
            <Typography
              className={styles.employeeBreadcrumbCurrent}
              aria-current="page"
            >
              {`${employeeQuery.data?.recruiter.fullName ?? "Employee"}'s Recruitment Pipeline`}
            </Typography>
          </Box>
        )}
        {(errorMessage || (recruiterId && employeeQuery.isError)) && (
          <Alert severity="error">
            {errorMessage ?? "Recruiter details could not be loaded."}
          </Alert>
        )}
        {!recruiterId && (
          <Box className={styles.pageHeader}>
            <Typography component="h1" className={styles.pageTitle}>
              Universal Job Pipeline
            </Typography>
            <Button
              variant="contained"
              className={styles.newMandateBtn}
              onClick={handleNewJobPost}
              disableElevation
            >
              New Job Post
            </Button>
          </Box>
        )}

        {/* ── Welcome Banner ── */}
        <Box
          component="section"
          className={styles.welcomeBanner}
          data-tour="welcome-banner"
        >
          <Box className={styles.welcomeTextCol}>
            <Typography component="p" className={styles.welcomeGreeting}>
              Hi{" "}
              {recruiterId
                ? (employeeQuery.data?.recruiter.fullName.split(" ")[0] ?? "")
                : "Michael"}
            </Typography>
            <Typography component="p" className={styles.welcomeSubtitle}>
              Here's a snapshot of what you need to do this week
            </Typography>
          </Box>
          <Box className={styles.kpiRow}>
            <KpiCard
              value={
                employeePipelineData?.stageCounters.INBOUND ??
                pipelineDashboardStats?.cvsDue ??
                stageCounts.Inbound
              }
              label={recruiterId ? "CVs to screen" : "CVs due"}
              icon={<img src={cvsDueIcon} width="22" height="22" alt="" />}
              colorClass={styles.kpiBlue}
            />
            <KpiCard
              value={
                employeePipelineData?.stageCounters.INTERVIEW ??
                pipelineDashboardStats?.interviewsToSchedule ??
                stageCounts.Interview
              }
              label="Interviews to schedule"
              icon={<img src={interviewsIcon} width="22" height="22" alt="" />}
              colorClass={styles.kpiPurple}
            />
            <KpiCard
              value={
                employeePipelineData?.stageCounters.OFFER ??
                pipelineDashboardStats?.offerLetterAcceptanceDeadline ??
                stageCounts.Offer
              }
              label="Offer Letter Acceptance Deadlines"
              icon={<img src={offerLetterIcon} width="22" height="22" alt="" />}
              colorClass={styles.kpiAmber}
            />
          </Box>
        </Box>

        {/* ── Recruitment Pipeline ── */}
        <Box component="section" className={styles.pipelineSection}>
          <Typography component="p" className={styles.sectionSubtitle}>
            {employeePipelineData
              ? `${new Set(employeePipelineData.data.map((application) => application.jobProfile.jobProfileId)).size} active Job Post${new Set(employeePipelineData.data.map((application) => application.jobProfile.jobProfileId)).size !== 1 ? "s" : ""} across ${new Set(employeePipelineData.data.map((application) => application.jobProfile.clientId)).size} ${new Set(employeePipelineData.data.map((application) => application.jobProfile.clientId)).size !== 1 ? "companies" : "company"}`
              : pipelineDashboardStats
                ? `${pipelineDashboardStats.activeJobs} active Job Post${pipelineDashboardStats.activeJobs !== 1 ? "s" : ""} across ${pipelineDashboardStats.companiesCount} ${pipelineDashboardStats.companiesCount !== 1 ? "companies" : "company"}`
                : `${mandatesData?.pagination.total ?? 0} active Job Post${(mandatesData?.pagination.total ?? 0) !== 1 ? "s" : ""} across ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size} ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size !== 1 ? "companies" : "company"}`}
          </Typography>

          <Box className={styles.pipelineWrapper}>
            <Box className={styles.pipelineScroll}>
              {/* Unified header bar */}
              <Box className={styles.pipelineHeader}>
                {columns.map((col) => (
                  <Box key={col.label} className={styles.colHeader}>
                    <Typography component="p" className={styles.colLabel}>
                      {col.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Cards board */}
              <Box className={styles.pipelineBoard}>
                {columns.map((col) => {
                  const visibleCards = allExpanded
                    ? col.cards
                    : col.cards.slice(0, CARDS_VISIBLE);
                  const hasMore =
                    !allExpanded && col.cards.length > CARDS_VISIBLE;
                  return (
                    <Box key={col.label} className={styles.pipelineColumn}>
                      <Box className={styles.colCards}>
                        {visibleCards.map((card) => (
                          <PipelineCardItem
                            key={card.id}
                            card={card}
                            onView={handleCardView}
                          />
                        ))}
                      </Box>

                      {hasMore && (
                        <ButtonBase
                          className={styles.viewMoreBtn}
                          onClick={handleViewMore}
                          disableRipple
                        >
                          View more
                        </ButtonBase>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RecruiterPage;
